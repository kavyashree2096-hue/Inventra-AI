import api from './api';

export const inventoryService = {
  getInventory: async (params = {}) => {
    const res = await api.get('/inventory', { params });
    return res.data;
  },

  getHealth: async () => {
    const res = await api.get('/inventory/health');
    return res.data;
  },

  getFastMoving: async (limit = 10) => {
    const res = await api.get('/inventory/fast-moving', { params: { limit } });
    return res.data.products;
  },

  getSlowMoving: async (limit = 10) => {
    const res = await api.get('/inventory/slow-moving', { params: { limit } });
    return res.data.products;
  },

  getStockouts: async () => {
    const res = await api.get('/inventory/stockouts');
    return res.data.risks;
  },

  getOverstock: async () => {
    const res = await api.get('/inventory/overstock');
    return res.data.items;
  },

  getMovements: async () => {
    const res = await api.get('/inventory/movements');
    return res.data.movements;
  },

  adjustStock: async (product_id, new_quantity, reason) => {
    const res = await api.post('/inventory/adjust', { product_id, new_quantity, reason });
    return res.data;
  }
};
