import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Truck, Clock, CheckCircle2, AlertTriangle,
  DollarSign, FileText, Plus, RefreshCw, BarChart2, ShieldCheck,
  Lock, Sparkles, Send, Filter, Eye, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { procurementService } from '../services/procurementService';
import PurchaseCard from '../components/PurchaseCard';
import Modal from '../components/Modal';

const ProcurementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentRole = user?.role || 'Staff';
  const isManagerOrAdmin = ['Admin', 'Manager'].includes(currentRole);

  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'requisitions' | 'analytics'
  const [refreshing, setRefreshing] = useState(false);

  // New PO Modal (Manager/Admin)
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [poQty, setPoQty] = useState(50);
  const [poSupplierId, setPoSupplierId] = useState(1);
  const [poNotes, setPoNotes] = useState('');
  const [poSubmitting, setPoSubmitting] = useState(false);

  // New Requisition Modal (Staff / Floor members)
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqItem, setReqItem] = useState(null);
  const [reqQty, setReqQty] = useState(30);
  const [reqPriority, setReqPriority] = useState('Medium');
  const [reqReason, setReqReason] = useState('Urgent floor restock demand spike');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, costData, reqData] = await Promise.all([
        procurementService.getDashboard().catch((err) => {
          console.warn('Dashboard fetch fallback:', err);
          return null;
        }),
        procurementService.getCostAnalytics().catch((err) => {
          console.warn('Analytics fetch fallback:', err);
          return null;
        }),
        procurementService.getRequisitions().catch((err) => {
          console.warn('Requisitions fetch fallback:', err);
          return [];
        })
      ]);

      setDashboard(dashData || {
        recommended_purchases_count: 0,
        urgent_procurement_count: 0,
        open_pos_count: 0,
        in_transit_pos_count: 0,
        completed_pos_count: 0,
        total_procurement_value: 0,
        recommendations: []
      });
      setAnalytics(costData);
      setRequisitions(reqData || []);
    } catch (err) {
      console.error('Failed to load procurement data:', err);
      // Absolute fallback so page never blocks
      setDashboard({
        recommended_purchases_count: 0,
        urgent_procurement_count: 0,
        open_pos_count: 0,
        in_transit_pos_count: 0,
        completed_pos_count: 0,
        total_procurement_value: 0,
        recommendations: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerate = async () => {
    setRefreshing(true);
    try {
      await procurementService.generateRecommendations();
      await loadData();
    } catch (err) {
      console.error('Failed to regenerate recommendations:', err);
      alert(err.response?.data?.error || 'Failed to trigger recommendation engine');
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenPO = (rec) => {
    if (!isManagerOrAdmin) {
      // If staff, redirect to requisition modal instead
      handleOpenReq(rec);
      return;
    }
    setSelectedCard(rec);
    setPoQty(rec.recommended_quantity);
    setPoSupplierId(rec.supplier_id || 1);
    setPoNotes(`Procurement order for ${rec.product_name} recommended by Inventra AI engine.`);
    setPoModalOpen(true);
  };

  const handleOpenReq = (rec) => {
    setReqItem(rec);
    setReqQty(rec.recommended_quantity || 25);
    setReqPriority(rec.priority || 'Medium');
    setReqReason(`Floor restock requested for ${rec.product_name} (Current stock: ${rec.current_stock})`);
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
      navigate('/purchase-orders');
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

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Connecting to Procurement Matrix...</span>
      </div>
    );
  }

  const recommendations = dashboard?.recommendations || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Inventory Procurement &amp; Supplier Hub
            </h1>
            {!isManagerOrAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Staff Requisition Mode
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Visual purchase recommendations, multi-criteria sourcing, and active purchase order orchestration
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isManagerOrAdmin && (
            <button
              onClick={handleRegenerate}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Recalculating...' : 'Refresh AI Logic'}</span>
            </button>
          )}

          <button
            onClick={() => navigate('/purchase-orders')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Track Freight POs</span>
          </button>
        </div>
      </div>

      {/* Role Notice Banner for Staff */}
      {!isManagerOrAdmin && (
        <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/90 text-sky-900 flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold">Staff Role Clearance Active</span>
            <p className="text-slate-600 leading-relaxed">
              You have operational visibility into restock requirements and can submit <strong>Purchase Requisitions</strong> directly to management. Contract pricing, direct supplier purchase order issuance, and macro cost expenditures are reserved for Managers and Admins.
            </p>
          </div>
        </div>
      )}

      {/* Procurement Dashboard KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Purchases</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{dashboard?.recommended_purchases_count || 0}</h3>
          <span className="text-[11px] text-amber-600 font-bold mt-1 inline-block">
            {dashboard?.urgent_procurement_count || 0} Urgent Action Required
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Open POs</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{dashboard?.open_pos_count || 0}</h3>
          <span className="text-[11px] text-sky-600 font-semibold mt-1 inline-block">
            {dashboard?.in_transit_pos_count || 0} In Transit with carrier
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Restocks</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{dashboard?.completed_pos_count || 0}</h3>
          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
            Auto-replenished to inventory
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Procurement Spend</span>
          {isManagerOrAdmin ? (
            <>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹{dashboard?.total_procurement_value?.toLocaleString()}</h3>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                Across active network suppliers
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                <Lock className="w-4 h-4 text-sky-500" />
                <span className="text-lg font-bold text-slate-500">🔒 Protected</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
                Manager clearance required
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'recommendations'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase Recommendations ({recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requisitions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requisitions'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Internal Requisitions ({requisitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Spend &amp; Supplier Analytics</span>
        </button>
      </div>

      {/* TAB 1: Visual Purchase Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-600" />
                <span>Automated Sourcing Purchase Cards</span>
              </h2>
              <p className="text-xs text-slate-500">
                Multi-criteria ranked supplier matches balancing turnaround time, cost efficiency, and reliability scores.
              </p>
            </div>

            {!isManagerOrAdmin && (
              <span className="text-xs font-semibold text-slate-500">
                Clicking cards triggers internal requisitions for manager sign-off
              </span>
            )}
          </div>

          {recommendations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700">No procurement recommendations currently</h4>
              <p className="text-xs text-slate-400 mt-1">All store and warehouse inventory levels are healthy.</p>
              {isManagerOrAdmin && (
                <button
                  onClick={handleRegenerate}
                  className="mt-4 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold"
                >
                  Force Trigger AI Evaluation
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <PurchaseCard
                  key={rec.id}
                  recommendation={rec}
                  onViewSupplier={() => navigate(`/suppliers`)}
                  onCreatePO={handleOpenPO}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Internal Requisitions */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>Internal Store &amp; Floor Requisitions</span>
              </h2>
              <p className="text-xs text-slate-500">
                Floor staff replenishment requests pending manager review and purchase order generation
              </p>
            </div>
          </div>

          {requisitions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700">No active internal requisitions</h4>
              <p className="text-xs text-slate-400 mt-1">Select any recommendation card or create a new requisition to request stock.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Req #</th>
                    <th className="py-3 px-4">Requested Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Items / Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requisitions.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.requisition_number}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(req.requested_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{req.reason}</p>
                        <span className="text-[10px] text-slate-400">{req.items?.length || 0} products requested</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Monthly Spend & Supplier Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {!isManagerOrAdmin ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Lock className="w-10 h-10 text-sky-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">Cost Analytics Restricted Under Staff Privacy Shield</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Detailed vendor contract expenditures and capital allocation matrices require Inventory Manager or System Admin clearance.
              </p>
            </div>
          ) : (
            analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Monthly Procurement Expenditure</h3>
                  <p className="text-xs text-slate-500 mb-4">Capital allocated for inventory replenishment</p>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthly_spending || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          formatter={(val) => [`₹${val.toLocaleString()}`, 'Expenditure']}
                          contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Bar dataKey="amount" fill="#0284c7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Supplier Spend Concentration</h3>
                  <p className="text-xs text-slate-500 mb-4">Volume allocated across supply chain partners</p>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={analytics.supplier_spending || []}
                        margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="supplier" type="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          formatter={(val) => [`₹${val.toLocaleString()}`, 'Spent']}
                          contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Bar dataKey="amount" fill="#0d9488" radius={[0, 6, 6, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Create PO Modal (Manager / Admin) */}
      <Modal
        isOpen={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        title={`Create Purchase Order for ${selectedCard?.product_name}`}
      >
        <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <img
              src={selectedCard?.product_image}
              alt={selectedCard?.product_name}
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h5 className="font-bold text-slate-900">{selectedCard?.product_name}</h5>
              <p className="text-[11px] text-slate-500">
                Unit Cost: ₹{selectedCard?.unit_cost} • Lead Time: {selectedCard?.lead_time_days} days
              </p>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                Total Estimated PO Value: ₹{(poQty * (selectedCard?.unit_cost || 0)).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Procurement Units</label>
            <input
              type="number"
              min="1"
              required
              value={poQty}
              onChange={(e) => setPoQty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Supplier</label>
            <select
              value={poSupplierId}
              onChange={(e) => setPoSupplierId(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
            >
              <option value="1">Apex Global Tech Ltd (Rating: 4.9★, Reliability: 97.5%)</option>
              <option value="2">Nexa Distribution Group (Rating: 4.7★, Reliability: 93.8%)</option>
              <option value="3">PrimeSource Supply Chain (Rating: 4.5★, Reliability: 91.2%)</option>
              <option value="4">ZenFlow Sustainable Goods (Rating: 4.8★, Reliability: 96.0%)</option>
              <option value="5">Vanguard Industrial Trading (Rating: 4.3★, Reliability: 88.5%)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Purchase Order Instructions</label>
            <textarea
              rows="2"
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPoModalOpen(false)}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={poSubmitting}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold transition-colors shadow-xs"
            >
              {poSubmitting ? 'Issuing PO...' : 'Confirm & Issue PO'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Requisition Modal (Staff / Floor members) */}
      <Modal
        isOpen={reqModalOpen}
        onClose={() => setReqModalOpen(false)}
        title={`Request Stock Requisition for ${reqItem?.product_name}`}
      >
        <form onSubmit={handleCreateReqSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center gap-3">
            <img
              src={reqItem?.product_image}
              alt={reqItem?.product_name}
              className="w-14 h-14 rounded-lg object-cover border border-sky-200 shrink-0"
            />
            <div>
              <h5 className="font-bold text-slate-900">{reqItem?.product_name}</h5>
              <p className="text-[11px] text-slate-500">
                Current Floor Stock: <span className="font-bold text-amber-600">{reqItem?.current_stock} units</span>
              </p>
              <p className="text-[11px] text-sky-700 font-semibold mt-0.5">
                Suggested Restock: {reqItem?.recommended_quantity} units
              </p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Requested Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={reqQty}
              onChange={(e) => setReqQty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Priority</label>
            <select
              value={reqPriority}
              onChange={(e) => setReqPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
            >
              <option value="Low">Low - Normal Shelf Stock</option>
              <option value="Medium">Medium - Regular Restock</option>
              <option value="High">High - Impending Stock-Out</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reason for Requisition</label>
            <textarea
              rows="2"
              required
              value={reqReason}
              onChange={(e) => setReqReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReqModalOpen(false)}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reqSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{reqSubmitting ? 'Submitting...' : 'Submit Requisition'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProcurementPage;
