import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from models import (
    db, PurchaseRequisition, PurchaseRequisitionItem, PurchaseOrder,
    PurchaseOrderItem, Delivery, Product, Supplier, ProcurementRecommendation, AuditLog
)
from services.procurement_service import ProcurementService
from utils.rbac import role_required

procurement_bp = Blueprint('procurement', __name__, url_prefix='/api/procurement')

@procurement_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    data = ProcurementService.get_procurement_dashboard_data()
    return jsonify(data), 200

@procurement_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    recs = ProcurementRecommendation.query.filter_by(status='Open').all()
    if not recs:
        ProcurementService.generate_procurement_recommendations()
        recs = ProcurementRecommendation.query.filter_by(status='Open').all()
    return jsonify({'recommendations': [r.to_dict() for r in recs]}), 200

@procurement_bp.route('/recommendations/generate', methods=['POST'])
@role_required('Admin', 'Manager')
def generate_recommendations():
    recs = ProcurementService.generate_procurement_recommendations()
    return jsonify({'message': f'Generated {len(recs)} procurement recommendations!', 'recommendations': recs}), 200

# Purchase Requisitions
@procurement_bp.route('/requisitions', methods=['GET'])
def get_requisitions():
    reqs = PurchaseRequisition.query.order_by(PurchaseRequisition.requested_date.desc()).all()
    return jsonify({'requisitions': [r.to_dict() for r in reqs]}), 200

@procurement_bp.route('/requisitions', methods=['POST'])
def create_requisition():
    data = request.get_json() or {}
    items = data.get('items', [])
    if not items:
        return jsonify({'error': 'Requisition must have at least one product item'}), 400

    req_num = f"REQ-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(100, 999)}"
    req = PurchaseRequisition(
        requisition_number=req_num,
        requested_by_id=data.get('user_id'),
        reason=data.get('reason', 'Stock replenishment'),
        priority=data.get('priority', 'Medium'),
        status='Pending'
    )
    db.session.add(req)
    db.session.flush()

    for it in items:
        prod = Product.query.get(it['product_id'])
        if prod:
            qty = int(it['quantity'])
            cost = qty * prod.cost_price
            db.session.add(PurchaseRequisitionItem(
                requisition_id=req.id,
                product_id=prod.id,
                quantity=qty,
                estimated_cost=cost
            ))

    db.session.commit()
    return jsonify({'message': 'Requisition created successfully', 'requisition': req.to_dict()}), 201

@procurement_bp.route('/requisitions/<int:req_id>/status', methods=['PUT'])
def update_requisition_status(req_id):
    req = PurchaseRequisition.query.get_or_404(req_id)
    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['Approved', 'Rejected', 'Converted to PO']:
        return jsonify({'error': 'Invalid status'}), 400

    req.status = new_status
    req.approval_notes = data.get('notes', '')

    # If converted to PO, create purchase order
    po_created = None
    if new_status == 'Converted to PO':
        items_payload = [{'product_id': it.product_id, 'quantity': it.quantity} for it in req.items]
        # Choose supplier of first item
        first_prod = req.items[0].product if req.items else None
        sup_id = 1
        if first_prod and first_prod.supplier_links:
            sup_id = first_prod.supplier_links[0].supplier_id

        po_created = ProcurementService.create_purchase_order({
            'supplier_id': sup_id,
            'items': items_payload,
            'notes': f"Converted from requisition {req.requisition_number}"
        })

    db.session.commit()
    return jsonify({'message': f'Requisition {new_status}', 'requisition': req.to_dict(), 'po': po_created}), 200

# Purchase Orders
@procurement_bp.route('/purchase-orders', methods=['GET'])
def get_purchase_orders():
    status = request.args.get('status')
    query = PurchaseOrder.query
    if status and status != 'All':
        query = query.filter_by(status=status)
    pos = query.order_by(PurchaseOrder.order_date.desc()).all()
    return jsonify({'purchase_orders': [p.to_dict() for p in pos]}), 200

@procurement_bp.route('/purchase-orders', methods=['POST'])
@role_required('Admin', 'Manager')
def create_purchase_order():
    data = request.get_json() or {}
    try:
        po_data = ProcurementService.create_purchase_order(data)
        return jsonify({'message': 'Purchase Order created successfully', 'purchase_order': po_data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@procurement_bp.route('/purchase-orders/<int:po_id>/status', methods=['PUT'])
def update_purchase_order_status(po_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    notes = data.get('notes')

    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    po_data = ProcurementService.update_po_status(po_id, new_status, notes=notes)
    if not po_data:
        return jsonify({'error': 'Purchase Order not found'}), 404

    return jsonify({
        'message': f'Purchase Order status updated to {new_status}' + (' (Inventory automatically replenished!)' if new_status == 'Received' else ''),
        'purchase_order': po_data
    }), 200

@procurement_bp.route('/analytics', methods=['GET'])
@procurement_bp.route('/cost-analytics', methods=['GET'])
def get_analytics():
    data = ProcurementService.get_procurement_cost_analytics()
    return jsonify(data), 200
