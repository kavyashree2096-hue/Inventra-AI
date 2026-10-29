import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivacyShieldGate = ({ requiredRoles = ['Admin', 'Manager'], moduleName = 'Confidential Management' }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const currentRole = user?.role || 'Staff';

  const handleDemoSwitch = async (roleToSwitch) => {
    const creds = {
      Admin: { email: 'admin@inventra.ai', pass: 'admin123' },
      Manager: { email: 'manager@inventra.ai', pass: 'manager123' },
      Staff: { email: 'staff@inventra.ai', pass: 'staff123' },
    };
    const c = creds[roleToSwitch];
    if (c) {
      await login(c.email, c.pass);
      navigate(0); // reload with new permissions
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Container */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-50 to-teal-50 border border-sky-200/80 mx-auto flex items-center justify-center shadow-md shadow-sky-500/10 mb-6">
          <ShieldAlert className="w-10 h-10 text-sky-600 stroke-[2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5 text-sky-600" />
          Enterprise Privacy Shield Active
        </span>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Access Restricted: {moduleName}
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Under Inventra AI Data Governance &amp; Privacy Policies, sensitive planning and executive analytics are segmented by personnel role.
        </p>

        {/* Role Comparison Table */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Your Active Role:</span>
            <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {currentRole}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Required Clearance:</span>
            <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {requiredRoles.join(' or ')}
            </span>
          </div>
        </div>

        {/* Actions & Role Switcher */}
        <div className="mt-8 space-y-3">
          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Operational Dashboard</span>
          </Link>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Evaluator Quick Role Switch
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleDemoSwitch('Admin')}
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold transition-colors"
              >
                👑 Login as Admin
              </button>
              <button
                onClick={() => handleDemoSwitch('Manager')}
                className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold transition-colors"
              >
                💼 Login as Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyShieldGate;
