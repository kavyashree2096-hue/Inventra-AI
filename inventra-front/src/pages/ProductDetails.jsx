import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, Truck, LineChart, ShieldCheck,
  TrendingUp, Boxes, RefreshCw, Star, Clock, AlertTriangle
} from 'lucide-react';
import { productService } from '../services/productService';
import { supplierService } from '../services/supplierService';

const statusBadgeStyles = {
  Healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  'Stock-Out': 'bg-red-100 text-red-800 border-red-300 font-bold',
  Overstock: 'bg-purple-50 text-purple-700 border-purple-200',
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [prodData, compData] = await Promise.all([
          productService.getProduct(id),
          supplierService.compareSuppliers(id)
        ]);
        setProduct(prodData);
        setComparison(compData);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading || !product) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const bClass = statusBadgeStyles[product.status] || 'bg-slate-100 text-slate-700';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </button>
      </div>

      {/* Main Product Hero Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Photo Container */}
        <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
            }}
          />
          <div className="absolute top-3.5 right-3.5">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs ${bClass}`}>
              {product.status}
            </span>
          </div>
        </div>

        {/* Info & Metrics */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>{product.category_name}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">{product.sku}</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              {product.description || 'Enterprise retail SKU with active automated demand modeling.'}
            </p>

            {/* Financial & Stock Details */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Selling Price</span>
                <span className="text-base font-black text-slate-900">₹{product.selling_price}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Cost Price</span>
                <span className="text-base font-black text-slate-700">₹{product.cost_price}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Gross Margin</span>
                <span className="text-base font-black text-emerald-600">{product.margin_pct}%</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Available Stock</span>
                <span className="text-base font-black text-indigo-700">{product.current_stock} {product.unit}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Safety Stock</span>
                <span className="text-base font-bold text-slate-800">{product.safety_stock}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Reorder Point</span>
                <span className="text-base font-bold text-slate-800">{product.reorder_point}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() => navigate(`/procurement?product_id=${product.id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Initiate Procurement for this Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Supplier Comparison Matrix */}
      {comparison && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span>Supplier Sourcing Matrix & Multi-Criteria Ranking</span>
              </h3>
              <p className="text-xs text-slate-500">
                Comparing unit costs, turnaround lead times, MOQ thresholds, and verified supplier reliability
              </p>
            </div>
            {comparison.recommended_supplier_name && (
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                AI Pick: {comparison.recommended_supplier_name}
              </span>
            )}
          </div>

          {comparison.recommendation_reason && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed font-medium">
              💡 <strong>AI Rationale:</strong> {comparison.recommendation_reason}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(comparison.candidates || []).map((cand, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  cand.supplier_id === comparison.recommended_supplier_id
                    ? 'bg-indigo-50/40 border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{cand.supplier_company}</h4>
                  {cand.supplier_id === comparison.recommended_supplier_id && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      Rank #1
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 my-3">
                  <div className="flex justify-between">
                    <span>Unit Cost:</span>
                    <strong className="text-slate-900">₹{cand.unit_price}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lead Time:</span>
                    <strong className="text-slate-800">{cand.lead_time_days} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Reliability Score:</span>
                    <strong className="text-emerald-700">{cand.reliability_score}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplier Rating:</span>
                    <strong className="text-amber-600 flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      {cand.rating}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Order:</span>
                    <strong className="text-slate-800">{cand.min_order_qty} units</strong>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/procurement?product_id=${product.id}&supplier_id=${cand.supplier_id}`)}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-center transition-colors bg-white hover:bg-slate-100 border border-slate-200 text-slate-800"
                >
                  Select Supplier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
