import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, AlertTriangle, Info, CheckCircle2,
  Sparkles, RefreshCw, ArrowRight, ShieldAlert, Zap
} from 'lucide-react';
import { alertService } from '../services/alertService';

const severityBadge = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-300 font-black',
  Warning: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
  Info: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
};

const AlertsPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertRes, insightRes] = await Promise.all([
        alertService.getAlerts({ severity: severityFilter, unread_only: unreadOnly }),
        alertService.getInsights()
      ]);
      setAlerts(alertRes.alerts || []);
      setInsights(insightRes || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [severityFilter, unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await alertService.markRead(id);
      loadData();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllRead();
      loadData();
    } catch {
      // ignore
    }
  };

  if (loading && alerts.length === 0) {
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
            Alerts & AI Business Insights
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Automated anomaly detection, critical depletion warnings, and synthesized executive guidance
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* AI Business Insights Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>Executive AI Business Insights</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 border border-indigo-100/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  {ins.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mb-2">{ins.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{ins.text}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ins.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {ins.type}
                </span>
                <button
                  onClick={() => {
                    if (ins.action === 'Create PO') navigate('/procurement');
                    else if (ins.action === 'Review Forecast') navigate('/forecast');
                    else navigate('/dashboard');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>{ins.action}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Filter Strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Severity:</span>
          {['All', 'Critical', 'Warning', 'Info'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                severityFilter === s
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded text-indigo-600"
          />
          <span>Show Unread Only</span>
        </label>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700">No active alerts</h4>
            <p className="text-xs text-slate-400 mt-1">All telemetry levels and inventory metrics are normal.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const sClass = severityBadge[alert.severity] || severityBadge.Info;
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  alert.is_read
                    ? 'bg-white border-slate-200/80 opacity-70'
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-4">
                  {alert.product_image ? (
                    <img
                      src={alert.product_image}
                      alt="Product"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${sClass}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>

                    {alert.recommended_action && (
                      <p className="mt-2 text-xs font-semibold text-indigo-700 bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 inline-block">
                        👉 Action: {alert.recommended_action}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  {alert.alert_type?.includes('Reorder') || alert.alert_type?.includes('Stock') ? (
                    <button
                      onClick={() => navigate('/procurement')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                    >
                      Procure
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
