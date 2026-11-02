import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, ShieldAlert, FileText, CheckCircle2, AlertTriangle,
  RefreshCw, Plus, Download, Upload, Filter, Search, ArrowRight,
  TrendingUp, Check, X, Shield, Clock, Eye, AlertCircle, Printer
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';
import Modal from '../components/Modal';

const STATUS_COLORS = {
  Matched: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Shortage: 'bg-rose-50 text-rose-700 border-rose-200',
  Excess: 'bg-amber-50 text-amber-700 border-amber-200',
  'Pending Verification': 'bg-slate-100 text-slate-700 border-slate-200',
  Resolved: 'bg-sky-50 text-sky-700 border-sky-200'
};

const PIE_COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#0284c7', '#94a3b8'];

const AuditOperations = () => {
  const { user } = useAuth();
  const currentRole = user?.role || 'Staff';
  const isManagerOrAdmin = ['Admin', 'Manager'].includes(currentRole);

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'sales', 'activity', 'charts'
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [salesAudit, setSalesAudit] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // New Audit Session Modal
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newWarehouse, setNewWarehouse] = useState('Central Warehouse');
  const [newNotes, setNewNotes] = useState('');
  const [submittingSession, setSubmittingSession] = useState(false);

  // Verify / Edit Count Modal
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editCount, setEditCount] = useState(0);
  const [editReason, setEditReason] = useState('Physical count discrepancy');
  const [editAction, setEditAction] = useState('Adjust inventory record upon supervisory signoff');
  const [savingItem, setSavingItem] = useState(false);

  // Resolve Discrepancy Modal (Authorized)
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [itemToResolve, setItemToResolve] = useState(null);
  const [resolveActionNotes, setResolveActionNotes] = useState('Approved physical count adjustment into central inventory records.');
  const [resolving, setResolving] = useState(false);

  // CSV Import Modal
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importingCsv, setImportingCsv] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, sessRes, salesRes, logsRes, chartsRes] = await Promise.all([
        auditService.getSummary().catch(() => null),
        auditService.getSessions().catch(() => []),
        auditService.getSalesAudit().catch(() => null),
        auditService.getActivityLogs(1, 40).catch(() => ({ logs: [] })),
        auditService.getCharts().catch(() => null)
      ]);

      setSummary(sumRes);
      setSessions(sessRes);
      setSalesAudit(salesRes);
      setActivityLogs(logsRes.logs || []);
      setChartsData(chartsRes);

      if (sessRes && sessRes.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessRes[0].id);
        const detail = await auditService.getSessionDetail(sessRes[0].id);
        setSessionDetail(detail);
      }
    } catch (err) {
      console.error('Failed to load audit data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSession = async (sessId) => {
    setSelectedSessionId(sessId);
    try {
      const detail = await auditService.getSessionDetail(sessId);
      setSessionDetail(detail);
    } catch (err) {
      console.error('Failed to fetch session detail:', err);
    }
  };

  const handleCreateSessionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSession(true);
    try {
      const res = await auditService.createSession({
        title: newTitle || `Floor Stock Audit ${new Date().toLocaleDateString()}`,
        warehouse: newWarehouse,
        notes: newNotes
      });
      showToast('success', res.message || 'Audit session initiated!');
      setNewSessionModalOpen(false);
      setNewTitle('');
      setNewNotes('');
      await loadData();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to create audit session');
    } finally {
      setSubmittingSession(false);
    }
  };

  const handleSaveItemCount = async (e) => {
    e.preventDefault();
    if (!selectedItem || !selectedSessionId) return;
    setSavingItem(true);
    try {
      await auditService.updateItemCount(
        selectedSessionId,
        selectedItem.id,
        parseInt(editCount),
        editReason,
        editAction
      );
      showToast('success', 'Verified physical count updated!');
      setEditItemModalOpen(false);
      const detail = await auditService.getSessionDetail(selectedSessionId);
      setSessionDetail(detail);
      const sum = await auditService.getSummary();
      setSummary(sum);
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to update count');
    } finally {
      setSavingItem(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!itemToResolve || !selectedSessionId) return;
    setResolving(true);
    try {
      const res = await auditService.resolveItem(
        selectedSessionId,
        itemToResolve.id,
        resolveActionNotes
      );
      showToast('success', res.message || 'Discrepancy resolved and inventory reconciled!');
      setResolveModalOpen(false);
      setItemToResolve(null);
      const detail = await auditService.getSessionDetail(selectedSessionId);
      setSessionDetail(detail);
      const sum = await auditService.getSummary();
      setSummary(sum);
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to resolve discrepancy');
    } finally {
      setResolving(false);
    }
  };

  const handleCsvImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile || !selectedSessionId) return;
    setImportingCsv(true);
    setImportResult(null);
    try {
      const res = await auditService.importCsvCounts(selectedSessionId, csvFile);
      setImportResult(res);
      showToast('success', res.message);
      const detail = await auditService.getSessionDetail(selectedSessionId);
      setSessionDetail(detail);
      setTimeout(() => {
        setCsvModalOpen(false);
        setCsvFile(null);
        setImportResult(null);
      }, 2000);
    } catch (err) {
      setImportResult({ error: err.response?.data?.error || 'Failed to import counts' });
    } finally {
      setImportingCsv(false);
    }
  };

  const handleDownloadCsv = () => {
    const url = auditService.getExportUrl(selectedSessionId);
    window.open(url, '_blank');
  };

  // Filter session items
  const filteredItems = (sessionDetail?.items || []).filter((it) => {
    const matchesSearch = !searchTerm ||
      it.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.product_sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || it.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || it.category_name === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set((sessionDetail?.items || []).map((it) => it.category_name))).filter(Boolean);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-200'
              : 'bg-rose-600 text-white shadow-rose-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              Governance & Integrity
            </span>
            <span className="text-[10px] font-bold text-slate-400">• Persistent SQLAlchemy Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-sky-600" />
            <span>Audit Operations Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical inventory verification, automated sales ledger validation, and tamper-resistant activity auditing.
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
            title="Refresh Audit Data"
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

          {isManagerOrAdmin && (
            <button
              onClick={() => setNewSessionModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Audit Session</span>
            </button>
          )}
        </div>
      </div>

      {/* D. AUDIT SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total Sessions', value: summary?.total_sessions || 0, icon: ClipboardCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Products Verified', value: summary?.products_verified || 0, icon: CheckCircle2, color: 'text-sky-600 bg-sky-50 border-sky-100' },
          { label: 'Matched Counts', value: summary?.matched_products || 0, icon: Check, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Stock Shortages', value: summary?.stock_shortages || 0, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
          { label: 'Stock Excesses', value: summary?.stock_excesses || 0, icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Unresolved', value: summary?.unresolved_discrepancies || 0, icon: ShieldAlert, color: 'text-purple-600 bg-purple-50 border-purple-100' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 leading-tight">{card.label}</span>
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-xl text-xs font-semibold">
        {[
          { id: 'inventory', label: 'Inventory Stock Audit', icon: ClipboardCheck },
          { id: 'sales', label: 'Sales Ledger Audit', icon: ShieldAlert },
          { id: 'activity', label: 'System Activity Logs', icon: FileText },
          { id: 'charts', label: 'Audit Analytics', icon: TrendingUp }
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

      {/* TAB 1: INVENTORY AUDIT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Audit Session Selector & Details Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    {sessionDetail?.session_code || 'AUD-SELECT'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[sessionDetail?.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {sessionDetail?.status || 'In Progress'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {sessionDetail?.title || 'Physical Count Session'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Warehouse: {sessionDetail?.warehouse_name} • Auditor: {sessionDetail?.auditor_name} • Created: {new Date(sessionDetail?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Session Switcher & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSessionId || ''}
                onChange={(e) => handleSelectSession(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.session_code} - {s.title}
                  </option>
                ))}
              </select>

              {isManagerOrAdmin && (
                <button
                  onClick={() => setCsvModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Counts CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Verification Workspace Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by SKU or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
              >
                <option value="All">All Verification Statuses</option>
                <option value="Matched">Matched</option>
                <option value="Shortage">Stock Shortage</option>
                <option value="Excess">Stock Excess</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <span className="text-[11px] font-semibold text-slate-400 ml-auto md:ml-2">
                Showing {filteredItems.length} items
              </span>
            </div>
          </div>

          {/* Audit Verification Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3 text-center">Recorded Stock</th>
                    <th className="py-3.5 px-3 text-center">Physical Verified</th>
                    <th className="py-3.5 px-3 text-center">Difference</th>
                    <th className="py-3.5 px-3">Verification Status</th>
                    <th className="py-3.5 px-3">Discrepancy Reason</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredItems.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {it.product_image ? (
                            <img src={it.product_image} alt={it.product_name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                              SKU
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{it.product_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{it.product_sku} • Unit Cost: ₹{it.unit_cost}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">
                        {it.category_name}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                        {it.recorded_stock}
                      </td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-slate-900">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono">
                          {it.physical_stock}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`font-black font-mono px-2 py-0.5 rounded-md text-[11px] ${
                            it.difference === 0
                              ? 'text-slate-600 bg-slate-100'
                              : it.difference < 0
                              ? 'text-rose-700 bg-rose-50 border border-rose-200'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                          }`}
                        >
                          {it.difference > 0 ? `+${it.difference}` : it.difference}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[it.status] || 'bg-slate-100'}`}>
                          {it.status === 'Matched' && <Check className="w-3 h-3" />}
                          {it.status === 'Shortage' && <AlertTriangle className="w-3 h-3" />}
                          {it.status === 'Excess' && <TrendingUp className="w-3 h-3" />}
                          {it.status === 'Resolved' && <Shield className="w-3 h-3 text-sky-600" />}
                          <span>{it.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                        {it.discrepancy_reason || <span className="text-slate-300 italic">None recorded</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItem(it);
                              setEditCount(it.physical_stock);
                              setEditReason(it.discrepancy_reason || '');
                              setEditAction(it.corrective_action || '');
                              setEditItemModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Enter Count
                          </button>

                          {isManagerOrAdmin && it.status !== 'Matched' && !it.is_adjusted && (
                            <button
                              onClick={() => {
                                setItemToResolve(it);
                                setResolveModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors shadow-2xs"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        No products match the selected audit filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES AUDIT */}
      {activeTab === 'sales' && salesAudit && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Inspected Transactions</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{salesAudit.total_sales_inspected}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Verified Revenue</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">₹{salesAudit.total_revenue_verified?.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Financial Discrepancies</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{salesAudit.financial_discrepancies_count}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Data Quality Score</span>
              <span className="text-2xl font-black text-sky-700 mt-1 block">{salesAudit.audit_health_rating}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Financial Ledger Consistency Checks</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates duplicate receipts, missing timestamps, unit price discrepancies, and mathematical line totals.
            </p>

            <div className="space-y-3 pt-2">
              {salesAudit.discrepancies.length === 0 && salesAudit.warnings.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-emerald-900 text-sm">Clean Financial Ledger</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    All sales records demonstrate 100% mathematical integrity with zero duplicate invoices or line-item discrepancies.
                  </p>
                </div>
              ) : (
                [...salesAudit.discrepancies, ...salesAudit.warnings].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                      item.severity === 'Critical' || item.severity === 'High'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.type}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-current">
                          {item.reference}
                        </span>
                        <span className="text-[10px] font-semibold opacity-75">
                          [{item.category}]
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 opacity-90">{item.details}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white shadow-2xs shrink-0">
                      {item.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM ACTIVITY LOGS */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Immutable System Audit Trails</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Backend operation logs capturing security events, inventory adjustments, and procurement cycles.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total: {activityLogs.length} events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Operation</th>
                    <th className="py-3 px-3">Entity</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {log.user_name}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sky-700 text-[11px]">
                        {log.action}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[10px]">
                          {log.entity} #{log.entity_id || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT CHARTS */}
      {activeTab === 'charts' && chartsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Shortages vs Excesses */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Discrepancy Magnitude: Shortages vs Excesses</h3>
            <p className="text-[11px] text-slate-500">Units discrepancy across top products</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.shortage_vs_excess}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="product" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="shortage" name="Shortage Units" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="excess" name="Excess Units" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Audit Status Distribution */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Audit Verification Status Breakdown</h3>
            <p className="text-[11px] text-slate-500">Distribution across all verified catalog SKUs</p>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.status_distribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartsData.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Discrepancies by Category */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Discrepancy Units by Product Category</h3>
            <p className="text-[11px] text-slate-500">Aggregate physical differences by department</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.category_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="discrepancy_units" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Resolution Trends */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Discrepancy Resolution Progress</h3>
            <p className="text-[11px] text-slate-500">Reconciled vs pending supervisor review</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.resolution_trend} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create New Audit Session */}
      <Modal
        isOpen={newSessionModalOpen}
        onClose={() => setNewSessionModalOpen(false)}
        title="Initiate Physical Stock Audit Session"
      >
        <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Session Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Q4 High-Value Electronics Cycle Count"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Warehouse Location</label>
            <select
              value={newWarehouse}
              onChange={(e) => setNewWarehouse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
            >
              <option value="Central Warehouse">Central Warehouse (Primary Depot)</option>
              <option value="Regional Fulfillment Center East">Regional Fulfillment Center East</option>
              <option value="West Coast Distribution Hub">West Coast Distribution Hub</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Scope & Notes</label>
            <textarea
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Record reason or operational instructions for floor auditors..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-800">
            <strong>Audit Policy:</strong> Initializing will snapshot current recorded quantities across all catalog SKUs for physical count comparison.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewSessionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingSession}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
            >
              {submittingSession ? 'Initializing...' : 'Start Audit Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Enter Physical Verified Count */}
      <Modal
        isOpen={editItemModalOpen}
        onClose={() => setEditItemModalOpen(false)}
        title="Enter Physical Verified Count"
      >
        {selectedItem && (
          <form onSubmit={handleSaveItemCount} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">{selectedItem.product_name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{selectedItem.product_sku}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Recorded Stock</span>
                <span className="text-sm font-black text-slate-800">{selectedItem.recorded_stock} units</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Physically Counted Units on Floor
              </label>
              <input
                type="number"
                min="0"
                required
                value={editCount}
                onChange={(e) => setEditCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-hidden focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Difference: <strong className={editCount - selectedItem.recorded_stock === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {editCount - selectedItem.recorded_stock > 0 ? `+${editCount - selectedItem.recorded_stock}` : editCount - selectedItem.recorded_stock} units
                </strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Discrepancy Reason</label>
              <select
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              >
                <option value="Physical count verified match">Physical count verified match</option>
                <option value="Damaged in warehouse transit">Damaged in warehouse transit</option>
                <option value="Supplier short-shipment undetected">Supplier short-shipment undetected</option>
                <option value="Customer return unrecorded in system">Customer return unrecorded in system</option>
                <option value="Barcode scanning data entry error">Barcode scanning data entry error</option>
                <option value="Suspected theft / shrinkage">Suspected theft / shrinkage</option>
                <option value="Other discrepancy">Other discrepancy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recommended Corrective Action</label>
              <input
                type="text"
                value={editAction}
                onChange={(e) => setEditAction(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditItemModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingItem}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
              >
                {savingItem ? 'Saving...' : 'Confirm Count'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: Authorized Reconciliation */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Authorize Stock Discrepancy Reconciliation"
      >
        {itemToResolve && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Authorized Inventory Adjustment Action</span>
              </p>
              <p className="leading-relaxed">
                Applying this adjustment will update <strong>{itemToResolve.product_name}</strong> in the primary product catalog and warehouse inventory ledger from <strong>{itemToResolve.recorded_stock}</strong> to verified physical count <strong>{itemToResolve.physical_stock}</strong> ({itemToResolve.difference > 0 ? `+${itemToResolve.difference}` : itemToResolve.difference} units).
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Corrective Action Documentation</label>
              <textarea
                rows={2}
                value={resolveActionNotes}
                onChange={(e) => setResolveActionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              This action will be permanently recorded in the audit log under user clearance: <strong>{user?.full_name} ({currentRole})</strong>.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={resolving}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                {resolving ? 'Reconciling...' : 'Confirm Inventory Adjustment'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: CSV Import */}
      <Modal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        title="Batch Import Physical Verified Stock Counts"
      >
        <form onSubmit={handleCsvImportSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Upload a certified CSV containing physically counted stock from hand scanners. Columns expected: <code>sku, physical_stock, reason</code>.
          </p>

          <input
            type="file"
            accept=".csv"
            required
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />

          {importResult && (
            <div className={`p-3 rounded-xl text-xs ${importResult.error ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {importResult.error || importResult.message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCsvModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={importingCsv}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
            >
              {importingCsv ? 'Processing...' : 'Upload & Sync Counts'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AuditOperations;
