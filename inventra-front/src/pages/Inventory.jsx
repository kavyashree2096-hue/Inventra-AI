import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, Activity, AlertTriangle, AlertOctagon, Layers,
  Zap, Clock, ShoppingCart, RefreshCw, Edit3, ArrowRight,
  ShieldCheck, Search, Filter, CheckCircle2
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import Modal from '../components/Modal';

const statusBadgeStyles = {
  Healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  'Stock-Out': 'bg-red-100 text-red-800 border-red-300 font-bold',
  Overstock: 'bg-purple-50 text-purple-700 border-purple-200',
  'Fast Moving': 'bg-blue-50 text-blue-700 border-blue-200',
  'Slow Moving': 'bg-slate-100 text-slate-700 border-slate-200'
};

const InventoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'fast', 'slow', 'stockouts', 'overstock'
  const [inventory, setInventory] = useState([]);
  const [health, setHealth] = useState(null);
  const [fastMoving, setFastMoving] = useState([]);
  const [slowMoving, setSlowMoving] = useState([]);
  const [stockouts, setStockouts] = useState([]);
  const [overstock, setOverstock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('Routine physical inventory cycle count');
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [invRes, healthRes, fastRes, slowRes, stockoutRes, overstockRes] = await Promise.all([
        inventoryService.getInventory({ search }),
        inventoryService.getHealth(),
        inventoryService.getFastMoving(15),
        inventoryService.getSlowMoving(15),
        inventoryService.getStockouts(),
        inventoryService.getOverstock()
      ]);
      setInventory(invRes.inventory || []);
      setHealth(healthRes);
      setFastMoving(fastRes || []);
      setSlowMoving(slowRes || []);
      setStockouts(stockoutRes || []);
      setOverstock(overstockRes || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [search]);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !newQuantity) return;

    try {
      await inventoryService.adjustStock(selectedProduct.id, parseInt(newQuantity), adjustReason);
      setAdjustSuccess(true);
      loadAll();
      setTimeout(() => {
        setAdjustModalOpen(false);
        setAdjustSuccess(false);
        setSelectedProduct(null);
        setNewQuantity('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Adjustment failed');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory Optimization & Telemetry
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Real-time multi-location warehouse tracking, velocity classifications, and stock risk detection
          </p>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Inventory Health Score Banner */}
      {health && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border shadow-sm ${
              health.score >= 80
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {health.score}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Network Inventory Health: {health.status}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Target: 85+
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Composite evaluation of stock-outs, critical deficits, safety buffers, and excess capital.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Stock-Outs</span>
              <span className="text-sm font-black text-rose-600">{health.stock_outs} SKUs</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Critical / Low</span>
              <span className="text-sm font-black text-amber-600">
                {health.critical_items + health.low_stock_items} SKUs
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Overstock</span>
              <span className="text-sm font-black text-violet-600">{health.overstock_items} SKUs</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'catalog', label: 'All Inventory Items', count: inventory.length },
          { id: 'fast', label: 'Fast-Moving Velocity', count: fastMoving.length },
          { id: 'slow', label: 'Slow-Moving & Aging', count: slowMoving.length },
          { id: 'stockouts', label: 'Stock-Out Predictions', count: stockouts.length, alert: stockouts.length > 0 },
          { id: 'overstock', label: 'Overstock Detection', count: overstock.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : tab.alert
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: All Inventory Catalog */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU or product name..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 outline-none"
              />
            </div>

            <button
              onClick={() => navigate('/reorders')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
            >
              <span>View Reorder Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Safety Stock</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Inventory Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item, idx) => {
                  const bClass = statusBadgeStyles[item.status] || 'bg-slate-100 text-slate-700';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.warehouse_name || 'Central Hub'}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 text-sm">
                        {item.current_stock} {item.unit || 'units'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {item.safety_stock}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {item.reorder_point}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        ₹{item.inventory_value?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] border ${bClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setNewQuantity(item.current_stock);
                            setAdjustModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Manual Stock Audit Adjustment"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Fast-Moving Product Analysis */}
      {activeTab === 'fast' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span>Fast-Moving Product Velocity Analysis</span>
            </h3>
            <p className="text-xs text-slate-500">Products with highest daily turnover velocity requiring consistent stock replenishment</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">30-Day Units Sold</th>
                  <th className="py-3 px-4">Avg Daily Sales</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Days Remaining</th>
                  <th className="py-3 px-4">Recommended Reorder</th>
                  <th className="py-3 px-4">Stock Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fastMoving.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.units_sold_30d} units</td>
                    <td className="py-3 px-4 font-black text-indigo-600">{p.avg_daily_sales} / day</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.current_stock} units</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {p.days_of_inventory_remaining} days
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-700">
                      {p.recommended_reorder_qty} units
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        p.urgency === 'Immediate'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {p.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Slow-Moving Product Analysis */}
      {activeTab === 'slow' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Slow-Moving Product Aging & Markdown Recommendations</span>
            </h3>
            <p className="text-xs text-slate-500">Products with sluggish sales tying up capital</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Units Sold (30d)</th>
                  <th className="py-3 px-4">Days Since Last Sale</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Capital Tied Up</th>
                  <th className="py-3 px-4">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slowMoving.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{p.units_sold_30d} units</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{p.days_since_last_sale} days</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.current_stock} units</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{p.inventory_value?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-indigo-700 font-semibold text-[11px]">
                      {p.suggested_action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Stock-Out Predictions */}
      {activeTab === 'stockouts' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <span>Stock-Out Risk Telemetry</span>
            </h3>
            <p className="text-xs text-slate-500">Products where projected daily demand exceeds current inventory buffer</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockouts.map((risk, i) => (
              <div key={i} className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[10px]">
                      {risk.stockout_risk}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700">
                      ~{risk.estimated_days_remaining} Days Left
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <img
                      src={risk.image_url}
                      alt={risk.name}
                      className="w-14 h-14 rounded-xl object-cover border border-rose-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{risk.name}</h4>
                      <p className="text-xs text-slate-500">
                        Current: <strong>{risk.current_stock} units</strong> | Usage: ~{risk.predicted_daily_usage} / day
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-rose-100">
                    {risk.recommended_action}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200 flex justify-end">
                  <button
                    onClick={() => navigate('/procurement')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                  >
                    <span>Procure Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Overstock Detection */}
      {activeTab === 'overstock' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-600" />
              <span>Overstock & Capital Bloat Detection</span>
            </h3>
            <p className="text-xs text-slate-500">Inventory exceeding maximum holding capacity</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {overstock.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                      Overstock Surplus
                    </span>
                    <span className="text-xs font-bold text-purple-700">
                      +{item.excess_units} Units Excess
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-purple-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        Current: <strong>{item.current_stock}</strong> (Max recommended: {item.max_recommended_stock})
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-purple-100 text-xs">
                    <span className="text-slate-500 block">Tied-Up Working Capital:</span>
                    <span className="font-black text-purple-900 text-base">₹{item.excess_stock_value?.toLocaleString()}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {item.suggested_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Stock Level: ${selectedProduct?.name}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500">Recorded Current Stock:</span>
            <span className="font-black text-slate-900 text-sm">{selectedProduct?.current_stock} units</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Counted Physical Quantity
            </label>
            <input
              type="number"
              min="0"
              required
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Adjustment Reason
            </label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
            />
          </div>

          {adjustSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Stock level updated and logged in audit log!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
