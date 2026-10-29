import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Search, Filter, LayoutGrid, List,
  RefreshCw, CheckCircle2, ShoppingCart, Eye
} from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Add Product Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '', sku: '', category_id: 1, selling_price: '',
    cost_price: '', current_stock: 25, min_stock: 10, max_stock: 100,
    safety_stock: 15, reorder_point: 20, lead_time_days: 4, unit: 'Units',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({
          category_id: selectedCategory || undefined,
          status: selectedStatus,
          search,
          sort_by: sortBy
        }),
        productService.getCategories()
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, search, sortBy]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct(newProd);
      setAddModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create product');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Master Catalog
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Browse retail SKUs with dynamic stock status, pricing margins, and procurement triggers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / Table Toggle */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or keyword..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Healthy">Healthy Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
            <option value="Stock-Out">Stock-Out</option>
            <option value="Overstock">Overstock</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="stock_asc">Sort: Stock (Lowest First)</option>
            <option value="stock_desc">Sort: Stock (Highest First)</option>
            <option value="price_asc">Sort: Price (Lowest First)</option>
            <option value="price_desc">Sort: Price (Highest First)</option>
          </select>
        </div>
      </div>

      {/* Grid or Table Render */}
      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700">No products match your filter criteria</h4>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or filters above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onProcure={() => navigate(`/procurement?product_id=${p.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price / Cost</th>
                  <th className="py-3 px-4">Margin %</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.category_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">₹{p.selling_price}</span>
                      <span className="text-[10px] text-slate-400">Cost: ₹{p.cost_price}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {p.margin_pct}%
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {p.current_stock} {p.unit}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-100 border text-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/products/${p.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/procurement?product_id=${p.id}`)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors"
                        >
                          Procure
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Catalog Product"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                placeholder="Smart Wireless Earbuds"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={newProd.sku}
                onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                placeholder="SKU-TECH-009"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={newProd.category_id}
                onChange={(e) => setNewProd({ ...newProd, category_id: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newProd.selling_price}
                onChange={(e) => setNewProd({ ...newProd, selling_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newProd.cost_price}
                onChange={(e) => setNewProd({ ...newProd, cost_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Stock</label>
              <input
                type="number"
                value={newProd.current_stock}
                onChange={(e) => setNewProd({ ...newProd, current_stock: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Safety Stock</label>
              <input
                type="number"
                value={newProd.safety_stock}
                onChange={(e) => setNewProd({ ...newProd, safety_stock: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Reorder Point</label>
              <input
                type="number"
                value={newProd.reorder_point}
                onChange={(e) => setNewProd({ ...newProd, reorder_point: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Time (Days)</label>
              <input
                type="number"
                value={newProd.lead_time_days}
                onChange={(e) => setNewProd({ ...newProd, lead_time_days: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Product Photo URL</label>
            <input
              type="url"
              value={newProd.image_url}
              onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
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
              Create Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
