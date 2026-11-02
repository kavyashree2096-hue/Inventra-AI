import api from './api';

export const revenueService = {
  getSummary: async (startDate = null, endDate = null, categoryId = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (categoryId) params.append('category_id', categoryId);
    const res = await api.get(`/revenue/summary?${params.toString()}`);
    return res.data;
  },

  getProductRevenue: async (productId, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const res = await api.get(`/revenue/product/${productId}?${params.toString()}`);
    return res.data;
  },

  getCharts: async (startDate = null, endDate = null, categoryId = null, productId = null, aggregation = 'monthly') => {
    const params = new URLSearchParams({ aggregation });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (categoryId) params.append('category_id', categoryId);
    if (productId) params.append('product_id', productId);
    const res = await api.get(`/revenue/charts?${params.toString()}`);
    return res.data;
  },

  getTable: async (startDate = null, endDate = null, categoryId = null, search = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (categoryId) params.append('category_id', categoryId);
    if (search) params.append('search', search);
    const res = await api.get(`/revenue/table?${params.toString()}`);
    return res.data;
  },

  getInsights: async (startDate = null, endDate = null, categoryId = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (categoryId) params.append('category_id', categoryId);
    const res = await api.get(`/revenue/insights?${params.toString()}`);
    return res.data.insights;
  },

  getExportUrl: (startDate = null, endDate = null, categoryId = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (categoryId) params.append('category_id', categoryId);
    return `/api/revenue/export?${params.toString()}`;
  }
};
