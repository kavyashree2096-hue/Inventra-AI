import api from './api';

export const forecastService = {
  getForecasts: async (params = {}) => {
    const res = await api.get('/forecasts', { params });
    return res.data;
  },

  getModels: async () => {
    const res = await api.get('/forecasts/models');
    return res.data.models;
  },

  retrainModels: async () => {
    const res = await api.post('/forecasts/retrain');
    return res.data;
  },

  getReorders: async () => {
    const res = await api.get('/forecasts/reorders');
    return res.data.reorders;
  },

  refreshReorders: async () => {
    const res = await api.post('/forecasts/reorders/refresh');
    return res.data;
  }
};
