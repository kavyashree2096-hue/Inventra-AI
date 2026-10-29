import api from './api';

export const supplierService = {
  getSuppliers: async () => {
    const res = await api.get('/suppliers');
    return res.data.suppliers;
  },

  getSupplier: async (id) => {
    const res = await api.get(`/suppliers/${id}`);
    return res.data.supplier;
  },

  createSupplier: async (supplierData) => {
    const res = await api.post('/suppliers', supplierData);
    return res.data;
  },

  updateSupplier: async (id, supplierData) => {
    const res = await api.put(`/suppliers/${id}`, supplierData);
    return res.data;
  },

  compareSuppliers: async (productId) => {
    const res = await api.get(`/suppliers/compare/${productId}`);
    return res.data.comparison;
  }
};
