import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Download, Printer, CheckCircle2,
  TrendingUp, Boxes, DollarSign, RefreshCw, Calendar,
  Filter, Eye, Clock, ShieldCheck, HelpCircle, Sparkles, FileText
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { productService } from '../services/productService';

const ReportsPage = () => {
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('revenue_analysis');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [allProducts, setAllProducts] = useState([]);

  const [activeReport, setActiveReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [types, prods, hist] = await Promise.all([
          reportService.getReportTypes().catch(() => []),
          productService.getProducts().catch(() => []),
          reportService.getReportHistory().catch(() => [])
        ]);

        setReportTypes(types);
        setAllProducts(prods || []);
        setHistory(hist || []);

        // Generate initial default report preview
        const initRep = await reportService.generateReport({ report_type: 'revenue_analysis' });
        setActiveReport(initRep);
      } catch (err) {
        console.error('Failed to load reports init:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const rep = await reportService.generateReport({
        report_type: selectedType,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category_id: selectedCategory || undefined,
        product_id: selectedProduct || undefined
      });
      setActiveReport(rep);
      const hist = await reportService.getReportHistory();
      setHistory(hist || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = (type = null) => {
    const t = type || selectedType;
    const url = reportService.getExportUrl(t, startDate, endDate, selectedCategory || null, selectedProduct || null);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 print:p-0">
      {/* Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              Executive Telemetry &amp; Compliance
            </span>
            <span className="text-[10px] font-bold text-slate-400">• Certified Business Reporting Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            <span>Professional Reports Center</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Generate and preview certified executive reports, audit disclosures, and export compliant CSV &amp; PDF files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadCSV()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Generator Controls (Hidden in Print) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Configure &amp; Generate Report</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Report Type */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Report Module</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-hidden"
            >
              {reportTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.title} ({rt.category})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Start Date */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
            />
          </div>

          {/* 3. End Date */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
            />
          </div>

          {/* 4. Category Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Department</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium"
            >
              <option value="">All Departments</option>
              <option value="1">Electronics &amp; Gadgets</option>
              <option value="2">Home &amp; Living</option>
              <option value="3">Apparel &amp; Accessories</option>
              <option value="4">Health &amp; Personal Care</option>
              <option value="5">Gourmet &amp; Pantry</option>
            </select>
          </div>

          {/* 5. Action */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
            >
              {generating ? 'Compiling Report...' : 'Compile & Preview'}
            </button>
          </div>
        </div>

        {selectedType === 'single_product' && (
          <div className="pt-2">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Select Target Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full max-w-md px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* OFFICIAL EXECUTIVE REPORT PREVIEW DOCUMENT */}
      {activeReport && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Document Header with Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-sky-100 p-1.5 flex items-center justify-center shadow-xs">
                <img src="/logo_icon.png" alt="Inventra AI Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">
                  INVENTRA AI • EXECUTIVE INTELLIGENCE BRIEF
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {activeReport.title}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Report Identifier: <span className="font-mono font-bold text-slate-600">{activeReport.report_code}</span> • Category: {activeReport.category}
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-[10px] text-slate-400 block">Generated Timestamp</span>
              <span className="font-mono font-bold text-slate-800">{activeReport.generated_at}</span>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-700 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified ORM State</span>
              </div>
            </div>
          </div>

          {/* Applied Filters Context Block */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center gap-4 text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Scope</span>
              <span className="font-semibold text-slate-800">{activeReport.filters_applied?.report_type}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Date Range</span>
              <span className="font-semibold text-slate-800">{activeReport.filters_applied?.date_range}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
              <span className="font-semibold text-slate-800">{activeReport.filters_applied?.category_filter}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Product Scope</span>
              <span className="font-semibold text-slate-800">{activeReport.filters_applied?.product_filter}</span>
            </div>
          </div>

          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activeReport.kpis?.map((kpi, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">{kpi.label}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block font-mono">
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          {/* Detailed Data Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Disclosed Records &amp; Breakdown</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    {activeReport.table?.columns.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeReport.table?.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 font-medium">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {(!activeReport.table?.rows || activeReport.table.rows.length === 0) && (
                    <tr>
                      <td colSpan={activeReport.table?.columns.length || 1} className="py-6 text-center text-slate-400">
                        No records match the requested report parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Findings & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2 text-xs">
              <h4 className="font-bold text-sky-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Executive Observations</span>
              </h4>
              <ul className="space-y-1.5 text-sky-900 text-[11px] list-disc list-inside">
                {activeReport.findings?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2 text-xs">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Policy Recommendations</span>
              </h4>
              <ul className="space-y-1.5 text-emerald-900 text-[11px] list-disc list-inside">
                {activeReport.recommendations?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Compliance & Limitations Footer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Inventra AI Enterprise Platform • {activeReport.data_limitations}
            </p>
            <p className="font-mono">Page 1 of 1 • Certified Autonomous Ledger</p>
          </div>
        </div>
      )}

      {/* One-Click Certified CSV Downloads Hub (Hidden in Print) */}
      <div className="space-y-4 print:hidden">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          <span>One-Click Certified CSV Downloads</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {reportTypes.map((rt) => (
            <div key={rt.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">{rt.category}</span>
                <h4 className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">{rt.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">{rt.description}</p>
              </div>

              <button
                onClick={() => handleDownloadCSV(rt.id)}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
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
