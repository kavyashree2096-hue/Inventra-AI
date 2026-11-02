import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Truck, Clock, CheckCircle2, AlertTriangle,
  DollarSign, FileText, Plus, RefreshCw, BarChart2, ShieldCheck,
  Lock, Sparkles, Send, Filter, Eye, ArrowRight, Package, Tag,
  Download, Search, X, Check, ArrowUpDown, ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { procurementService } from '../services/procurementService';
import PurchaseCard from '../components/PurchaseCard';
import Modal from '../components/Modal';

const STATUS_BADGES = {
  'Out of Stock': 'bg-rose-50 text-rose-700 border-rose-200',
  'Reorder Required': 'bg-amber-50 text-amber-700 border-amber-200',
  'Low Stock': 'bg-orange-50 text-orange-700 border-orange-200',
  'Pending Procurement': 'bg-sky-50 text-sky-700 border-sky-200',
  'Procurement Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Sufficient Stock': 'bg-slate-100 text-slate-700 border-slate-200'
};

const PIE_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const ProcurementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentRole = user?.role || 'Staff';
  const isManagerOrAdmin = ['Admin', 'Manager'].includes(currentRole);

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'recommendations' | 'requisitions' | 'charts'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [procurementProducts, setProcurementProducts] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [chartsData, setChartsData] = useState(null);

  // Filters for category product listing
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('status');
  const [sortOrder, setSortOrder] = useState('asc');

  // Category mapping modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedProductToMap, setSelectedProductToMap] = useState(null);
  const [newCategoryId, setNewCategoryId] = useState('1');
  const [mappingLoading, setMappingLoading] = useState(false);

  // New PO Modal (Manager/Admin)
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [poQty, setPoQty] = useState(50);
  const [poSupplierId, setPoSupplierId] = useState(1);
  const [poNotes, setPoNotes] = useState('');
  const [poSubmitting, setPoSubmitting] = useState(false);

  // New Requisition Modal (Staff / Floor)
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqItem, setReqItem] = useState(null);
  const [reqQty, setReqQty] = useState(30);
  const [reqPriority, setReqPriority] = useState('Medium');
  const [reqReason, setReqReason] = useState('Urgent floor restock demand spike');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Receive PO Modal
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPoToReceive, setSelectedPoToReceive] = useState(null);
  const [receiveNotes, setReceiveNotes] = useState('Goods verified and placed into warehouse storage.');
  const [receiving, setReceiving] = useState(false);

  // Cancel PO Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedPoToCancel, setSelectedPoToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Supplier unable to meet delivery SLA');
  const [cancelling, setCancelling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, dashRes, prodRes, reqRes, chartRes] = await Promise.all([
        procurementService.getSummary().catch(() => null),
        procurementService.getDashboard().catch(() => null),
        procurementService.getProcurementProducts({
          category_id: selectedCategory || undefined,
          search: searchQuery || undefined,
          status: statusFilter,
          sort_by: sortBy,
          order: sortOrder
        }).catch(() => ({ products: [] })),
        procurementService.getRequisitions().catch(() => []),
        procurementService.getCharts().catch(() => null)
      ]);

      setSummary(sumRes);
      setDashboard(dashRes);
      setProcurementProducts(prodRes.products || []);
      setRequisitions(reqRes || []);
      setChartsData(chartRes);
    } catch (err) {
      console.error('Failed to load procurement data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, statusFilter, sortBy, sortOrder]);

  // Debounced search on product catalog
  useEffect(() => {
    const timer = setTimeout(() => {
      procurementService.getProcurementProducts({
        category_id: selectedCategory || undefined,
        search: searchQuery || undefined,
        status: statusFilter,
        sort_by: sortBy,
        order: sortOrder
      }).then((res) => {
        setProcurementProducts(res.products || []);
      }).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRegenerate = async () => {
    setRefreshing(true);
    try {
      await procurementService.generateRecommendations();
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to trigger recommendation engine');
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenPO = (prod) => {
    if (!isManagerOrAdmin) {
      handleOpenReq(prod);
      return;
    }
    setSelectedCard(prod);
    setPoQty(prod.suggested_quantity || 30);
    setPoSupplierId(1);
    setPoNotes(`Procurement order for ${prod.name} created via Procurement Hub.`);
    setPoModalOpen(true);
  };

  const handleOpenReq = (prod) => {
    setReqItem(prod);
    setReqQty(prod.suggested_quantity || 25);
    setReqPriority('Medium');
    setReqReason(`Floor restock requested for ${prod.name} (Current: ${prod.current_stock}, Target: ${prod.target_stock})`);
    setReqModalOpen(true);
  };

  const handleCreatePOSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCard || poQty <= 0) return;
    setPoSubmitting(true);

    try {
      await procurementService.createPurchaseOrder({
        supplier_id: poSupplierId,
        items: [{ product_id: selectedCard.product_id, quantity: parseInt(poQty), unit_price: selectedCard.unit_cost }],
        notes: poNotes,
        status: 'Ordered'
      });
      setPoModalOpen(false);
      alert('Purchase Order successfully created and recorded in system audit log!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create PO');
    } finally {
      setPoSubmitting(false);
    }
  };

  const handleCreateReqSubmit = async (e) => {
    e.preventDefault();
    if (!reqItem || reqQty <= 0) return;
    setReqSubmitting(true);

    try {
      await procurementService.createRequisition({
        items: [{ product_id: reqItem.product_id, quantity: parseInt(reqQty) }],
        reason: reqReason,
        priority: reqPriority
      });
      setReqModalOpen(false);
      alert('Internal Requisition submitted successfully! Manager approval pending.');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create requisition');
    } finally {
      setReqSubmitting(false);
    }
  };

  const handleSaveCategoryMapping = async (e) => {
    e.preventDefault();
    if (!selectedProductToMap) return;
    setMappingLoading(true);
    try {
      await procurementService.updateProductCategory(selectedProductToMap.product_id, parseInt(newCategoryId));
      setCategoryModalOpen(false);
      setSelectedProductToMap(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update product category');
    } finally {
      setMappingLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    const url = procurementService.getExportUrl();
    window.open(url, '_blank');
  };

  if (loading && !summary) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Connecting to Procurement Matrix...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
              Procurement Intelligence
            </span>
            <span className="text-[10px] font-bold text-slate-400">• Persistent Catalog &amp; Supplier Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-sky-600" />
            <span>Procurement &amp; Replenishment Hub</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Category-wise product replenishment, purchase requisition lifecycle, and authorized goods receipt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isManagerOrAdmin && (
            <button
              onClick={handleRegenerate}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Recalculating...' : 'Refresh AI Logic'}</span>
            </button>
          )}

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/purchase-orders')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Goods Receipts &amp; POs</span>
          </button>
        </div>
      </div>

      {/* E. PROCUREMENT SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total Products', value: summary?.total_products || 0, color: 'text-slate-900' },
          { label: 'Reorder Required', value: summary?.products_requiring_reorder || 0, color: 'text-amber-600 font-bold' },
          { label: 'Out of Stock', value: summary?.out_of_stock_products || 0, color: 'text-rose-600 font-bold' },
          { label: 'Pending Requests', value: summary?.pending_procurement_requests || 0, color: 'text-sky-600' },
          { label: 'Approved Requests', value: summary?.approved_procurement_requests || 0, color: 'text-teal-600' },
          { label: 'Ordered In Transit', value: summary?.ordered_products || 0, color: 'text-indigo-600' },
          { label: 'Est. Replenish Cost', value: `₹${summary?.estimated_procurement_cost?.toLocaleString() || 0}`, color: 'text-slate-900' }
        ].map((card, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase leading-tight">{card.label}</span>
            <span className={`text-lg sm:text-xl font-black mt-1 block ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-2xl text-xs font-semibold">
        {[
          { id: 'catalog', label: 'Category Product Listing', icon: Package },
          { id: 'recommendations', label: '1-Click Purchase Cards', icon: ShoppingCart },
          { id: 'requisitions', label: 'Internal Requisitions', icon: FileText },
          { id: 'charts', label: 'Procurement Charts', icon: BarChart2 }
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

      {/* TAB 1: CATEGORY-WISE PRODUCT LISTING */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <option value="">All Categories</option>
                <option value="1">Electronics &amp; Gadgets</option>
                <option value="2">Home &amp; Living</option>
                <option value="3">Apparel &amp; Accessories</option>
                <option value="4">Health &amp; Personal Care</option>
                <option value="5">Gourmet &amp; Pantry</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Reorder Required">Reorder Required</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pending Procurement">Pending Procurement</option>
                <option value="Procurement Completed">Procurement Completed</option>
                <option value="Sufficient Stock">Sufficient Stock</option>
              </select>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
              >
                <option value="status">Sort by Status Urgency</option>
                <option value="stock">Sort by Current Stock</option>
                <option value="name">Sort by Product Name</option>
                <option value="cost">Sort by Replenishment Cost</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900"
                title="Toggle Sort Order"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Stock / Target</th>
                    <th className="py-3 px-3 text-center">Suggested Qty</th>
                    <th className="py-3 px-3 text-right">Unit Cost</th>
                    <th className="py-3 px-3 text-right">Est. Cost</th>
                    <th className="py-3 px-3">Procurement Status</th>
                    <th className="py-3 px-3">Primary Supplier</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {procurementProducts.map((p) => (
                    <tr key={p.product_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                              SKU
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700">{p.category_name}</span>
                          {isManagerOrAdmin && (
                            <button
                              onClick={() => {
                                setSelectedProductToMap(p);
                                setNewCategoryId(String(p.category_id || 1));
                                setCategoryModalOpen(true);
                              }}
                              className="text-[10px] text-sky-600 hover:text-sky-800 underline font-semibold"
                              title="Map Category"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-extrabold text-slate-900">{p.current_stock}</span>
                        <span className="text-slate-400 text-[10px]"> / {p.target_stock}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`font-mono font-black px-2 py-0.5 rounded-md text-[11px] ${
                          p.suggested_quantity > 0 ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {p.suggested_quantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono">₹{p.unit_cost}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{p.estimated_cost?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGES[p.procurement_status] || 'bg-slate-100'}`}>
                          {p.procurement_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-600 font-medium">
                        {p.supplier_name}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenPO(p)}
                          className="px-3 py-1 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-bold text-[11px] transition-all border border-sky-200 hover:border-transparent"
                        >
                          {isManagerOrAdmin ? 'Issue PO' : 'Requisition'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {procurementProducts.length === 0 && (
                    <tr>
                      <td colSpan="9" className="py-10 text-center text-slate-400">
                        No products match the selected category or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 1-CLICK PURCHASE CARDS (EXISTING PRESERVED) */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(dashboard?.recommendations || []).map((rec) => (
              <PurchaseCard
                key={rec.id}
                recommendation={rec}
                onOrder={() => handleOpenPO(rec)}
                role={currentRole}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERNAL REQUISITIONS (EXISTING PRESERVED) */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Purchase Requisitions Pipeline</h3>
                <p className="text-xs text-slate-500">Internal restocking requests submitted by floor personnel</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Req #</th>
                    <th className="py-3 px-3">Requested By</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Items</th>
                    <th className="py-3 px-3">Est Cost</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {requisitions.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{req.requisition_number}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{req.requested_by_name}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.priority === 'Critical' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">{req.items_count} items</td>
                      <td className="py-3.5 px-3 font-mono font-bold">₹{req.total_estimated_cost?.toLocaleString()}</td>
                      <td className="py-3.5 px-3 font-semibold">{req.status}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isManagerOrAdmin && req.status === 'Pending' && (
                          <button
                            onClick={async () => {
                              await procurementService.updateRequisitionStatus(req.id, 'Approved');
                              loadData();
                            }}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requisitions.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No pending purchase requisitions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROCUREMENT CHARTS (SECTION 2.F) */}
      {activeTab === 'charts' && chartsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Reorder by Category */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Products Requiring Reorder by Category</h3>
            <p className="text-[11px] text-slate-500">Number of low-stock SKUs triggering replenishment</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.reorder_by_category}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Reorder Products" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Current Stock vs Target Stock */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Current Stock vs Target Level</h3>
            <p className="text-[11px] text-slate-500">Deficit gap analysis for top needy catalog items</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.stock_vs_target}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="current_stock" name="Current Stock" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target_stock" name="Target Stock" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Requests by Status */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Purchase Orders by Status</h3>
            <p className="text-[11px] text-slate-500">Current lifecycle states of vendor commitments</p>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.requests_by_status}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {chartsData.requests_by_status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Replenishment Cost by Category */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Estimated Procurement Cost by Category</h3>
            <p className="text-[11px] text-slate-500">Projected expenditure in INR to restore full target holding</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.cost_by_category}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                  <Bar dataKey="cost" name="Est. Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Map Category */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Map Product Category"
      >
        {selectedProductToMap && (
          <form onSubmit={handleSaveCategoryMapping} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 text-xs">{selectedProductToMap.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">SKU: {selectedProductToMap.sku}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Department / Category</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              >
                <option value="1">Electronics &amp; Gadgets</option>
                <option value="2">Home &amp; Living</option>
                <option value="3">Apparel &amp; Accessories</option>
                <option value="4">Health &amp; Personal Care</option>
                <option value="5">Gourmet &amp; Pantry</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mappingLoading}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
              >
                {mappingLoading ? 'Saving...' : 'Save Mapping'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: Issue PO */}
      <Modal
        isOpen={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        title="Issue Purchase Order to Supplier"
      >
        {selectedCard && (
          <form onSubmit={handleCreatePOSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">{selectedCard.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">Cost: ₹{selectedCard.unit_cost} / unit</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Suggested Qty</span>
                <span className="font-bold text-sky-700 text-sm">{selectedCard.suggested_quantity} units</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Approved Purchase Order Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={poQty}
                onChange={(e) => setPoQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Total Commitment Value: <strong>₹{(poQty * selectedCard.unit_cost).toLocaleString()}</strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Vendor / Supplier</label>
              <select
                value={poSupplierId}
                onChange={(e) => setPoSupplierId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              >
                <option value={1}>Apex Logistics &amp; Hardware Ltd.</option>
                <option value={2}>Nordic Design Warehousing Inc.</option>
                <option value={3}>AeroTech Supply Chain Co.</option>
                <option value={4}>Nexus Global Electronics</option>
                <option value={5}>Heritage Organics Logistics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Internal PO Notes</label>
              <input
                type="text"
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={poSubmitting}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
              >
                {poSubmitting ? 'Creating PO...' : 'Confirm & Issue Purchase Order'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: Staff Requisition */}
      <Modal
        isOpen={reqModalOpen}
        onClose={() => setReqModalOpen(false)}
        title="Submit Stock Requisition Request"
      >
        {reqItem && (
          <form onSubmit={handleCreateReqSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 text-xs">{reqItem.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">Current Floor Stock: {reqItem.current_stock} units</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Requested Requisition Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={reqQty}
                onChange={(e) => setReqQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Urgency Priority</label>
              <select
                value={reqPriority}
                onChange={(e) => setReqPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              >
                <option value="Low">Low - Normal Replenishment</option>
                <option value="Medium">Medium - Standard Operational</option>
                <option value="High">High - Impending Stockout</option>
                <option value="Critical">Critical - Floor Exhaustion</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Justification Reason</label>
              <textarea
                rows={2}
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReqModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reqSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                {reqSubmitting ? 'Submitting...' : 'Send to Manager'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProcurementPage;
