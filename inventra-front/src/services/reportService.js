import api from './api';

export const reportService = {
  getReportTypes: async () => {
    const res = await api.get('/reports/types');
    return res.data.report_types;
  },

  getSummary: async () => {
    const res = await api.get('/reports/summary');
    return res.data.report;
  },

  generateReport: async (payload) => {
    const res = await api.post('/reports/generate', payload);
    return res.data.report;
  },

  getReportHistory: async () => {
    const res = await api.get('/reports/history');
    return res.data.history;
  },

  getExportUrl: (type = 'revenue_analysis', startDate = null, endDate = null, categoryId = null, productId = null) => {
    const params = new URLSearchParams({ type });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (categoryId) params.append('category_id', categoryId);
    if (productId) params.append('product_id', productId);
    return `/api/reports/export?${params.toString()}`;
  }
};
