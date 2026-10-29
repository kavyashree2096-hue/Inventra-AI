import React, { useState, useEffect } from 'react';
import {
  Truck, Star, ShieldCheck, Clock, Mail, Phone, MapPin,
  Plus, Search, RefreshCw, Award, ArrowRight, CheckCircle2
} from 'lucide-react';
import { supplierService } from '../services/supplierService';
import { productService } from '../services/productService';
import Modal from '../components/Modal';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(1);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compLoading, setCompLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '', company: '', contact_person: '', email: '',
    phone: '', address: '', rating: 4.5, reliability_score: 92.0,
    lead_time_days: 4, active_status: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [supList, prodRes] = await Promise.all([
        supplierService.getSuppliers(),
        productService.getProducts()
      ]);
      setSuppliers(supList || []);
      setProducts(prodRes.products || []);
      if (prodRes.products && prodRes.products.length > 0) {
        loadComparison(prodRes.products[0].id);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async (prodId) => {
    setSelectedProductId(prodId);
    setCompLoading(true);
    try {
      const comp = await supplierService.compareSuppliers(prodId);
      setComparison(comp);
    } catch (err) {
      console.error('Failed to compare suppliers:', err);
    } finally {
      setCompLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await supplierService.createSupplier(newSupplier);
      setAddModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create supplier');
    }
  };

  if (loading && suppliers.length === 0) {
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
            Supplier Management & Comparison
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Vendor reliability auditing, multi-criteria sourcing matrices, and performance metrics
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Supplier Comparison Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Multi-Criteria Supplier Sourcing Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">
              Select any catalog item to rank suppliers by price, lead time, and reliability
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Compare Product:</span>
            <select
              value={selectedProductId}
              onChange={(e) => loadComparison(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
        </div>

        {compLoading ? (
          <div className="p-8 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : comparison ? (
          <div className="space-y-6">
            {/* Product summary strip with photo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center gap-3">
                <img
                  src={comparison.product_image}
                  alt={comparison.product_name}
                  className="w-14 h-14 rounded-xl object-cover border border-indigo-200 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{comparison.product_name}</h4>
                  <p className="text-xs text-indigo-700 font-mono">{comparison.product_sku} • Current Stock: {comparison.current_stock} units</p>
                </div>
              </div>

              {comparison.recommended_supplier_name && (
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black shadow-2xs">
                  Recommended: {comparison.recommended_supplier_name}
                </div>
              )}
            </div>

            {comparison.recommendation_reason && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
                💡 <strong>AI Analysis:</strong> {comparison.recommendation_reason}
              </div>
            )}

            {/* Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(comparison.candidates || []).map((cand, idx) => {
                const isBest = cand.supplier_id === comparison.recommended_supplier_id;
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isBest
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-sm ring-1 ring-indigo-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{cand.supplier_company}</h5>
                        <span className="text-[10px] text-slate-400 font-medium">Score: {cand.ai_score} pts</span>
                      </div>
                      {isBest && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          Best Choice
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 my-4">
                      <div className="flex justify-between p-1.5 rounded-lg bg-white/70">
                        <span>Unit Sourcing Cost:</span>
                        <strong className="text-slate-900 font-black">₹{cand.unit_price}</strong>
                      </div>
                      <div className="flex justify-between p-1.5 rounded-lg bg-white/70">
                        <span>Delivery Lead Time:</span>
                        <strong className="text-slate-800 font-bold">{cand.lead_time_days} Days</strong>
                      </div>
                      <div className="flex justify-between p-1.5 rounded-lg bg-white/70">
                        <span>Reliability Metric:</span>
                        <strong className="text-emerald-700 font-bold">{cand.reliability_score}%</strong>
                      </div>
                      <div className="flex justify-between p-1.5 rounded-lg bg-white/70">
                        <span>Supplier Rating:</span>
                        <strong className="text-amber-600 font-bold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          {cand.rating}★
                        </strong>
                      </div>
                      <div className="flex justify-between p-1.5 rounded-lg bg-white/70">
                        <span>Minimum Order Qty:</span>
                        <strong className="text-slate-800">{cand.min_order_qty} units</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Full Supplier Directory Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Registered Sourcing Suppliers ({suppliers.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((s) => (
            <div key={s.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.company}</h4>
                    <p className="text-xs text-slate-500">{s.name}</p>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{s.rating}</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 my-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Average Lead Time: <strong>{s.lead_time_days} Days</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Reliability Score: <strong>{s.reliability_score}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.address || 'Global Supply Hub'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Orders: {s.total_orders || 0}</span>
                <span className="font-bold text-slate-800">Spent: ₹{(s.total_spent || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Sourcing Supplier"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                required
                value={newSupplier.company}
                onChange={(e) => setNewSupplier({ ...newSupplier, company: e.target.value })}
                placeholder="Zenith Micro Supplies"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={newSupplier.contact_person}
                onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                placeholder="Kenji Sato"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                required
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                placeholder="procurement@zenith.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone</label>
              <input
                type="tel"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                placeholder="+1 800-555-0199"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Time (Days)</label>
              <input
                type="number"
                value={newSupplier.lead_time_days}
                onChange={(e) => setNewSupplier({ ...newSupplier, lead_time_days: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Reliability %</label>
              <input
                type="number"
                step="0.1"
                value={newSupplier.reliability_score}
                onChange={(e) => setNewSupplier({ ...newSupplier, reliability_score: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                max="5"
                min="1"
                value={newSupplier.rating}
                onChange={(e) => setNewSupplier({ ...newSupplier, rating: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Address / Hub</label>
            <input
              type="text"
              value={newSupplier.address}
              onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              placeholder="742 Evergreen Pkwy, San Jose, CA"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs"
            >
              Register Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
