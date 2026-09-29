import apiClient from './client';

export const settingsAPI = {
  getPublicSettings: () => apiClient.get('/settings/public'),
};
