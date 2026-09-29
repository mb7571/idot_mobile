import apiClient from './client';

export const serviceRequestAPI = {
  submit: (data) => apiClient.post('/service-requests', data),
  myRequests: (params) => apiClient.get('/service-requests/my', { params }),
  incomingRequests: (params) =>
    apiClient.get('/transporter/service-requests/incoming', { params }),
  getDetails: (id) => apiClient.get(`/service-requests/${id}`),
  updateStatus: (id, data) => apiClient.put(`/service-requests/${id}/status`, data),
};
