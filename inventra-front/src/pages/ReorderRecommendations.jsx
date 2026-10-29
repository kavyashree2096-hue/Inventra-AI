import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, ShoppingBag, AlertTriangle, AlertCircle,
  Calendar, CheckCircle2, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { forecastService } from '../services/forecastService';
import { procurementService } from '../services/procurementService';
import Modal from '../components/Modal';

const priorityBadgeStyles = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-300 font-black',
  High: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
  Low: 'bg-slate-100 text-slate-700 border-slate-200'
};

const ReorderRecommendationsPage = () => {
  const navigate = useNavigate();
  const [reorders, setReorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick PO Creation Modal
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedReorder, setSelectedReorder] = useState(null);
  const [poQty, setPoQty] = useState(0);
  const [poSupplierId, setPoSupplierId] = useState(1);
  const [poNotes, setPoNotes] = useState('');
  const [poSubmitting, setPoSubmitting] = useState(false);
  const [poSuccess, setPoSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await forecastService.getReorders();
      setReorders(data || []);
    } catch (err) {
      console.error('Failed to load reorders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await forecastService.refreshReorders();
      setReorders(res.reorders || []);
    } catch (err) {
      alert('Failed to recalculate reorders');
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenPOModal = (rec) => {
    setSelectedReorder(rec);
    setPoQty(rec.reorder_quantity);
    setPoNotes(`Automated reorder created for ${rec.product_name} (${rec.priority} Priority).`);
    setPoModalOpen(true);
  };

  const handleCreatePOSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReorder || poQty <= 0) return;
    setPoSubmitting(true);

    try {
      await procurementService.createPurchaseOrder({
        supplier_id: poSupplierId,
        items: [{ product_id: selectedReorder.product_id, quantity: parseInt(poQty) }],
        notes: poNotes,
        status: 'Ordered'
      });
      setPoSuccess(true);
      setTimeout(() => {
        setPoSuccess(false);
        setPoModalOpen(false);
        navigate('/purchase-orders');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create PO');
    } finally {
      setPoSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Smart Reorder Recommendations
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Calculated via Required Stock = Forecast Demand + Safety Stock + Lead-Time Demand
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Recalculate Reorders'}</span>
        </button>
      </div>

      {/* Formula Explainer Pill */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-indigo-950">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="font-extrabold">Autonomous Replenishment Engine:</span>{' '}
            <span>Reorder Quantity = max(0, Required Stock - Available Stock - Incoming Stock)</span>
          </div>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-indigo-700 border border-indigo-200 shadow-2xs">
          {reorders.length} Replenishment Actions
        </span>
      </div>

      {/* Reorders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reorders.map((rec) => {
          const pClass = priorityBadgeStyles[rec.priority] || priorityBadgeStyles.Medium;
          return (
            <div
              key={rec.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Photo & Priority header */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                  <img
                    src={rec.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                    alt={rec.product_name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2.5 py-1 text-xs rounded-full border shadow-xs ${pClass}`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-bold text-slate-400 font-mono block">
                    {rec.product_sku} • {rec.category_name}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1" title={rec.product_name}>
                    {rec.product_name}
                  </h4>
                </div>

                {/* Stock Stats */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current</span>
                    <span className="font-black text-slate-900">{rec.current_stock}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Safety</span>
                    <span className="font-bold text-slate-700">{rec.safety_stock}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pred. Demand</span>
                    <span className="font-black text-indigo-600">{rec.predicted_demand}</span>
                  </div>
                </div>

                {/* Recommended Reorder Banner */}
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-950">Recommended Reorder:</span>
                  <span className="text-base font-black text-indigo-700">
                    {rec.reorder_quantity} units
                  </span>
                </div>

                {/* Reason description */}
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {rec.reason}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenPOModal(rec)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Create Purchase Order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Click PO Creation Modal */}
      <Modal
        isOpen={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        title={`Create Purchase Order for ${selectedReorder?.product_name}`}
      >
        <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
            <img
              src={selectedReorder?.product_image}
              alt={selectedReorder?.product_name}
              className="w-12 h-12 rounded-lg object-cover border border-indigo-200 shrink-0"
            />
            <div>
              <h5 className="font-bold text-indigo-950">{selectedReorder?.product_name}</h5>
              <p className="text-[11px] text-indigo-700">
                Recommended Batch: {selectedReorder?.reorder_quantity} units ({selectedReorder?.priority} Priority)
              </p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Order Quantity (Units)</label>
            <input
              type="number"
              min="1"
              required
              value={poQty}
              onChange={(e) => setPoQty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Sourcing Supplier</label>
            <select
              value={poSupplierId}
              onChange={(e) => setPoSupplierId(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
            >
              <option value="1">Apex Electronics Corp (Lead Time: 3 days, Rating: 4.9★)</option>
              <option value="2">Nexa Logistics & Components (Lead Time: 5 days, Rating: 4.7★)</option>
              <option value="3">PrimeSource Wholesale (Lead Time: 4 days, Rating: 4.5★)</option>
              <option value="4">ZenFlow Eco Manufacturing (Lead Time: 6 days, Rating: 4.8★)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Purchase Order Notes</label>
            <textarea
              rows="2"
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
            />
          </div>

          {poSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Purchase Order created! Redirecting to tracking...</span>
            </div>
          )}

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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-colors shadow-xs"
            >
              {poSubmitting ? 'Creating PO...' : 'Issue Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReorderRecommendationsPage;
