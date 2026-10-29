from flask import Blueprint, request, jsonify, Response
from services.report_service import ReportService
from utils.rbac import role_required, get_current_authenticated_user

report_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@report_bp.route('/summary', methods=['GET'])
def get_summary_report():
    data = ReportService.get_management_summary()
    current_user = get_current_authenticated_user()
    if current_user and current_user.role == 'Staff':
        # Mask executive financial summaries for staff
        if 'financial_overview' in data:
            data['financial_overview']['total_sales_value'] = 'Protected (Manager+)'
            data['financial_overview']['inventory_holding_cost'] = 'Protected (Manager+)'
            data['financial_overview']['gross_profit_margin'] = 'Protected (Manager+)'
        data['privacy_shield_active'] = True
    return jsonify({'report': data}), 200

@report_bp.route('/export', methods=['GET'])
@role_required('Admin', 'Manager')
def export_csv_report():
    report_type = request.args.get('type', 'inventory') # 'inventory', 'sales', 'reorders', 'procurement'
    csv_content = ReportService.export_csv(report_type)

    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment;filename=inventra_{report_type}_report.csv'}
    )
