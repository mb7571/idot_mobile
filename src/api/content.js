import apiClient from './client';

export const contentAPI = {
  getContent: (type) => apiClient.get(`/content/${type}`),
};
