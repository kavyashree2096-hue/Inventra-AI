from .auth_routes import auth_bp
from .dashboard_routes import dashboard_bp
from .product_routes import product_bp
from .sales_routes import sales_bp
from .inventory_routes import inventory_bp
from .forecast_routes import forecast_bp
from .supplier_routes import supplier_bp
from .procurement_routes import procurement_bp
from .alert_routes import alert_bp
from .chat_routes import chat_bp
from .report_routes import report_bp
from .admin_routes import admin_bp
from .career_routes import career_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(sales_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(forecast_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(procurement_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(career_bp)
