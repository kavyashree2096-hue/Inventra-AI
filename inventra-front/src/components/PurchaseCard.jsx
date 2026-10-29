import React from 'react';
import { Truck, ShoppingBag, AlertTriangle, ShieldCheck } from 'lucide-react';

const priorityBadge = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200 font-black',
  High: 'bg-amber-100 text-amber-800 border-amber-200 font-bold',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
  Low: 'bg-slate-100 text-slate-700 border-slate-200'
};

const PurchaseCard = ({ recommendation, onViewSupplier, onCreatePO }) => {
  const pClass = priorityBadge[recommendation.priority] || priorityBadge.Medium;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Top Product Image and Priority Header */}
        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
          <img
            src={recommendation.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}
            alt={recommendation.product_name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
            }}
          />
          <div className="absolute top-2.5 right-2.5">
            <span className={`px-2.5 py-1 text-xs rounded-full border shadow-xs ${pClass}`}>
              Priority: {recommendation.priority}
            </span>
          </div>
        </div>

        {/* Product Title */}
        <div className="mb-3">
          <span className="text-[11px] font-bold text-sky-600 block mb-0.5">
            {recommendation.category_name || 'Retail Product'}
          </span>
          <h4 className="text-base font-bold text-slate-900 line-clamp-1" title={recommendation.product_name}>
            Product: {recommendation.product_name}
          </h4>
        </div>

        {/* Operational Inventory Context */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Current Stock</span>
            <span className="font-bold text-slate-800">{recommendation.current_stock}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Pred. Demand</span>
            <span className="font-bold text-sky-600">{recommendation.predicted_demand}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Safety Stock</span>
            <span className="font-bold text-slate-800">{recommendation.safety_stock}</span>
          </div>
        </div>

        {/* Recommended Quantity Highlight */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50 to-teal-50/70 border border-sky-100 text-xs flex items-center justify-between mb-3">
          <span className="font-bold text-sky-900">Recommended Procurement:</span>
          <span className="text-base font-black text-sky-700">
            {recommendation.recommended_quantity} units
          </span>
        </div>

        {/* Recommended Supplier Section */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Recommended Supplier:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-sky-600" />
              {recommendation.supplier_name || 'Prime Supplier'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Unit Cost:</span>
            <span className="font-bold text-slate-800">₹{recommendation.unit_cost}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Lead Time:</span>
            <span className="font-semibold text-slate-700">{recommendation.lead_time_days} Days</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span className="font-bold text-slate-700">Estimated Cost:</span>
            <span className="font-extrabold text-emerald-700 text-sm">
              ₹{recommendation.estimated_cost?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onViewSupplier && onViewSupplier(recommendation)}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          View Supplier
        </button>
        <button
          onClick={() => onCreatePO && onCreatePO(recommendation)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition-all shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Create PO</span>
        </button>
      </div>
    </div>
  );
};

export default PurchaseCard;
