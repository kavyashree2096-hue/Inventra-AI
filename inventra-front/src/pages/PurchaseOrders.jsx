import React, { useState, useEffect } from 'react';
import {
  FileText, Truck, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, RefreshCw, Plus, PackageCheck, Eye, Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { procurementService } from '../services/procurementService';
import Modal from '../components/Modal';

const poStatusStyles = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
  Approved: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
  Ordered: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
  'In Transit': 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
  Received: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Delayed: 'bg-red-100 text-red-800 border-red-300 font-bold'
};

const PurchaseOrdersPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedPO, setSelectedPO] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [replenishToast, setReplenishToast] = useState(null);

  const loadPOs = async () => {
    setLoading(true);
    try {
      const pos = await procurementService.getPurchaseOrders({ status: statusFilter });
      setPurchaseOrders(pos || []);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOs();
  }, [statusFilter]);

  const handleUpdateStatus = async (poId, newStatus) => {
    setUpdatingId(poId);
    try {
      const res = await procurementService.updatePOStatus(poId, newStatus);
      if (newStatus === 'Received') {
        // Fire confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setReplenishToast(`Shipment received! Warehouse inventory has been automatically replenished.`);
        setTimeout(() => setReplenishToast(null), 6000);
      }
      loadPOs();
      if (selectedPO && selectedPO.id === poId) {
        setSelectedPO(res.purchase_order);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update PO status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      po.po_number?.toLowerCase().includes(q) ||
      po.supplier_company?.toLowerCase().includes(q)
    );
  });

  if (loading && purchaseOrders.length === 0) {
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
            Purchase Orders & Freight Delivery
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Track active shipments, verify vendor fulfillment, and trigger automated stock replenishment
          </p>
        </div>

        <button
          onClick={loadPOs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {replenishToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{replenishToast}</span>
          </div>
          <button
            onClick={() => setReplenishToast(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PO number or supplier..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="All">All Purchase Orders</option>
            <option value="Ordered">Ordered</option>
            <option value="In Transit">In Transit</option>
            <option value="Received">Received (Restocked)</option>
            <option value="Approved">Approved</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Purchase Orders Table with Line Item Photos */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">PO Number & Date</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Product Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Expected Delivery</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.map((po) => {
                const bClass = poStatusStyles[po.status] || 'bg-slate-100 text-slate-700';
                return (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 font-mono block">{po.po_number}</span>
                      <span className="text-[10px] text-slate-400">
                        {po.order_date ? new Date(po.order_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {po.supplier_company}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {(po.items || []).slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.product_image}
                            alt={item.product_name}
                            title={`${item.product_name} (${item.quantity} units)`}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80';
                            }}
                          />
                        ))}
                        {(po.items || []).length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            +{po.items.length - 3}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 ml-1 font-medium">
                          {po.items_count} item{po.items_count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{po.total_amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : 'Pending dispatch'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] border ${bClass}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPO(po);
                            setDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {po.status === 'Ordered' && (
                          <button
                            disabled={updatingId === po.id}
                            onClick={() => handleUpdateStatus(po.id, 'In Transit')}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors"
                          >
                            Mark In Transit
                          </button>
                        )}

                        {po.status === 'In Transit' && (
                          <button
                            disabled={updatingId === po.id}
                            onClick={() => handleUpdateStatus(po.id, 'Received')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors"
                            title="Automatically increments warehouse inventory!"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Mark Received</span>
                          </button>
                        )}

                        {po.status === 'Received' && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Restocked</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail PO Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Purchase Order: ${selectedPO?.po_number}`}
        maxWidth="max-w-2xl"
      >
        {selectedPO && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Supplier</span>
                <span className="font-bold text-slate-900">{selectedPO.supplier_company}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Total Amount</span>
                <span className="font-black text-slate-900">₹{selectedPO.total_amount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Current Status</span>
                <span className="font-bold text-indigo-700">{selectedPO.status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Tracking #</span>
                <span className="font-mono text-slate-700">{selectedPO.delivery?.tracking_number || 'N/A'}</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm pt-2">Ordered Product Items</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {(selectedPO.items || []).map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.product_image}
                      alt={it.product_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{it.product_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{it.product_sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{it.quantity} units @ ₹{it.unit_price}</span>
                    <span className="font-black text-emerald-700 text-xs">₹{it.total_price?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedPO.status === 'In Transit' && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-indigo-950">Carrier in Transit</h5>
                  <p className="text-[11px] text-indigo-700">
                    Carrier: {selectedPO.delivery?.carrier || 'Express Freight'}
                  </p>
                </div>
                <button
                  onClick={() => handleUpdateStatus(selectedPO.id, 'Received')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Mark Received & Update Inventory
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseOrdersPage;
