import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, DollarSign, ShoppingBag, Package, Boxes,
  Coins, LineChart, AlertTriangle, AlertOctagon, Layers,
  Zap, Clock, ShoppingCart, Truck, AlertCircle, Activity,
  Filter, ArrowUpRight, RefreshCw, Calendar, Shield, Lock
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import KPICard from '../components/KPICard';
import { dashboardService } from '../services/dashboardService';

import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  Healthy: '#10B981',
  'Low Stock': '#F59E0B',
  Critical: '#EF4444',
  'Stock-Out': '#991B1B',
  Overstock: '#8B5CF6',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [privacyShield, setPrivacyShield] = useState(null);
  const [liveSync, setLiveSync] = useState(true);
  const [telemetryEvent, setTelemetryEvent] = useState({
    text: 'North Retail Hub: Shelf sensor scan confirmed 100% SKU sync',
    time: 'Live'
  });

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsData, chartsData, telemetryData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
        dashboardService.getTelemetry().catch(() => null)
      ]);
      setStats(statsData.kpis);
      setPrivacyShield(statsData.privacy_shield);
      setCharts(chartsData);

      if (telemetryData?.events?.length) {
        // Pick a dynamic recent event
        const randomEvt = telemetryData.events[Math.floor(Math.random() * telemetryData.events.length)];
        setTelemetryEvent(randomEvt);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time live sync polling interval
  useEffect(() => {
    if (!liveSync) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 6000); // 6s live sync
    return () => clearInterval(interval);
  }, [liveSync]);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Connecting to Inventra AI live telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Retail Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-sky-50 to-teal-50 text-sky-800 border border-sky-200">
              {privacyShield?.mode_name || 'Retail Intelligence'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Real-time demand prediction, stock health monitoring, and smart procurement
          </p>
        </div>

        {/* Global Filters & Live Sync Control */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setLiveSync(!liveSync)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              liveSync
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle live telemetry background sync"
          >
            <span className={`w-2 h-2 rounded-full ${liveSync ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span>{liveSync ? 'Live Sync: ON' : 'Live Sync: PAUSED'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
              <option value="1y">Trailing 12 Months</option>
            </select>
          </div>

          <button
            onClick={() => loadData(false)}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Refresh Metrics Now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Event Ticker Ribbon */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white shadow-xl shadow-sky-950/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-sky-800/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>LIVE FLUX</span>
          </div>
          <div className="h-4 w-px bg-white/20 hidden md:block shrink-0" />
          <div className="text-xs text-sky-100 font-medium truncate">
            <span>📡 <strong className="text-white">Store Telemetry:</strong> {telemetryEvent?.text}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px] text-sky-300/80">
          <span>Active Nodes: <strong>4 Stores</strong></span>
          <span>•</span>
          <span>Heartbeat: <strong className="text-emerald-300">22ms</strong></span>
        </div>
      </div>

      {/* Privacy Shield Banner (if Staff active) */}
      {privacyShield?.is_financial_masked && (
        <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold uppercase tracking-wide text-sky-800 block sm:inline mr-2">
                🛡️ Operational Privacy Shield Active:
              </span>
              <span className="text-slate-600">
                {privacyShield.explanation}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-sky-200 text-sky-800 shrink-0">
            Staff View
          </span>
        </div>
      )}

      {/* 16 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Total Sales */}
        <KPICard
          title="Total Sales"
          value={`${stats.total_sales_units} units`}
          subtitle="Customer units fulfilled"
          icon={TrendingUp}
          trend="+14.2%"
          trendPositive={true}
          color="indigo"
          onClick={() => navigate('/sales')}
        />

        {/* 2. Total Revenue */}
        <KPICard
          title="Total Revenue"
          value={stats.total_revenue !== null && stats.total_revenue !== undefined ? `₹${stats.total_revenue?.toLocaleString()}` : "🔒 Protected"}
          subtitle={stats.total_revenue !== null && stats.total_revenue !== undefined ? "Net gross merchandise val" : "Manager+ clearance required"}
          icon={DollarSign}
          trend={stats.total_revenue !== null && stats.total_revenue !== undefined ? "+18.5%" : null}
          trendPositive={true}
          color={stats.total_revenue !== null && stats.total_revenue !== undefined ? "emerald" : "sky"}
          onClick={() => navigate('/sales')}
        />

        {/* 3. Total Orders */}
        <KPICard
          title="Total Orders"
          value={stats.total_orders}
          subtitle="Store POS transactions"
          icon={ShoppingBag}
          color="blue"
          onClick={() => navigate('/sales')}
        />

        {/* 4. Total Products */}
        <KPICard
          title="Total Products"
          value={stats.total_products}
          subtitle="Active catalog SKUs"
          icon={Package}
          color="violet"
          onClick={() => navigate('/products')}
        />

        {/* 5. Current Inventory */}
        <KPICard
          title="Current Stock"
          value={`${stats.current_inventory_units} units`}
          subtitle="On hand in warehouses"
          icon={Boxes}
          color="indigo"
          onClick={() => navigate('/inventory')}
        />

        {/* 6. Inventory Value */}
        <KPICard
          title="Inventory Value"
          value={stats.inventory_value !== null && stats.inventory_value !== undefined ? `₹${stats.inventory_value?.toLocaleString()}` : "🔒 Protected"}
          subtitle={stats.inventory_value !== null && stats.inventory_value !== undefined ? "Cost basis working capital" : "Company privacy shield active"}
          icon={Coins}
          color={stats.inventory_value !== null && stats.inventory_value !== undefined ? "amber" : "sky"}
          onClick={() => navigate('/inventory')}
        />

        {/* 7. Predicted Demand */}
        <KPICard
          title="Predicted Demand"
          value={`${stats.predicted_demand_units} units`}
          subtitle="Next 30-day forecast horizon"
          icon={LineChart}
          trend="+8.1%"
          trendPositive={true}
          color="violet"
          onClick={() => navigate('/forecast')}
        />

        {/* 8. Low Stock Products */}
        <KPICard
          title="Low Stock Items"
          value={stats.low_stock_products}
          subtitle="Below safe reorder trigger"
          icon={AlertTriangle}
          color={stats.low_stock_products > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/reorders')}
        />

        {/* 9. Stock-Out Risk */}
        <KPICard
          title="Stock-Out Risk"
          value={stats.stock_out_risk}
          subtitle="Critical depletion items"
          icon={AlertOctagon}
          color={stats.stock_out_risk > 0 ? 'rose' : 'emerald'}
          onClick={() => navigate('/inventory')}
        />

        {/* 10. Overstock Products */}
        <KPICard
          title="Overstock Items"
          value={stats.overstock_products}
          subtitle="Above ceiling holding target"
          icon={Layers}
          color="violet"
          onClick={() => navigate('/inventory')}
        />

        {/* 11. Fast-Moving Products */}
        <KPICard
          title="Fast Movers"
          value={stats.fast_moving_products}
          subtitle="High velocity velocity leaders"
          icon={Zap}
          color="emerald"
          onClick={() => navigate('/inventory')}
        />

        {/* 12. Slow-Moving Products */}
        <KPICard
          title="Slow Movers"
          value={stats.slow_moving_products}
          subtitle="Low turnover aging SKUs"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/inventory')}
        />

        {/* 13. Pending Procurement */}
        <KPICard
          title="Pending Requisitions"
          value={stats.pending_procurement}
          subtitle="Awaiting PO conversion"
          icon={ShoppingCart}
          color="blue"
          onClick={() => navigate('/procurement')}
        />

        {/* 14. Open Purchase Orders */}
        <KPICard
          title="Open POs"
          value={stats.open_purchase_orders}
          subtitle="In transit / supplier dispatch"
          icon={Truck}
          color="indigo"
          onClick={() => navigate('/purchase-orders')}
        />

        {/* 15. Critical Alerts */}
        <KPICard
          title="Critical Alerts"
          value={stats.critical_alerts}
          subtitle="Unread network warnings"
          icon={AlertCircle}
          color={stats.critical_alerts > 0 ? 'rose' : 'emerald'}
          onClick={() => navigate('/alerts')}
        />

        {/* 16. Inventory Health Score */}
        <KPICard
          title="Health Score"
          value={`${stats.inventory_health_score}/100`}
          subtitle={`Network: ${stats.inventory_health_status}`}
          icon={Activity}
          trend={stats.inventory_health_status}
          trendPositive={stats.inventory_health_score >= 70}
          color={stats.inventory_health_score >= 75 ? 'emerald' : 'amber'}
          onClick={() => navigate('/inventory')}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue & Order Momentum</h3>
              <p className="text-xs text-slate-500">Historical 30-day transaction trajectory across retail stores</p>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Detailed Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.sales_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status Distribution Doughnut Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Stock Status Balance</h3>
            <p className="text-xs text-slate-500">Health breakdown across full catalog</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.stock_distribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(charts?.stock_distribution || []).map((entry, idx) => (
                    <Cell key={idx} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <button
            onClick={() => navigate('/inventory')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors text-center"
          >
            Review Inventory Thresholds
          </button>
        </div>
      </div>

      {/* Row 2: Actual vs Predicted Demand & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Predicted Demand Comparison */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Actual vs. ML Predicted Demand</h3>
              <p className="text-xs text-slate-500">Validation of Random Forest Regressor on top products</p>
            </div>
            <button
              onClick={() => navigate('/forecast')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Forecasts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.actual_vs_predicted || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="product" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="actual" name="Actual Demand" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="predicted" name="AI Predicted" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Category Revenue Contribution</h3>
              <p className="text-xs text-slate-500">Sales volume performance across product verticals</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={charts?.category_analytics || []}
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Launch CTA Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-1">
            Automated Reorder Pipeline
          </span>
          <h3 className="text-lg font-bold">
            {stats.low_stock_products} Products Require Immediate Supplier Replenishment
          </h3>
          <p className="text-xs text-indigo-100/80 mt-1">
            Review visual purchase cards with ranked supplier quotes to generate purchase orders with 1-click.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/procurement')}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 text-xs font-bold transition-all shadow-sm"
          >
            Open Procurement Hub
          </button>
          <button
            onClick={() => navigate('/reorders')}
            className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold border border-indigo-500/50 transition-all"
          >
            Smart Reorders
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
