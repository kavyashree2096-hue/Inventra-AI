import api from './api';

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  getCharts: async () => {
    const res = await api.get('/dashboard/charts');
    return res.data;
  },

  getTelemetry: async () => {
    const res = await api.get('/dashboard/telemetry');
    return res.data;
  }
};
