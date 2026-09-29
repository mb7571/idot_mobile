import apiClient from './client';

export const favoriteAPI = {
  list: () => apiClient.get('/favorites'),
  add: (transporterProfileId) =>
    apiClient.post('/favorites', { transporter_profile_id: transporterProfileId }),
  remove: (transporterProfileId) => apiClient.delete(`/favorites/${transporterProfileId}`),
  check: (transporterProfileId) => apiClient.get(`/favorites/check/${transporterProfileId}`),
};
