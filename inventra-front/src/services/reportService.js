import api from './api';

export const reportService = {
  getSummary: async () => {
    const res = await api.get('/reports/summary');
    return res.data.report;
  },

  getExportUrl: (type = 'inventory') => {
    return `/api/reports/export?type=${type}`;
  }
};
