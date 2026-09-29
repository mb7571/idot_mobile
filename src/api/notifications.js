import apiClient from './client';

export const notificationAPI = {
  list: (params) => apiClient.get('/notifications', { params }),
  unreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};
