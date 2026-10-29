import api from './api';

export const alertService = {
  getAlerts: async (params = {}) => {
    const res = await api.get('/alerts', { params });
    return res.data;
  },

  markRead: async (id) => {
    const res = await api.put(`/alerts/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await api.put('/alerts/mark-all-read');
    return res.data;
  },

  getInsights: async () => {
    const res = await api.get('/alerts/insights');
    return res.data.insights;
  }
};
