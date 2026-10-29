import random
from datetime import datetime, timedelta
from models import (
    db, User, Category, Product, Store, Warehouse, InventoryItem,
    InventoryMovement, Supplier, SupplierProduct, Sale, SaleItem,
    PurchaseOrder, PurchaseOrderItem, Delivery, Alert, AuditLog,
    SystemSetting
)
from ml.train_model import train_forecasting_models
from services.forecasting_service import ForecastingService
from services.reorder_service import ReorderService
from services.procurement_service import ProcurementService

def seed_database():
    """
    Idempotent database seeder that populates realistic demo retail data.
    """
    if User.query.first():
        print("Database already contains data. Skipping full seed.")
        return

    print("Seeding Inventra AI database with commercial retail data...")

    # 1. Users
    admin = User(
        full_name="Alex Mercer (Admin)",
        email="admin@inventra.ai",
        role="Admin",
        phone="+1 (555) 019-2831",
        status="Active"
    )
    admin.set_password("admin123")

    manager = User(
        full_name="Sarah Jenkins (Manager)",
        email="manager@inventra.ai",
        role="Manager",
        phone="+1 (555) 019-8822",
        status="Active"
    )
    manager.set_password("manager123")

    staff = User(
        full_name="Marcus Vance (Staff)",
        email="staff@inventra.ai",
        role="Staff",
        phone="+1 (555) 019-4411",
        status="Active"
    )
    staff.set_password("staff123")

    db.session.add_all([admin, manager, staff])
    db.session.flush()

    # 2. Stores & Warehouses
    stores_data = [
        {"name": "Downtown Flagship Superstore", "code": "STR-001", "city": "New York", "location": "5th Avenue & 42nd St"},
        {"name": "Metro Galleria Hub", "code": "STR-002", "city": "Chicago", "location": "Michigan Avenue Mall"},
        {"name": "Bay Area Tech Center", "code": "STR-003", "city": "San Francisco", "location": "Market Street Terminal"},
        {"name": "Austin Fulfillment Depot", "code": "STR-004", "city": "Austin", "location": "Congress Ave Hub"}
    ]
    stores = [Store(**s) for s in stores_data]
    db.session.add_all(stores)

    warehouses_data = [
        {"name": "Central Distribution Hub (North)", "code": "WH-01", "location": "New Jersey Port Logistics", "capacity_units": 85000},
        {"name": "Midwest Logistics Facility (Central)", "code": "WH-02", "location": "O'Hare Logistics Park, IL", "capacity_units": 50000},
        {"name": "West Coast Terminal (Pacific)", "code": "WH-03", "location": "Long Beach Gateway, CA", "capacity_units": 40000}
    ]
    warehouses = [Warehouse(**w) for w in warehouses_data]
    db.session.add_all(warehouses)
    db.session.flush()

    # 3. Categories
    categories_data = [
        {"name": "Electronics & Gadgets", "description": "High-performance tech, peripherals, audio, and smart devices", "icon": "Cpu"},
        {"name": "Home & Living", "description": "Ergonomic furniture, smart appliances, lighting, and organizers", "icon": "Home"},
        {"name": "Apparel & Accessories", "description": "Premium apparel, travel gear, footwear, and backpacks", "icon": "Shirt"},
        {"name": "Health & Personal Care", "description": "Wellness devices, skincare, organic care, and personal grooming", "icon": "HeartPulse"},
        {"name": "Gourmet & Pantry", "description": "Artisan coffee, specialty provisions, and pantry staples", "icon": "Coffee"}
    ]
    categories = [Category(**c) for c in categories_data]
    db.session.add_all(categories)
    db.session.flush()

    # 4. Suppliers
    suppliers_data = [
        {
            "name": "Apex Electronics Corp", "company": "Apex Global Tech Ltd", "contact_person": "Kenji Sato",
            "email": "procurement@apexcorp.com", "phone": "+1 800-555-0144", "address": "742 Evergreen Pkwy, San Jose, CA",
            "rating": 4.9, "reliability_score": 97.5, "delivery_performance_pct": 98.0, "lead_time_days": 3
        },
        {
            "name": "Nexa Logistics & Components", "company": "Nexa Distribution Group", "contact_person": "Elena Rostova",
            "email": "orders@nexalogistics.de", "phone": "+49 30 901820", "address": "Kaiserstraße 12, Frankfurt, Germany",
            "rating": 4.7, "reliability_score": 93.8, "delivery_performance_pct": 94.2, "lead_time_days": 5
        },
        {
            "name": "PrimeSource Wholesale", "company": "PrimeSource Supply Chain Co", "contact_person": "David Miller",
            "email": "sales@primesource.com", "phone": "+1 312-555-0189", "address": "400 W Madison, Chicago, IL",
            "rating": 4.5, "reliability_score": 91.2, "delivery_performance_pct": 92.0, "lead_time_days": 4
        },
        {
            "name": "ZenFlow Eco Manufacturing", "company": "ZenFlow Sustainable Goods", "contact_person": "Maya Patel",
            "email": "supply@zenfloweco.com", "phone": "+1 503-555-0177", "address": "1200 NW Naito Pkwy, Portland, OR",
            "rating": 4.8, "reliability_score": 96.0, "delivery_performance_pct": 95.5, "lead_time_days": 6
        },
        {
            "name": "Vanguard Precision Industrial", "company": "Vanguard Industrial Trading", "contact_person": "Min-Jun Kim",
            "email": "b2b@vanguardind.kr", "phone": "+82 2-555-0199", "address": "Gangnam-daero 321, Seoul, South Korea",
            "rating": 4.3, "reliability_score": 88.5, "delivery_performance_pct": 89.0, "lead_time_days": 7
        }
    ]
    suppliers = [Supplier(**s) for s in suppliers_data]
    db.session.add_all(suppliers)
    db.session.flush()

    # 5. Products Catalog (18 realistic items with HD Unsplash URLs)
    products_seed = [
        # Electronics
        {
            "sku": "SKU-TECH-001", "name": "Wireless ANC Headphones Pro", "category_id": categories[0].id,
            "description": "High-fidelity active noise-cancelling over-ear headphones with 40h battery and multipoint Bluetooth 5.4.",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            "selling_price": 249.99, "cost_price": 145.00, "current_stock": 8, "min_stock": 15, "max_stock": 120,
            "safety_stock": 20, "reorder_point": 30, "lead_time_days": 3, "status": "Critical", "unit": "Units"
        },
        {
            "sku": "SKU-TECH-002", "name": "Ergonomic Mechanical Keyboard", "category_id": categories[0].id,
            "description": "Hot-swappable mechanical keyboard with lubricated tactile switches and custom PBT keycaps.",
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
            "selling_price": 129.99, "cost_price": 68.00, "current_stock": 14, "min_stock": 10, "max_stock": 100,
            "safety_stock": 15, "reorder_point": 25, "lead_time_days": 4, "status": "Low Stock", "unit": "Units"
        },
        {
            "sku": "SKU-TECH-003", "name": "UltraHD 4K Curved Monitor 32\"", "category_id": categories[0].id,
            "description": "Curved 144Hz IPS display with HDR600, USB-C 90W power delivery, and ultra-thin bezels.",
            "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
            "selling_price": 499.99, "cost_price": 310.00, "current_stock": 35, "min_stock": 8, "max_stock": 60,
            "safety_stock": 10, "reorder_point": 18, "lead_time_days": 5, "status": "Healthy", "unit": "Units"
        },
        {
            "sku": "SKU-TECH-004", "name": "Smart Fitness Watch Series 9", "category_id": categories[0].id,
            "description": "All-day heart rate, SpO2, ECG, dual-frequency GPS tracking with sapphire crystal display.",
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
            "selling_price": 199.99, "cost_price": 110.00, "current_stock": 0, "min_stock": 12, "max_stock": 90,
            "safety_stock": 18, "reorder_point": 28, "lead_time_days": 3, "status": "Stock-Out", "unit": "Units"
        },
        {
            "sku": "SKU-TECH-005", "name": "20,000mAh Magnetic Power Bank", "category_id": categories[0].id,
            "description": "High-density fast charging wireless magnetic power bank with digital percentage display.",
            "image_url": "https://images.unsplash.com/photo-1609592424368-e4ebda0a4731?w=600&auto=format&fit=crop&q=80",
            "selling_price": 59.99, "cost_price": 28.50, "current_stock": 92, "min_stock": 20, "max_stock": 150,
            "safety_stock": 25, "reorder_point": 40, "lead_time_days": 3, "status": "Healthy", "unit": "Units"
        },

        # Home & Living
        {
            "sku": "SKU-HOME-001", "name": "Smart Air Purifier HEPA H13", "category_id": categories[1].id,
            "description": "Medical-grade True HEPA filtration with laser PM2.5 air quality sensor and mobile app control.",
            "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80",
            "selling_price": 189.99, "cost_price": 95.00, "current_stock": 18, "min_stock": 10, "max_stock": 80,
            "safety_stock": 12, "reorder_point": 22, "lead_time_days": 4, "status": "Low Stock", "unit": "Units"
        },
        {
            "sku": "SKU-HOME-002", "name": "Minimalist Bamboo Desk Organizer", "category_id": categories[1].id,
            "description": "Eco-friendly natural bamboo modular organizer with wireless phone dock and pen tray.",
            "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
            "selling_price": 39.99, "cost_price": 16.00, "current_stock": 160, "min_stock": 25, "max_stock": 120,
            "safety_stock": 20, "reorder_point": 35, "lead_time_days": 5, "status": "Overstock", "unit": "Units"
        },
        {
            "sku": "SKU-HOME-003", "name": "Smart LED Desk Lamp Qi Charger", "category_id": categories[1].id,
            "description": "Stepless color temperature adjustment, eye-caring CRI>95 light with 15W Qi charging base.",
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
            "selling_price": 69.99, "cost_price": 32.00, "current_stock": 45, "min_stock": 15, "max_stock": 100,
            "safety_stock": 18, "reorder_point": 30, "lead_time_days": 4, "status": "Healthy", "unit": "Units"
        },
        {
            "sku": "SKU-HOME-004", "name": "Precision Ceramic Knife Set", "category_id": categories[1].id,
            "description": "Hand-honed zirconium ceramic 5-piece culinary kitchen set with matching sheath covers.",
            "image_url": "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&auto=format&fit=crop&q=80",
            "selling_price": 89.99, "cost_price": 40.00, "current_stock": 6, "min_stock": 10, "max_stock": 60,
            "safety_stock": 10, "reorder_point": 18, "lead_time_days": 6, "status": "Critical", "unit": "Sets"
        },
        {
            "sku": "SKU-HOME-005", "name": "Compact Barista Espresso Machine", "category_id": categories[1].id,
            "description": "15-bar Italian pump with manual steam wand, thermoblock heating, and stainless exterior.",
            "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
            "selling_price": 279.99, "cost_price": 160.00, "current_stock": 22, "min_stock": 8, "max_stock": 40,
            "safety_stock": 8, "reorder_point": 14, "lead_time_days": 5, "status": "Healthy", "unit": "Units"
        },

        # Gourmet & Pantry
        {
            "sku": "SKU-PANTRY-001", "name": "Organic Arabica Beans 1kg", "category_id": categories[4].id,
            "description": "Fair-trade shade-grown whole bean medium-dark roast with chocolate and hazelnut notes.",
            "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
            "selling_price": 28.99, "cost_price": 12.50, "current_stock": 12, "min_stock": 20, "max_stock": 200,
            "safety_stock": 25, "reorder_point": 40, "lead_time_days": 3, "status": "Low Stock", "unit": "Bags"
        },
        {
            "sku": "SKU-PANTRY-002", "name": "Cold-Pressed Extra Virgin Olive Oil 750ml", "category_id": categories[4].id,
            "description": "Estate-bottled single estate Greek Koroneiki olives, high polyphenols, acidity <0.2%.",
            "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
            "selling_price": 24.99, "cost_price": 11.00, "current_stock": 70, "min_stock": 15, "max_stock": 120,
            "safety_stock": 20, "reorder_point": 30, "lead_time_days": 4, "status": "Healthy", "unit": "Bottles"
        },

        # Apparel & Accessories
        {
            "sku": "SKU-WEAR-001", "name": "Heavyweight Organic Hoodie", "category_id": categories[2].id,
            "description": "500 GSM French terry 100% certified organic cotton with double-needle ribbed accents.",
            "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
            "selling_price": 79.99, "cost_price": 34.00, "current_stock": 55, "min_stock": 15, "max_stock": 100,
            "safety_stock": 18, "reorder_point": 28, "lead_time_days": 5, "status": "Healthy", "unit": "Units"
        },
        {
            "sku": "SKU-WEAR-002", "name": "Anti-Theft Commuter Backpack", "category_id": categories[2].id,
            "description": "Water-resistant recycled Cordura fabric, hidden RFID pocket, and padded 16\" laptop sleeve.",
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
            "selling_price": 99.99, "cost_price": 45.00, "current_stock": 9, "min_stock": 12, "max_stock": 80,
            "safety_stock": 15, "reorder_point": 25, "lead_time_days": 4, "status": "Critical", "unit": "Units"
        },
        {
            "sku": "SKU-WEAR-003", "name": "Breathable Knit Trainers", "category_id": categories[2].id,
            "description": "Lightweight responsive foam midsole with recycled knit upper and non-marking traction outsole.",
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
            "selling_price": 119.99, "cost_price": 52.00, "current_stock": 68, "min_stock": 20, "max_stock": 120,
            "safety_stock": 22, "reorder_point": 35, "lead_time_days": 6, "status": "Healthy", "unit": "Pairs"
        },

        # Health & Personal Care
        {
            "sku": "SKU-HEALTH-001", "name": "Hydrating Hyaluronic Serum 50ml", "category_id": categories[3].id,
            "description": "Multi-molecular weight hyaluronic acid enriched with Vitamin B5 for deep cellular hydration.",
            "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
            "selling_price": 34.99, "cost_price": 13.50, "current_stock": 135, "min_stock": 25, "max_stock": 110,
            "safety_stock": 20, "reorder_point": 35, "lead_time_days": 4, "status": "Overstock", "unit": "Bottles"
        },
        {
            "sku": "SKU-HEALTH-002", "name": "Sonic Electric Toothbrush", "category_id": categories[3].id,
            "description": "40,000 vibrations/min maglev motor, wireless inductive charging stand, and quad-pacer timer.",
            "image_url": "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=600&auto=format&fit=crop&q=80",
            "selling_price": 59.99, "cost_price": 26.00, "current_stock": 42, "min_stock": 15, "max_stock": 90,
            "safety_stock": 18, "reorder_point": 26, "lead_time_days": 4, "status": "Healthy", "unit": "Units"
        },
        {
            "sku": "SKU-WEAR-004", "name": "Insulated Stainless Flask 1L", "category_id": categories[2].id,
            "description": "Double-wall vacuum insulation maintains icy cold for 24h or steaming hot for 12h.",
            "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
            "selling_price": 32.99, "cost_price": 14.00, "current_stock": 58, "min_stock": 18, "max_stock": 100,
            "safety_stock": 20, "reorder_point": 32, "lead_time_days": 3, "status": "Healthy", "unit": "Units"
        }
    ]

    products = [Product(**p) for p in products_seed]
    db.session.add_all(products)
    db.session.flush()

    # 6. Supplier Products (Multiple supplier options per product for comparison engine)
    for p in products:
        # Preferred supplier
        sup_primary = suppliers[p.id % len(suppliers)]
        sp1 = SupplierProduct(
            supplier_id=sup_primary.id,
            product_id=p.id,
            unit_price=p.cost_price,
            min_order_qty=15,
            lead_time_days=sup_primary.lead_time_days,
            is_preferred=True
        )
        db.session.add(sp1)

        # Alternative supplier 1
        sup_alt1 = suppliers[(p.id + 1) % len(suppliers)]
        sp2 = SupplierProduct(
            supplier_id=sup_alt1.id,
            product_id=p.id,
            unit_price=round(p.cost_price * 1.05, 2),
            min_order_qty=25,
            lead_time_days=max(2, sup_alt1.lead_time_days - 1),
            is_preferred=False
        )
        db.session.add(sp2)

        # Alternative supplier 2
        sup_alt2 = suppliers[(p.id + 2) % len(suppliers)]
        sp3 = SupplierProduct(
            supplier_id=sup_alt2.id,
            product_id=p.id,
            unit_price=round(p.cost_price * 0.96, 2),
            min_order_qty=50,
            lead_time_days=sup_alt2.lead_time_days + 2,
            is_preferred=False
        )
        db.session.add(sp3)

        # Inventory Items in Central Warehouse
        inv = InventoryItem(
            product_id=p.id,
            warehouse_id=warehouses[0].id,
            quantity_on_hand=p.current_stock,
            quantity_reserved=max(0, int(p.current_stock * 0.1)),
            quantity_incoming=30 if p.current_stock <= p.reorder_point else 0,
            last_restocked_at=datetime.utcnow() - timedelta(days=random.randint(2, 20))
        )
        db.session.add(inv)

    db.session.flush()

    # 7. Generate 90 days of realistic Sales Data
    print("Generating 90 days of sales transactions across stores...")
    now = datetime.utcnow()
    invoice_counter = 1000

    sales_batch = []
    items_batch = []

    for day_offset in range(90, 0, -1):
        sale_date = now - timedelta(days=day_offset, hours=random.randint(1, 10))
        day_of_week = sale_date.weekday()
        # Weekend sales boost
        num_sales_today = random.randint(12, 22) if day_of_week in [4, 5, 6] else random.randint(7, 14)

        for _ in range(num_sales_today):
            invoice_counter += 1
            store = random.choice(stores)
            payment = random.choice(['Credit Card', 'Apple Pay', 'Google Pay', 'Debit Card', 'Cash'])

            sale = Sale(
                invoice_number=f"INV-{sale_date.strftime('%Y%m')}-{invoice_counter}",
                store_id=store.id,
                sale_date=sale_date + timedelta(minutes=random.randint(10, 480)),
                total_amount=0.0,
                discount_amount=0.0,
                net_amount=0.0,
                payment_method=payment,
                status='Completed'
            )
            db.session.add(sale)
            db.session.flush()

            # 1 to 4 items in basket
            basket_size = random.randint(1, 4)
            chosen_products = random.sample(products, basket_size)
            sale_total = 0.0

            for prod in chosen_products:
                qty = random.randint(1, 3)
                line_total = qty * prod.selling_price
                sale_total += line_total

                item = SaleItem(
                    sale_id=sale.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=prod.selling_price,
                    cost_price=prod.cost_price,
                    total_price=line_total
                )
                db.session.add(item)

            sale.total_amount = sale_total
            sale.net_amount = sale_total

    db.session.flush()

    # 8. Purchase Orders (Draft, In Transit, Received)
    print("Creating realistic Purchase Orders and Deliveries...")
    # A few received POs from earlier
    po1 = PurchaseOrder(
        po_number="PO-20260915-8812",
        supplier_id=suppliers[0].id,
        order_date=now - timedelta(days=21),
        expected_delivery=now - timedelta(days=18),
        status="Received",
        total_amount=4350.00,
        notes="Automated replenishment batch for Q3 peak sales."
    )
    db.session.add(po1)
    db.session.flush()
    db.session.add(PurchaseOrderItem(po_id=po1.id, product_id=products[0].id, quantity=30, unit_price=145.0, total_price=4350.0))
    db.session.add(Delivery(
        po_id=po1.id,
        delivery_date=now - timedelta(days=18),
        actual_delivery_date=now - timedelta(days=18),
        status="Delivered",
        received_qty=30,
        tracking_number="TRK-98218731",
        carrier="Apex Air Cargo Express"
    ))

    # In Transit PO
    po2 = PurchaseOrder(
        po_number="PO-20261002-4421",
        supplier_id=suppliers[1].id,
        order_date=now - timedelta(days=3),
        expected_delivery=now + timedelta(days=2),
        status="In Transit",
        total_amount=3200.00,
        notes="Emergency shipment for ANC Headphones and Keyboards."
    )
    db.session.add(po2)
    db.session.flush()
    db.session.add(PurchaseOrderItem(po_id=po2.id, product_id=products[1].id, quantity=40, unit_price=68.0, total_price=2720.0))
    db.session.add(Delivery(
        po_id=po2.id,
        delivery_date=now + timedelta(days=2),
        status="In Transit",
        tracking_number="TRK-44192083",
        carrier="DHL Supply Chain Logistics"
    ))

    # Approved PO ready to dispatch
    po3 = PurchaseOrder(
        po_number="PO-20261005-9132",
        supplier_id=suppliers[2].id,
        order_date=now - timedelta(days=1),
        expected_delivery=now + timedelta(days=3),
        status="Ordered",
        total_amount=2200.00,
        notes="Single-Origin Arabica restock batch."
    )
    db.session.add(po3)
    db.session.flush()
    db.session.add(PurchaseOrderItem(po_id=po3.id, product_id=products[10].id, quantity=100, unit_price=12.5, total_price=1250.0))
    db.session.add(Delivery(
        po_id=po3.id,
        delivery_date=now + timedelta(days=3),
        status="Scheduled",
        tracking_number="TRK-77182901",
        carrier="Freight Forward Direct"
    ))

    # 9. Initial Alerts
    alerts_data = [
        {
            "title": "Critical Stock-Out: Smart Fitness Watch Series 9",
            "message": "Stock level has hit 0 units! Current backorders are rising. Lead time is 3 days.",
            "product_id": products[3].id,
            "alert_type": "Stock-Out",
            "severity": "Critical",
            "recommended_action": "Execute immediate purchase order for 50 units with Apex Electronics Corp."
        },
        {
            "title": "Low Stock Warning: Wireless ANC Headphones Pro",
            "message": "Only 8 units remaining in Central Warehouse against safety buffer of 20 units.",
            "product_id": products[0].id,
            "alert_type": "Critical Stock",
            "severity": "Critical",
            "recommended_action": "Approve purchase requisition REQ-001 or fast-track pending supplier delivery."
        },
        {
            "title": "Overstock Alert: Minimalist Bamboo Desk Organizer",
            "message": "Current inventory (160 units) exceeds max recommended stock limit (120 units).",
            "product_id": products[6].id,
            "alert_type": "Overstock",
            "severity": "Warning",
            "recommended_action": "Halt inbound procurement and launch a 15% workspace bundle campaign."
        },
        {
            "title": "Demand Surge Detected: Organic Arabica Beans 1kg",
            "message": "Weekly demand projected to increase by +32.5% across metro stores.",
            "product_id": products[10].id,
            "alert_type": "Demand Surge",
            "severity": "Info",
            "recommended_action": "Pre-order 100 bags to secure distributor volume discount."
        }
    ]
    for a in alerts_data:
        db.session.add(Alert(**a))

    # 10. Audit Logs
    audit_events = [
        ("USER_LOGIN", "User", str(admin.id), "Administrator logged into executive portal"),
        ("INVENTORY_RESTOCKED", "Product", str(products[0].id), "Received PO-20260915-8812 (30 units ANC Headphones)"),
        ("PO_DISPATCHED", "PurchaseOrder", str(po2.id), "PO-20261002-4421 in transit with DHL"),
        ("SYSTEM_INIT", "SystemSetting", "0", "Inventra AI intelligence subsystem initialized")
    ]
    for action, entity, eid, details in audit_events:
        db.session.add(AuditLog(user_id=admin.id, action=action, entity=entity, entity_id=eid, details=details))

    # Commit baseline records
    db.session.commit()
    print("Baseline records committed. Retraining ML models and calculating reorders...")

    # 11. Train ML Demand Forecasting models
    try:
        ForecastingService.retrain_models()
        ForecastingService.generate_all_forecasts()
        ReorderService.calculate_reorder_recommendations()
        ProcurementService.generate_procurement_recommendations()
        print("ML training, forecasts, reorders, and procurement calculations completed successfully!")
    except Exception as e:
        print(f"Post-seed calculations encountered a non-fatal error: {e}")
