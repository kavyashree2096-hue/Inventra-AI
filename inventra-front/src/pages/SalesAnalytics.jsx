import React, { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, ShoppingBag, Upload, Calendar,
  Store, Award, ArrowDownRight, ArrowUpRight, FileSpreadsheet,
  RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import { salesService } from '../services/salesService';
import Modal from '../components/Modal';

const SalesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await salesService.getAnalytics(period);
      setData(res);
    } catch (err) {
      console.error('Failed to load sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadLoading(true);
    setUploadStatus(null);

    try {
      const res = await salesService.uploadDataset(uploadFile);
      setUploadStatus({ success: true, message: res.message, count: res.records_imported });
      loadAnalytics();
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadStatus(null);
        setUploadFile(null);
      }, 2500);
    } catch (err) {
      setUploadStatus({
        success: false,
        message: err.response?.data?.error || 'Upload failed',
        errors: err.response?.data?.validation_errors || []
      });
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Historical transaction patterns, store velocities, and SKU performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly Aggregate</option>
              <option value="yearly">Yearly Aggregate</option>
            </select>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Total Net Revenue</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            ₹{data.summary?.total_revenue?.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            +18.4% vs baseline
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Total Transactions</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {data.summary?.total_orders?.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
            Across 4 retail stores
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Average Order Value</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            ₹{data.summary?.avg_order_value?.toLocaleString()}
          </h3>
          <span className="text-[11px] text-indigo-600 font-bold mt-1 inline-block">
            Basket size: ~2.4 items
          </span>
        </div>
      </div>

      {/* Monthly Sales Trajectory Line Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue & Order Volume Trend</h3>
            <p className="text-xs text-slate-500">Trailing months transaction cadence</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthly_trend || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="revenue" name="Net Revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="orders" name="Order Count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance: Top Sellers & Lowest Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Products */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Top-Selling Products</span>
              </h3>
              <p className="text-xs text-slate-500">Highest velocity revenue drivers</p>
            </div>
          </div>

          <div className="space-y-3">
            {(data.top_selling || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                    }}
                  />
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-xs block">₹{item.revenue?.toLocaleString()}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">{item.units_sold} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest-Selling Products */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-rose-500" />
                <span>Lowest-Selling SKUs</span>
              </h3>
              <p className="text-xs text-slate-500">Low velocity inventory candidates for promotion</p>
            </div>
          </div>

          <div className="space-y-3">
            {(data.lowest_selling || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                    }}
                  />
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-xs block">₹{item.revenue?.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{item.units_sold} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store Comparison & Seasonality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Comparison */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Store-Wise Performance</h3>
          <p className="text-xs text-slate-500 mb-4">Revenue breakdown across retail locations</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.store_sales || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="city" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day of Week Seasonality Index */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Weekly Demand Seasonality</h3>
          <p className="text-xs text-slate-500 mb-4">Traffic indexing showing peak weekend shopping volumes</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dow_seasonality || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[70, 150]} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="sales_index" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CSV / Excel Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Sales Dataset (CSV / Excel)"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload historical POS sales records to refresh demand forecast modeling.
            Expected columns: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">product_sku, quantity, unit_price</code>
          </p>

          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl p-6 text-center transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploadFile && (
              <p className="text-xs font-bold text-slate-800 mt-2">
                Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {uploadStatus && (
            <div
              className={`p-4 rounded-2xl text-xs ${
                uploadStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {uploadStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{uploadStatus.message}</span>
              </div>
              {uploadStatus.errors && uploadStatus.errors.length > 0 && (
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                  {uploadStatus.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!uploadFile || uploadLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {uploadLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating & Importing...</span>
                </>
              ) : (
                <span>Import Dataset</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesAnalytics;
