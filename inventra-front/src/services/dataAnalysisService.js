import api from './api';

export const dataAnalysisService = {
  uploadFilePreview: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/data-analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  validateDataset: async (fileToken, mappings) => {
    const res = await api.post('/data-analysis/validate', {
      file_token: fileToken,
      mappings: mappings
    });
    return res.data;
  },

  getEda: async () => {
    const res = await api.get('/data-analysis/eda');
    return res.data;
  },

  getBusinessAnalysis: async () => {
    const res = await api.get('/data-analysis/business');
    return res.data;
  },

  getHistory: async () => {
    const res = await api.get('/data-analysis/history');
    return res.data.uploads;
  },

  getExportUrl: () => {
    return '/api/data-analysis/export';
  }
};
