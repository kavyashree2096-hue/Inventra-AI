import React, { useState, useEffect } from 'react';
import {
  Settings, Users, ShieldCheck, FileText, Database,
  RefreshCw, CheckCircle2, AlertTriangle, Key
} from 'lucide-react';
import { adminService } from '../services/adminService';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs', 'settings'
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [resettingDB, setResettingDB] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getAuditLogs(100),
        adminService.getSettings()
      ]);
      setUsers(uRes || []);
      setLogs(lRes || []);
      setSettings(sRes || {});
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setToast({ success: true, text: 'User role updated successfully!' });
      loadData();
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert('Failed to update user role');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await adminService.saveSettings(settings);
      setToast({ success: true, text: 'System settings saved!' });
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to re-seed the demo database? This will reset all records to the baseline commercial dataset.')) {
      return;
    }
    setResettingDB(true);
    try {
      await adminService.resetSeedData();
      setToast({ success: true, text: 'Database successfully re-seeded with fresh retail data!' });
      loadData();
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      alert('Failed to reset database: ' + err.message);
    } finally {
      setResettingDB(false);
    }
  };

  if (loading && users.length === 0) {
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
            System Administration & Audit Log
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Role-based authorization, enterprise audit trails, and intelligence parameters
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          disabled={resettingDB}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
        >
          <Database className={`w-3.5 h-3.5 ${resettingDB ? 'animate-spin' : ''}`} />
          <span>{resettingDB ? 'Resetting DB...' : 'Re-Seed Demo Data'}</span>
        </button>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'users', label: 'User Management', icon: Users, count: users.length },
          { id: 'logs', label: 'Audit Trail Logs', icon: FileText, count: logs.length },
          { id: 'settings', label: 'System Configuration', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Registered Personnel & Roles</h3>
            <p className="text-xs text-slate-500">Assign role-based permissions (Admin, Manager, Staff)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {u.full_name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Security & Operational Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable chronological record of logins, PO receipts, and inventory changes</p>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {log.user_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {log.entity} #{log.entity_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">Inventra AI Engine Settings</h3>
          <p className="text-xs text-slate-500 mb-6">Configure AI models, Ollama connection, and operational parameters</p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Forecasting Model Algorithm</label>
              <input
                type="text"
                value={settings.model_name || 'Random Forest + Gradient Boosting'}
                onChange={(e) => setSettings({ ...settings, model_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ollama Local Model</label>
              <input
                type="text"
                value={settings.ollama_model || 'llama3.2'}
                onChange={(e) => setSettings({ ...settings, ollama_model: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Display Currency</label>
              <input
                type="text"
                value={settings.currency || '₹ (INR)'}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-medium"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
