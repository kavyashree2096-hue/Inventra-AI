import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, LineChart, Boxes, Package,
  RefreshCw, ShoppingCart, Truck, FileText, AlertCircle,
  FileSpreadsheet, Settings, X, Sparkles, Shield, Lock, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const operationalItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Live operational KPIs' },
  { path: '/inventory', label: 'Inventory Monitoring', icon: Boxes, desc: 'Stock levels & turnover' },
  { path: '/products', label: 'Product Catalog', icon: Package, desc: 'SKU database & details' },
  { path: '/purchase-orders', label: 'Goods Receipt & POs', icon: FileText, desc: 'Delivery verification' },
  { path: '/alerts', label: 'Alerts & Tasks', icon: AlertCircle, desc: 'Stockout warnings' },
];

const planningItems = [
  { path: '/sales', label: 'Sales Analytics', icon: TrendingUp, desc: 'Velocity & store revenue' },
  { path: '/forecast', label: 'Demand Forecasting', icon: LineChart, desc: 'ML models & retrain' },
  { path: '/reorders', label: 'Smart Reorders', icon: RefreshCw, desc: 'Deficit & safety stock' },
  { path: '/procurement', label: 'Procurement Hub', icon: ShoppingCart, desc: '1-click purchase cards' },
  { path: '/suppliers', label: 'Suppliers Matrix', icon: Truck, desc: 'Multi-criteria ranking' },
  { path: '/reports', label: 'Executive Reports', icon: FileSpreadsheet, desc: 'Audit summaries & CSV' },
];

const adminItems = [
  { path: '/admin', label: 'Admin & Governance', icon: Settings, desc: 'Personnel RBAC & audit logs' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'Staff';

  const isManagerOrAdmin = ['Admin', 'Manager'].includes(currentRole);
  const isAdmin = currentRole === 'Admin';

  const roleBadgeConfig = {
    Admin: {
      label: 'System Admin',
      color: 'bg-sky-50 text-sky-800 border-sky-200',
      tag: 'Full Clearance',
      icon: '👑'
    },
    Manager: {
      label: 'Inventory Manager',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      tag: 'Planning & Orders',
      icon: '💼'
    },
    Staff: {
      label: 'Floor Staff',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      tag: 'Privacy Shield Active',
      icon: '📦'
    },
  }[currentRole] || {
    label: 'Guest',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    tag: 'Read Only',
    icon: '👤'
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto px-4 py-5">
          {/* Header on Mobile */}
          <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-sm">Navigation Menu</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Personnel Security Level Card */}
          <div className={`p-3 rounded-2xl border ${roleBadgeConfig.color} mb-4 text-left transition-all shadow-2xs`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1.5">
                <span>{roleBadgeConfig.icon}</span>
                <span>{roleBadgeConfig.label}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 shadow-2xs border border-current">
                {roleBadgeConfig.tag}
              </span>
            </div>
            <p className="text-[10px] mt-1.5 opacity-80 leading-tight">
              {currentRole === 'Staff'
                ? 'Financial figures & admin logs shielded.'
                : currentRole === 'Manager'
                ? 'Full inventory planning & reorders unlocked.'
                : 'Master security clearance enabled.'}
            </p>
          </div>

          {/* Section 1: Operational Tasks (All Roles) */}
          <div className="space-y-1 mb-5">
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Fulfillment &amp; Floor Operations
            </p>
            {operationalItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-50 to-emerald-50/60 text-sky-800 font-bold border-l-4 border-sky-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>

          {/* Section 2: Planning & Forecasting (Manager & Admin) */}
          <div className="space-y-1 mb-5">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Planning &amp; Intelligence
              </p>
              {!isManagerOrAdmin && (
                <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">
                  <Lock className="w-2.5 h-2.5" /> Mgr+
                </span>
              )}
            </div>

            {planningItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-50 to-emerald-50/60 text-sky-800 font-bold border-l-4 border-sky-600 shadow-xs'
                        : isManagerOrAdmin || item.path === '/procurement'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.label}</span>
                  </div>
                  {!isManagerOrAdmin && item.path === '/procurement' ? (
                    <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      Req
                    </span>
                  ) : !isManagerOrAdmin ? (
                    <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                  ) : null}
                </NavLink>
              );
            })}
          </div>

          {/* Section 3: Governance & Security (Admin) */}
          <div className="space-y-1 mb-5">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Security &amp; Governance
              </p>
              {!isAdmin && (
                <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded">
                  <Lock className="w-2.5 h-2.5" /> Admin
                </span>
              )}
            </div>

            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-50 to-emerald-50/60 text-sky-800 font-bold border-l-4 border-sky-600 shadow-xs'
                        : isAdmin
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.label}</span>
                  </div>
                  {!isAdmin && (
                    <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Card: Ollama AI Assistant quick callout */}
          <div className="mt-auto pt-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-50/90 via-cyan-50/40 to-emerald-50/60 border border-sky-100 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800">Ollama Retail AI</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
                Ask questions about stock levels, reorders, and suppliers.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-sky-100">
                  llama3.2
                </span>
                <span className="text-[9px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Grounded
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
