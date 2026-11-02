import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, ShoppingBag, Calendar, Filter,
  Download, RefreshCw, BarChart2, PieChart as PieIcon, Award,
  ArrowUpRight, ArrowDownRight, Search, CheckCircle2, ChevronRight,
  Sparkles, Layers, Box, Info
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { revenueService } from '../services/revenueService';
import { productService } from '../services/productService';

const PIE_COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const RevenueAnalysis = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'Staff';

  // Modes: 'overall' | 'single'
  const [analysisMode, setAnalysisMode] = useState('overall');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [aggregation, setAggregation] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'yearly'
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchTableTerm, setSearchTableTerm] = useState('');

  // Data states
  const [summary, setSummary] = useState(null);
  const [singleProductData, setSingleProductData] = useState(null);
  const [charts, setCharts] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination for table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load product catalog for dropdown
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const prods = await productService.getProducts();
        setAllProducts(prods || []);
        if (prods && prods.length > 0 && !selectedProductId) {
          setSelectedProductId(prods[0].id);
        }
      } catch (err) {
        console.warn('Failed to load products list:', err);
      }
    };
    fetchCatalog();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, chartRes, tabRes, insRes] = await Promise.all([
        revenueService.getSummary(startDate, endDate, selectedCategoryId || null),
        revenueService.getCharts(startDate, endDate, selectedCategoryId || null, selectedProductId || null, aggregation),
        revenueService.getTable(startDate, endDate, selectedCategoryId || null),
        revenueService.getInsights(startDate, endDate, selectedCategoryId || null)
      ]);

      setSummary(sumRes);
      setCharts(chartRes);
      setTableRows(tabRes.products || []);
      setInsights(insRes || []);

      if (analysisMode === 'single' && selectedProductId) {
        const prodData = await revenueService.getProductRevenue(selectedProductId, startDate, endDate);
        setSingleProductData(prodData);
      }
    } catch (err) {
      console.error('Failed to load revenue data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [analysisMode, selectedProductId, aggregation]);

  const handleApplyFilters = () => {
    loadData();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategoryId('');
    setAggregation('monthly');
    setTimeout(loadData, 0);
  };

  const handleDownloadCsv = () => {
    const url = revenueService.getExportUrl(startDate, endDate, selectedCategoryId || null);
    window.open(url, '_blank');
  };

  // Filtered table rows
  const filteredTable = tableRows.filter((r) => {
    if (!searchTableTerm) return true;
    const q = searchTableTerm.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredTable.length / itemsPerPage);
  const paginatedTable = filteredTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Financial Intelligence
            </span>
            <span className="text-[10px] font-bold text-slate-400">• Persistent Retail Transaction Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            <span>Revenue & Financial Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track portfolio sales velocity, gross/net margins, and item-level revenue contributions in INR (₹).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mode Selector (Overall vs Single-Product) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-slate-100 rounded-2xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAnalysisMode('overall')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              analysisMode === 'overall'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Overall Portfolio Revenue (All Products)</span>
          </button>

          <button
            onClick={() => setAnalysisMode('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              analysisMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-4 h-4 text-emerald-600" />
            <span>Single Product Deep-Dive</span>
          </button>
        </div>

        {/* Aggregation interval */}
        <div className="flex items-center gap-1.5 px-2">
          <span className="text-[11px] font-semibold text-slate-500">Interval:</span>
          {['daily', 'weekly', 'monthly', 'yearly'].map((agg) => (
            <button
              key={agg}
              onClick={() => setAggregation(agg)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors ${
                aggregation === agg
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              {agg}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">Filters:</span>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
        >
          <option value="">All Categories</option>
          <option value="1">Electronics &amp; Gadgets</option>
          <option value="2">Home &amp; Living</option>
          <option value="3">Apparel &amp; Accessories</option>
          <option value="4">Health &amp; Personal Care</option>
          <option value="5">Gourmet &amp; Pantry</option>
        </select>

        {/* Product selector if in Single mode */}
        {analysisMode === 'single' && (
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900"
          >
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleApplyFilters}
          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
        >
          Apply
        </button>

        <button
          onClick={handleResetFilters}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      {/* OVERALL ANALYSIS VIEW */}
      {analysisMode === 'overall' && summary && (
        <div className="space-y-6">
          {/* B. OVERALL KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Revenue</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
                ₹{summary.total_revenue?.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +{summary.revenue_growth_pct}% vs prior
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Units Sold</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {summary.total_units_sold?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Physical units</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Transactions</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {summary.total_transactions?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Invoices generated</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Avg Selling Price</span>
              <span className="text-xl sm:text-2xl font-black text-sky-700 mt-1 block">
                ₹{summary.average_selling_price}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">ASP per item</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Gross Profit</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {typeof summary.gross_profit === 'number' ? `₹${summary.gross_profit?.toLocaleString()}` : summary.gross_profit}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                {summary.profit_margin_pct}% Margin
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Avg Order Value</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 block">
                ₹{summary.average_order_value}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">AOV per ticket</span>
            </div>
          </div>

          {/* G. AUTOMATIC REVENUE INSIGHTS */}
          {insights.length > 0 && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-50/70 via-indigo-50/40 to-emerald-50/60 border border-sky-100 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Automated Data-Driven Revenue Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insights.map((ins, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ins.title}</span>
                      <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                        {ins.metric}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{ins.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E. INTERACTIVE CHARTS & GRAPHS */}
          {charts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Revenue Over Time */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Revenue Over Time (Trend Curve)</h3>
                <p className="text-[11px] text-slate-500">Continuous turnover aggregation by {aggregation} interval</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.revenue_over_time}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                      <Area type="monotone" dataKey="revenue" name="Net Revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Top 10 Products by Revenue */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Top 10 Revenue Generating SKUs</h3>
                <p className="text-[11px] text-slate-500">Ranked by gross customer order receipts</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.top_products} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                      <YAxis dataKey="short_name" type="category" tick={{ fontSize: 9 }} width={120} />
                      <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                      <Bar dataKey="revenue" fill="#0284c7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Category Revenue & Contribution */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Revenue Contribution by Category</h3>
                <p className="text-[11px] text-slate-500">Departmental share of gross retail intake</p>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.category_revenue}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        label={({ name, share_pct }) => `${name} (${share_pct}%)`}
                      >
                        {charts.category_revenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Day of Week Seasonality */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Sales Velocity by Day of Week</h3>
                <p className="text-[11px] text-slate-500">Retail cycle patterns and weekend shopping spikes</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.revenue_by_dow}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                      <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* F. REVENUE TABLES */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Product-Level Financial Performance Table</h3>
                <p className="text-xs text-slate-500">
                  Searchable, sortable matrix of gross turnover, contribution %, and margins.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search table by SKU, product, category..."
                  value={searchTableTerm}
                  onChange={(e) => setSearchTableTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Units Sold</th>
                    <th className="py-3 px-3 text-right">Net Revenue</th>
                    <th className="py-3 px-3 text-center">Revenue Share</th>
                    <th className="py-3 px-3 text-right">ASP</th>
                    <th className="py-3 px-3 text-right">Gross Profit</th>
                    <th className="py-3 px-3 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedTable.map((row) => (
                    <tr key={row.product_id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{row.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.name}</td>
                      <td className="py-3 px-3 text-slate-500">{row.category}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{row.units_sold}</td>
                      <td className="py-3 px-3 text-right font-black text-emerald-700">₹{row.net_revenue?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px]">
                          {row.revenue_contribution_pct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">₹{row.average_selling_price}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800">
                        {currentRole === 'Staff' ? 'Protected' : `₹${row.gross_profit?.toLocaleString()}`}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {currentRole === 'Staff' ? (
                          <span className="text-slate-400">Protected</span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.profit_margin_pct >= 40 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {row.profit_margin_pct}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>Showing {paginatedTable.length} of {filteredTable.length} catalog items</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="px-2 font-bold text-slate-800">{currentPage} / {totalPages || 1}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* C. SINGLE-PRODUCT DEEP DIVE VIEW */}
      {analysisMode === 'single' && singleProductData && (
        <div className="space-y-6">
          {/* Product Hero Info Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {singleProductData.product.image_url ? (
                <img
                  src={singleProductData.product.image_url}
                  alt={singleProductData.product.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl">
                  SKU
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {singleProductData.product.sku}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{singleProductData.product.category}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {singleProductData.product.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Retail Price: ₹{singleProductData.product.selling_price} • Unit Cost: ₹{singleProductData.product.cost_price} • Warehouse Stock: {singleProductData.product.current_stock} units
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Business Share</span>
                <span className="text-2xl font-black text-sky-700">{singleProductData.share_of_business_pct}%</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Best Month</span>
                <span className="text-sm font-bold text-slate-800">{singleProductData.best_performing_month}</span>
              </div>
            </div>
          </div>

          {/* Single Product KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Product Revenue</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                ₹{singleProductData.total_revenue?.toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Sold</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {singleProductData.total_units_sold} Units
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Realized Margin</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">
                {singleProductData.profit_margin_pct}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Daily Velocity</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{singleProductData.average_daily_sales}
              </span>
            </div>
          </div>

          {/* Single Product Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue Trend</h3>
              <p className="text-[11px] text-slate-500">Historical intake curve for {singleProductData.product.name}</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={singleProductData.sales_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product vs Overall Comparison Chart */}
            {charts?.product_vs_overall && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Selected SKU vs Overall Business Intake</h3>
                <p className="text-[11px] text-slate-500">Comparative revenue volume benchmarks</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.product_vs_overall}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="product_revenue" name="This Product" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="overall_revenue" name="Overall Business" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalysis;
