import React from 'react';
import { Eye, ShoppingCart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusBadgeStyles = {
  'Healthy': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  'Critical': 'bg-rose-50 text-rose-700 border-rose-200',
  'Stock-Out': 'bg-red-100 text-red-800 border-red-300 font-bold',
  'Overstock': 'bg-purple-50 text-purple-700 border-purple-200',
  'Fast Moving': 'bg-blue-50 text-blue-700 border-blue-200',
  'Slow Moving': 'bg-slate-100 text-slate-700 border-slate-200'
};

const ProductCard = ({ product, onProcure }) => {
  const navigate = useNavigate();
  const badgeClass = statusBadgeStyles[product.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Product Image Container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
          }}
        />
        {/* Status Badge overlay */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border shadow-xs ${badgeClass}`}>
            {product.status || 'Healthy'}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>{product.category_name || 'General'}</span>
            <span className="font-mono">{product.sku}</span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1" title={product.name}>
            {product.name}
          </h4>

          {/* Pricing & Stock Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Price</span>
              <span className="font-bold text-slate-900 text-sm">₹{product.selling_price}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Available Stock</span>
              <span className={`font-bold ${product.current_stock <= product.reorder_point ? 'text-rose-600' : 'text-slate-800'}`}>
                {product.current_stock} {product.unit || 'units'}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => navigate(`/products/${product.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Details</span>
          </button>

          <button
            onClick={() => onProcure ? onProcure(product) : navigate(`/procurement?product_id=${product.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition-all shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Procure</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
