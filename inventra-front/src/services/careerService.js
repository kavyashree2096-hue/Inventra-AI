import api from './api';

export const careerService = {
  getJobs: async () => {
    const res = await api.get('/careers/jobs');
    return res.data;
  },

  submitApplication: async (applicationData) => {
    const res = await api.post('/careers/apply', applicationData);
    return res.data;
  },

  getApplications: async () => {
    const res = await api.get('/careers/applications');
    return res.data;
  }
};
