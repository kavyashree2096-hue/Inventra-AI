import api from './api';

export const procurementService = {
  getDashboard: async () => {
    const res = await api.get('/procurement/dashboard');
    return res.data;
  },

  getRecommendations: async () => {
    const res = await api.get('/procurement/recommendations');
    return res.data.recommendations;
  },

  generateRecommendations: async () => {
    const res = await api.post('/procurement/recommendations/generate');
    return res.data;
  },

  getRequisitions: async () => {
    const res = await api.get('/procurement/requisitions');
    return res.data.requisitions;
  },

  createRequisition: async (data) => {
    const res = await api.post('/procurement/requisitions', data);
    return res.data;
  },

  updateRequisitionStatus: async (id, status, notes = '') => {
    const res = await api.put(`/procurement/requisitions/${id}/status`, { status, notes });
    return res.data;
  },

  getPurchaseOrders: async (params = {}) => {
    const res = await api.get('/procurement/purchase-orders', { params });
    return res.data.purchase_orders;
  },

  createPurchaseOrder: async (data) => {
    const res = await api.post('/procurement/purchase-orders', data);
    return res.data;
  },

  updatePOStatus: async (id, status, notes = '') => {
    const res = await api.put(`/procurement/purchase-orders/${id}/status`, { status, notes });
    return res.data;
  },

  getCostAnalytics: async () => {
    const res = await api.get('/procurement/analytics');
    return res.data;
  }
};
