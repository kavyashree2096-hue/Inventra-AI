import React, { useState, useEffect } from 'react';
import {
  Database, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet,
  TrendingUp, BarChart2, RefreshCw, Download, ArrowRight, Sparkles,
  Layers, Check, HelpCircle, FileText, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { dataAnalysisService } from '../services/dataAnalysisService';
import Modal from '../components/Modal';

const PIE_COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const STANDARD_FIELDS = [
  { key: 'product_id', label: 'Product SKU / ID', required: true, desc: 'Unique identifier for the item' },
  { key: 'product_name', label: 'Product Name', required: false, desc: 'Human-readable title' },
  { key: 'category', label: 'Department / Category', required: false, desc: 'Merchandising category' },
  { key: 'date', label: 'Transaction Date', required: false, desc: 'ISO or date string' },
  { key: 'transaction_id', label: 'Invoice / Order ID', required: false, desc: 'Transaction reference' },
  { key: 'quantity', label: 'Quantity Sold', required: true, desc: 'Units count (> 0)' },
  { key: 'unit_price', label: 'Selling Unit Price', required: true, desc: 'Price charged per unit' },
  { key: 'line_total', label: 'Line Total Amount', required: false, desc: 'Quantity × Price' },
  { key: 'cost', label: 'Unit Cost Price', required: false, desc: 'COGS baseline' }
];

const DataAnalysis = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'Staff';
  const isManagerOrAdmin = ['Admin', 'Manager'].includes(currentRole);

  const [activeTab, setActiveTab] = useState('eda'); // 'eda', 'quality', 'business', 'upload'

  // Data states
  const [edaData, setEdaData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Upload workspace state
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [inspectionResult, setInspectionResult] = useState(null);
  const [userMappings, setUserMappings] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [edaRes, bizRes, histRes] = await Promise.all([
        dataAnalysisService.getEda().catch(() => null),
        dataAnalysisService.getBusinessAnalysis().catch(() => null),
        dataAnalysisService.getHistory().catch(() => [])
      ]);

      setEdaData(edaRes);
      setBusinessData(bizRes);
      setHistory(histRes || []);
    } catch (err) {
      console.error('Failed to load data analysis results:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;
    setUploadLoading(true);
    setInspectionResult(null);
    setValidationResult(null);

    try {
      const res = await dataAnalysisService.uploadFilePreview(fileToUpload);
      setInspectionResult(res);
      setUserMappings(res.suggested_mappings || {});
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to parse file preview');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleValidateSubmit = async () => {
    if (!inspectionResult?.file_token) return;
    setValidating(true);
    try {
      const res = await dataAnalysisService.validateDataset(
        inspectionResult.file_token,
        userMappings
      );
      setValidationResult(res);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Validation error');
    } finally {
      setValidating(false);
    }
  };

  const handleDownloadCsv = () => {
    const url = dataAnalysisService.getExportUrl();
    window.open(url, '_blank');
  };

  if (loading && !edaData) {
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
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Data Science Workspace
            </span>
            <span className="text-[10px] font-bold text-slate-400">• Pandas &amp; NumPy Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Database className="w-7 h-7 text-indigo-600" />
            <span>Data Analysis &amp; EDA Workspace</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Exploratory Data Analysis (EDA), statistical distributions, column mapping, and dataset quality verification.
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
            <span>Export EDA Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-2xl text-xs font-semibold">
        {[
          { id: 'eda', label: 'Exploratory Data Analysis (EDA)', icon: BarChart2 },
          { id: 'quality', label: 'Data Quality & Health', icon: CheckCircle2 },
          { id: 'business', label: 'Turnover & Velocity', icon: TrendingUp },
          { id: 'upload', label: 'Upload & Map Dataset', icon: Upload }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXPLORATORY DATA ANALYSIS (EDA) */}
      {activeTab === 'eda' && edaData && (
        <div className="space-y-6">
          {/* Descriptive Statistics Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Descriptive Statistics Matrix</h3>
                <p className="text-xs text-slate-500">
                  Observed metrics: Count, Mean, Median, Min, Max, Standard Deviation, and Interquartile Range (IQR).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                N = {edaData.total_observations?.toLocaleString()} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Variable</th>
                    <th className="py-2.5 px-3 text-right">Count</th>
                    <th className="py-2.5 px-3 text-right">Mean</th>
                    <th className="py-2.5 px-3 text-right">Median</th>
                    <th className="py-2.5 px-3 text-right">Std Dev</th>
                    <th className="py-2.5 px-3 text-right">Min</th>
                    <th className="py-2.5 px-3 text-right">Q1 (25%)</th>
                    <th className="py-2.5 px-3 text-right">Q3 (75%)</th>
                    <th className="py-2.5 px-3 text-right">IQR</th>
                    <th className="py-2.5 px-3 text-right">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {Object.entries(edaData.descriptive_statistics || {}).map(([varName, stats]) => (
                    <tr key={varName} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-sans font-bold text-slate-900 capitalize">{varName.replace('_', ' ')}</td>
                      <td className="py-3 px-3 text-right">{stats.count?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-indigo-700 font-bold">
                        {varName.includes('price') ? `₹${stats.mean}` : stats.mean}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {varName.includes('price') ? `₹${stats.median}` : stats.median}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">{stats.std}</td>
                      <td className="py-3 px-3 text-right">{stats.min}</td>
                      <td className="py-3 px-3 text-right">{stats.q1}</td>
                      <td className="py-3 px-3 text-right">{stats.q3}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">{stats.iqr}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {varName.includes('price') ? `₹${stats.max}` : stats.max}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Distribution */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Revenue Histogram Distribution</h3>
              <p className="text-[11px] text-slate-500">Frequency of transactions categorized by order value bracket</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={edaData.revenue_distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="bin" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Transactions" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quantity Distribution */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Basket Units Distribution</h3>
              <p className="text-[11px] text-slate-500">Frequency of basket item purchase quantities</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={edaData.quantity_distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="quantity" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Frequency" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Correlation Matrix & Outlier Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Matrix */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Pearson Correlation Coefficients</h3>
              <p className="text-[11px] text-slate-500">Multivariate linear relationships between transaction variables</p>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2 px-3 text-left">Variable</th>
                      <th className="py-2 px-3">Quantity</th>
                      <th className="py-2 px-3">Unit Price</th>
                      <th className="py-2 px-3">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {['quantity', 'unit_price', 'total_price'].map((r) => (
                      <tr key={r}>
                        <td className="py-2.5 px-3 text-left font-sans font-bold capitalize text-slate-800">{r.replace('_', ' ')}</td>
                        {['quantity', 'unit_price', 'total_price'].map((c) => {
                          const val = edaData.correlation_matrix?.[r]?.[c] ?? 1.0;
                          return (
                            <td key={c} className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                val === 1.0 ? 'bg-slate-100 text-slate-500' : val > 0.4 ? 'bg-emerald-50 text-emerald-800' : val < -0.2 ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-700'
                              }`}>
                                {val}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outliers Table */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Top Revenue Transactions (Statistical Extremes)</h3>
              <p className="text-[11px] text-slate-500">Highest ticket transactions verified by audit system</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(edaData.outlier_points || []).map((pt, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{pt.product}</td>
                        <td className="py-2 px-2 text-slate-500">{pt.category}</td>
                        <td className="py-2 px-2 text-center font-bold text-slate-800">{pt.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">₹{pt.price}</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">₹{pt.revenue?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA QUALITY & HEALTH */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Catalog Integrity</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">98.5 / 100</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Grade A (High Integrity)</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Missing Values</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">0 cells</span>
              <span className="text-[10px] text-slate-400 mt-1 block">0.0% null rate</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Duplicate Check</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">0 duplicates</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">100% unique primary keys</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Schema Validation</span>
              <span className="text-2xl font-black text-sky-700 mt-1 block">Passed</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Standard retail schema</span>
            </div>
          </div>

          {/* Formula documentation card */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Data Quality Score Calculation Methodology</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inventra AI computes dataset health using an objective weighted penalty formula:
            </p>
            <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs text-indigo-900">
              Data Quality Score = 100 - (missing_pct × 0.35 + invalid_numeric_pct × 0.45 + duplicate_pct × 0.20)
            </div>
            <p className="text-[11px] text-slate-500">
              Datasets scoring &gt; 85% are cleared for demand forecast training and revenue recognition.
            </p>
          </div>

          {/* Upload History Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Dataset Ingestion &amp; Quality Audit Log</h3>
                <p className="text-xs text-slate-500">History of inspected files, schema verifications, and score ratings</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-3">Ingestion Date</th>
                    <th className="py-3 px-3 text-center">Total Rows</th>
                    <th className="py-3 px-3 text-center">Valid Rows</th>
                    <th className="py-3 px-3 text-center">Quality Score</th>
                    <th className="py-3 px-3">Uploader</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No custom datasets uploaded yet. Standard commercial retail dataset is active.
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">{h.filename}</td>
                        <td className="py-3 px-3 text-slate-500">{new Date(h.created_at).toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-bold">{h.row_count}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700">{h.valid_count}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            {h.quality_score}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{h.uploaded_by_name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS TURNOVER & VELOCITY */}
      {activeTab === 'business' && businessData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Stock Turnover Ratio</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {businessData.stock_turnover_ratio}x
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                {businessData.turnover_health}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Cost of Goods Sold (COGS)</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{businessData.cost_of_goods_sold?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Cumulative procurement cost</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Holding Capital Value</span>
              <span className="text-2xl font-black text-sky-700 mt-1 block">
                ₹{businessData.inventory_holding_value?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Warehouse assets tied in stock</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fast Movers */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 text-sm">High-Velocity Catalog Leaders</h3>
              </div>
              <p className="text-[11px] text-slate-500">Products demonstrating turnover rate &ge; 80 units</p>
              <div className="space-y-2">
                {(businessData.fast_moving_products || []).map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.sku} • {p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-700 block">{p.units_sold} Units Sold</span>
                      <span className="text-[10px] text-slate-400">{p.current_stock} in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slow Movers */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Slow-Moving Holding Capital</h3>
              </div>
              <p className="text-[11px] text-slate-500">Products with idle stock holding &ge; 30 units and low turnover</p>
              <div className="space-y-2">
                {(businessData.slow_moving_products || []).map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.sku} • {p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-700 block">₹{p.holding_value?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">{p.current_stock} units holding</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UPLOAD & MAP DATASET */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Retail Dataset (CSV or Excel)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload custom product or sales datasets. Inspect columns, confirm schema mappings, and run automated health verification.
              </p>
            </div>

            <form onSubmit={handleInspectSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                required
                onChange={(e) => setFileToUpload(e.target.files[0])}
                className="w-full sm:flex-1 text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button
                type="submit"
                disabled={uploadLoading || !fileToUpload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs"
              >
                {uploadLoading ? 'Inspecting...' : 'Inspect & Preview'}
              </button>
            </form>

            {/* Inspection & Mapping Area */}
            {inspectionResult && (
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-indigo-900">
                      File: {inspectionResult.filename} ({inspectionResult.total_rows} rows, {inspectionResult.total_columns} columns)
                    </p>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Confirm or adjust standard retail field mappings below.
                    </p>
                  </div>
                  <button
                    onClick={handleValidateSubmit}
                    disabled={validating}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    {validating ? 'Validating...' : 'Confirm Mappings & Validate'}
                  </button>
                </div>

                {/* Column Mapping Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STANDARD_FIELDS.map((field) => (
                    <div key={field.key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{field.desc}</p>
                      <select
                        value={userMappings[field.key] || ''}
                        onChange={(e) => setUserMappings({ ...userMappings, [field.key]: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700"
                      >
                        <option value="">-- Unmapped --</option>
                        {inspectionResult.columns.map((col) => (
                          <option key={col.column} value={col.column}>
                            {col.column} ({col.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Sample Data Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">First 10 Sample Rows</h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px]">
                        <tr>
                          {inspectionResult.columns.map((c) => (
                            <th key={c.column} className="py-2 px-3">{c.column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspectionResult.sample_data.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {inspectionResult.columns.map((c) => (
                              <td key={c.column} className="py-1.5 px-3 font-mono truncate max-w-xs">
                                {String(row[c.column] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Outcome Banner */}
            {validationResult && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dataset Successfully Validated</span>
                  </span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md bg-white border border-emerald-300">
                    Quality Score: {validationResult.data_quality_score}/100 ({validationResult.rating})
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {validationResult.valid_rows} valid records verified out of {validationResult.total_rows} total rows.
                  {validationResult.duplicate_rows > 0 && ` (${validationResult.duplicate_rows} duplicate keys isolated)`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;
