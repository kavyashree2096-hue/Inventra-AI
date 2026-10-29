import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Download, Printer, CheckCircle2,
  TrendingUp, Boxes, DollarSign, RefreshCw, Calendar
} from 'lucide-react';
import { reportService } from '../services/reportService';

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const rep = await reportService.getSummary();
        setSummary(rep);
      } catch (err) {
        console.error('Failed to load report summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = (type) => {
    const url = reportService.getExportUrl(type);
    window.open(url, '_blank');
  };

  if (loading || !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Reports & Data Exports
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Executive management summaries and certified CSV data exports
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Summary</span>
        </button>
      </div>

      {/* Management Summary Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
              Official Executive Telemetry
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Inventra AI Retail Management Summary Report
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Generated: {summary.generated_at} • Database status: Persistent SQLAlchemy ORM
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-right">
            <span className="text-[10px] text-indigo-700 block font-semibold">Inventory Health</span>
            <span className="text-xl font-black text-indigo-900">
              {summary.inventory_health_score}/100 ({summary.inventory_health_status})
            </span>
          </div>
        </div>

        {/* 6 Key Enterprise Figures */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Total Catalog Items</span>
            <span className="text-xl font-black text-slate-900 mt-1">{summary.total_products} SKUs</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Inventory Capital</span>
            <span className="text-xl font-black text-slate-900 mt-1">₹{summary.total_inventory_value?.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Sales Revenue</span>
            <span className="text-xl font-black text-emerald-700 mt-1">₹{summary.total_sales_revenue?.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Sales Transactions</span>
            <span className="text-xl font-black text-slate-900 mt-1">{summary.total_sales_transactions?.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Procurement Expenditure</span>
            <span className="text-xl font-black text-slate-900 mt-1">₹{summary.total_procurement_spend?.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Active Open POs</span>
            <span className="text-xl font-black text-indigo-700 mt-1">{summary.open_purchase_orders} Orders</span>
          </div>
        </div>
      </div>

      {/* CSV Export Hub */}
      <div className="space-y-4 print:hidden">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          <span>One-Click Certified CSV Downloads</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'inventory', title: 'Inventory Master Export', desc: 'SKU, Stock, Safety Levels, Margins, Health' },
            { type: 'sales', title: 'Sales Transactions Export', desc: 'Invoices, Stores, Payment Methods, Net Amounts' },
            { type: 'reorders', title: 'Reorder Pipeline Export', desc: 'Predicted Demand, Deficits, Priority Ranks' },
            { type: 'procurement', title: 'Purchase Orders Export', desc: 'PO Numbers, Suppliers, Delivery Dates, Totals' }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>
              </div>

              <button
                onClick={() => handleDownloadCSV(item.type)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
