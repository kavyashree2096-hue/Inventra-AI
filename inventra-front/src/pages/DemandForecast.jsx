import React, { useState, useEffect } from 'react';
import {
  LineChart, Sparkles, RefreshCw, Cpu, CheckCircle2,
  TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from 'recharts';
import { forecastService } from '../services/forecastService';

const statusBadge = {
  'High Demand': 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  'Normal Demand': 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
  'Low Demand': 'bg-slate-100 text-slate-700 border-slate-200'
};

const DemandForecastPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState(null);
  const [period, setPeriod] = useState('weekly');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fcData, modelData] = await Promise.all([
        forecastService.getForecasts({ period, status: statusFilter }),
        forecastService.getModels()
      ]);
      setForecasts(fcData.forecasts || []);
      setModels(modelData || []);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, statusFilter]);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg(null);
    try {
      const res = await forecastService.retrainModels();
      setRetrainMsg({ success: true, text: res.message });
      loadData();
      setTimeout(() => setRetrainMsg(null), 5000);
    } catch (err) {
      setRetrainMsg({ success: false, text: err.response?.data?.error || 'Retraining failed' });
    } finally {
      setRetraining(false);
    }
  };

  if (loading && forecasts.length === 0) {
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
            AI Demand Forecasting
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Machine learning projections computed across product categories and store footprints
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining Models...' : 'Retrain ML Models'}</span>
          </button>
        </div>
      </div>

      {retrainMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            retrainMsg.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {retrainMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{retrainMsg.text}</span>
        </div>
      )}

      {/* Model Benchmark Comparison Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Active ML Algorithm Benchmarks & Error Metrics</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>{m.model_name}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Primary Model
                      </span>
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    R²: {m.r2_score}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">MAE</span>
                    <span className="text-base font-black text-slate-800">{m.mae}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">RMSE</span>
                    <span className="text-base font-black text-slate-800">{m.rmse}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">MAPE</span>
                    <span className="text-base font-black text-emerald-600">{m.mape}%</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-400 font-mono truncate">
                Hyperparameters: {m.parameters || 'Standard ensemble configuration'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Forecast Horizon:</span>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Projections</option>
            <option value="High Demand">High Demand Surge</option>
            <option value="Normal Demand">Normal Demand</option>
            <option value="Low Demand">Low Demand Cooling</option>
          </select>
        </div>
      </div>

      {/* Projections Table with Product Photos */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Demand Projections Catalog</h3>
          <p className="text-xs text-slate-500">Upcoming replenishment requirements generated by machine learning</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Forecast Horizon</th>
                <th className="py-3 px-4">Predicted Demand</th>
                <th className="py-3 px-4">Shift %</th>
                <th className="py-3 px-4">Demand Status</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecasts.map((f, i) => {
                const bClass = statusBadge[f.demand_status] || statusBadge['Normal Demand'];
                return (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={f.product_image}
                          alt={f.product_name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{f.product_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{f.product_sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {f.current_stock} units
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {f.forecast_date} ({f.forecast_period})
                    </td>
                    <td className="py-3.5 px-4 font-black text-indigo-700 text-sm">
                      {f.predicted_demand} units
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold flex items-center gap-0.5 ${f.demand_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {f.demand_change_pct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {f.demand_change_pct > 0 ? `+${f.demand_change_pct}%` : `${f.demand_change_pct}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] border ${bClass}`}>
                        {f.demand_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {f.confidence_score}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs leading-relaxed">
                      {f.recommended_action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DemandForecastPage;
