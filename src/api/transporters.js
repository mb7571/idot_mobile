import apiClient from './client';

export const transporterAPI = {
  search: (params) => apiClient.get('/transporters/search', { params }),
  getProfile: (id) => apiClient.get(`/transporters/${id}`),
  getMyProfile: () => apiClient.get('/transporter/profile'),
  updateMyProfile: (data) => apiClient.put('/transporter/profile', data),
  getMyFleet: () => apiClient.get('/transporter/fleet'),
};
