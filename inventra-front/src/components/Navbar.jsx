import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Bell, User as UserIcon, LogOut, ShieldCheck,
  ChevronDown, Menu, Activity, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/alertService';
import { inventoryService } from '../services/inventoryService';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [healthScore, setHealthScore] = useState(86);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchQuickMetrics = async () => {
      try {
        const [alertData, healthData] = await Promise.all([
          alertService.getAlerts({ unread_only: true }),
          inventoryService.getHealth()
        ]);
        setUnreadCount(alertData.unread_count || 0);
        setHealthScore(healthData.score || 86);
      } catch {
        // Fallback
      }
    };
    fetchQuickMetrics();
    const interval = setInterval(fetchQuickMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-6 h-16 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-white border border-sky-100 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/logo_icon.png"
              alt="Inventra AI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 tracking-tight">
                Inventra <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                Retail Intelligence
              </span>
            </div>
            <p className="hidden md:block text-[9px] font-semibold tracking-wider uppercase text-slate-400">
              Demand &amp; Inventory Optimization
            </p>
          </div>
        </Link>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live Telemetry Radar Animation */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Live Telemetry</span>
          <span className="text-[10px] font-mono text-emerald-600 bg-white/80 px-1.5 rounded">24ms</span>
        </div>

        {/* Role & Privacy Shield Capsule */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-700">
          <span>{user?.role === 'Admin' ? '👑 Admin' : user?.role === 'Manager' ? '💼 Manager' : '📦 Floor Staff'}</span>
          {user?.role === 'Staff' ? (
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-200">
              🛡️ Privacy Active
            </span>
          ) : (
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200">
              🔓 Unlocked
            </span>
          )}
        </div>

        {/* Inventory Health Score Capsule */}
        <Link
          to="/inventory"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
          title="Inventory Health Score"
        >
          <Activity className="w-3.5 h-3.5 text-sky-600" />
          <span>Health:</span>
          <span className={`font-bold ${healthScore >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {healthScore}/100
          </span>
        </Link>

        {/* Notifications Bell */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Alerts & Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              {user ? user.full_name?.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user ? user.full_name : 'Guest User'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {user ? user.role : 'Visitor'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">{user?.full_name}</p>
                <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-semibold text-[10px]">
                  Role: {user?.role || 'Staff'}
                </span>
              </div>

              <Link
                to="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Admin & System Logs</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
