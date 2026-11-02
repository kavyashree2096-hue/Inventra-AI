import api from './api';

export const auditService = {
  getSummary: async () => {
    const res = await api.get('/audit/summary');
    return res.data;
  },

  getSessions: async (status = null) => {
    const params = status && status !== 'All' ? `?status=${status}` : '';
    const res = await api.get(`/audit/sessions${params}`);
    return res.data.sessions;
  },

  getSessionDetail: async (sessionId) => {
    const res = await api.get(`/audit/sessions/${sessionId}`);
    return res.data.session;
  },

  createSession: async (payload) => {
    const res = await api.post('/audit/sessions', payload);
    return res.data;
  },

  updateItemCount: async (sessionId, itemId, physicalStock, reason = null, correctiveAction = null) => {
    const res = await api.put(`/audit/sessions/${sessionId}/items/${itemId}`, {
      physical_stock: physicalStock,
      discrepancy_reason: reason,
      corrective_action: correctiveAction
    });
    return res.data;
  },

  resolveItem: async (sessionId, itemId, correctiveAction) => {
    const res = await api.post(`/audit/sessions/${sessionId}/resolve-item/${itemId}`, {
      corrective_action: correctiveAction
    });
    return res.data;
  },

  importCsvCounts: async (sessionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/audit/sessions/${sessionId}/import-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getSalesAudit: async () => {
    const res = await api.get('/audit/sales-audit');
    return res.data;
  },

  getActivityLogs: async (page = 1, perPage = 30, action = null, entity = null, search = null) => {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (action && action !== 'All') params.append('action', action);
    if (entity && entity !== 'All') params.append('entity', entity);
    if (search) params.append('search', search);
    const res = await api.get(`/audit/activity-logs?${params.toString()}`);
    return res.data;
  },

  getCharts: async () => {
    const res = await api.get('/audit/charts');
    return res.data;
  },

  getExportUrl: (sessionId = null) => {
    const base = '/api/audit/export';
    return sessionId ? `${base}?session_id=${sessionId}` : base;
  }
};
