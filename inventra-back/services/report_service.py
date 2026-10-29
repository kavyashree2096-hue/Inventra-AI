import io
import csv
from datetime import datetime
from models import db, Product, Sale, SaleItem, Supplier, PurchaseOrder, ReorderRecommendation, Alert
from services.inventory_service import InventoryService

class ReportService:

    @staticmethod
    def get_management_summary():
        """
        Comprehensive management summary report.
        """
        health = InventoryService.get_inventory_health()
        total_products = Product.query.count()
        total_sales = db.session.query(db.func.sum(Sale.net_amount)).scalar() or 0.0
        total_orders = Sale.query.count()
        total_inventory_val = db.session.query(db.func.sum(Product.current_stock * Product.cost_price)).scalar() or 0.0
        total_procurement_val = db.session.query(db.func.sum(PurchaseOrder.total_amount))\
            .filter(PurchaseOrder.status.in_(['Ordered', 'In Transit', 'Received'])).scalar() or 0.0
        open_pos = PurchaseOrder.query.filter(PurchaseOrder.status.in_(['Ordered', 'In Transit'])).count()

        return {
            'generated_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
            'inventory_health_score': health['score'],
            'inventory_health_status': health['status'],
            'total_products': total_products,
            'total_inventory_value': round(float(total_inventory_val), 2),
            'total_sales_revenue': round(float(total_sales), 2),
            'total_sales_transactions': total_orders,
            'total_procurement_spend': round(float(total_procurement_val), 2),
            'open_purchase_orders': open_pos,
            'low_stock_count': health['critical_items'] + health['low_stock_items'],
            'stock_outs': health['stock_outs'],
            'overstock_count': health['overstock_items']
        }

    @staticmethod
    def export_csv(report_type):
        """
        Exports CSV string for different report types:
        - 'inventory': Product SKU, Name, Category, Stock, Min, Max, Safety, Cost, Price, Value, Status
        - 'sales': Invoice, Date, Store, Payment Method, Amount, Status
        - 'reorders': Product, SKU, Current Stock, Predicted Demand, Reorder Qty, Priority, Reason
        - 'procurement': PO Number, Supplier, Order Date, Status, Total Amount
        """
        output = io.StringIO()
        writer = csv.writer(output)

        if report_type == 'inventory':
            writer.writerow(['SKU', 'Product Name', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Safety Stock', 'Cost Price', 'Selling Price', 'Inventory Value', 'Status'])
            products = Product.query.all()
            for p in products:
                writer.writerow([
                    p.sku, p.name, p.category.name if p.category else '',
                    p.current_stock, p.min_stock, p.max_stock, p.safety_stock,
                    p.cost_price, p.selling_price, round(p.current_stock * p.cost_price, 2), p.status
                ])

        elif report_type == 'sales':
            writer.writerow(['Invoice Number', 'Sale Date', 'Store', 'Payment Method', 'Gross Amount', 'Discount', 'Net Amount', 'Status'])
            sales = Sale.query.order_by(Sale.sale_date.desc()).limit(500).all()
            for s in sales:
                writer.writerow([
                    s.invoice_number, s.sale_date.strftime('%Y-%m-%d %H:%M'),
                    s.store.name if s.store else '', s.payment_method,
                    s.total_amount, s.discount_amount, s.net_amount, s.status
                ])

        elif report_type == 'reorders':
            writer.writerow(['Product SKU', 'Product Name', 'Current Stock', 'Predicted Demand', 'Reorder Quantity', 'Priority', 'Reason'])
            recs = ReorderRecommendation.query.all()
            for r in recs:
                writer.writerow([
                    r.product.sku if r.product else '',
                    r.product.name if r.product else '',
                    r.current_stock, r.predicted_demand,
                    r.reorder_quantity, r.priority, r.reason
                ])

        elif report_type == 'procurement':
            writer.writerow(['PO Number', 'Supplier', 'Order Date', 'Expected Delivery', 'Status', 'Total Amount'])
            pos = PurchaseOrder.query.order_by(PurchaseOrder.order_date.desc()).all()
            for po in pos:
                writer.writerow([
                    po.po_number,
                    po.supplier.company if po.supplier else '',
                    po.order_date.strftime('%Y-%m-%d') if po.order_date else '',
                    po.expected_delivery.strftime('%Y-%m-%d') if po.expected_delivery else '',
                    po.status, po.total_amount
                ])

        return output.getvalue()
