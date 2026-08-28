import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this URL to your server's address
// For local development: http://10.0.2.2:8000/api (Android emulator)
// For physical device: http://YOUR_PC_IP:8000/api
// For iOS simulator: http://localhost:8000/api
const API_BASE_URL = 'http://192.168.1.4:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  sendOtp: (mobile) => api.post('/auth/send-otp', { mobile }),
  verifyOtp: (mobile, otp) => api.post('/auth/verify-otp', { mobile, otp }),
  register: (data) => api.post('/auth/register', data),
  registerTransporter: (data) => api.post('/auth/register-transporter', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
  deleteAccount: () => api.delete('/auth/account'),
};

// ==================== TRANSPORTER API ====================
export const transporterAPI = {
  search: (params) => api.get('/transporters/search', { params }),
  getProfile: (id) => api.get(`/transporters/${id}`),
  getMyProfile: () => api.get('/transporter/profile'),
  updateMyProfile: (data) => api.put('/transporter/profile', data),
};

// ==================== FAVORITES API ====================
export const favoriteAPI = {
  list: () => api.get('/favorites'),
  add: (transporterProfileId) => api.post('/favorites', { transporter_profile_id: transporterProfileId }),
  remove: (transporterProfileId) => api.delete(`/favorites/${transporterProfileId}`),
  check: (transporterProfileId) => api.get(`/favorites/check/${transporterProfileId}`),
};

// ==================== SERVICE REQUEST API ====================
export const serviceRequestAPI = {
  submit: (data) => api.post('/service-requests', data),
  myRequests: (params) => api.get('/service-requests/my', { params }),
  incomingRequests: (params) => api.get('/transporter/service-requests/incoming', { params }),
  getDetails: (id) => api.get(`/service-requests/${id}`),
  updateStatus: (id, data) => api.put(`/service-requests/${id}/status`, data),
};

// ==================== MASTERS API ====================
export const mastersAPI = {
  getBusinessTypes: () => api.get('/masters/business-types', { params: { active_only: true } }),
  getVehicleTypes: () => api.get('/masters/vehicle-types', { params: { active_only: true } }),
  getStates: () => api.get('/masters/states', { params: { active_only: true } }),
  getCities: (stateId) => api.get('/masters/cities', { params: { state_id: stateId, active_only: true } }),
  getRadiusOptions: () => api.get('/masters/radius-options', { params: { active_only: true } }),
};

// ==================== NOTIFICATIONS API ====================
export const notificationAPI = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// ==================== CONTENT API ====================
export const contentAPI = {
  getContent: (type) => api.get(`/content/${type}`),
};

// ==================== SETTINGS API ====================
export const settingsAPI = {
  getPublicSettings: () => api.get('/settings/public'),
};

// ==================== ADMIN API ====================
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getTransporters: (params) => api.get('/admin/transporters', { params }),
  getTransporter: (id) => api.get(`/admin/transporters/${id}`),
  updateTransporter: (id, data) => api.put(`/admin/transporters/${id}`, data),
  verifyTransporter: (id, data) => api.put(`/admin/transporters/${id}/verify`, data),
  toggleTransporterStatus: (id, data) => api.put(`/admin/transporters/${id}/status`, data),
  deleteTransporter: (id) => api.delete(`/admin/transporters/${id}`),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
  toggleCustomerStatus: (id, data) => api.put(`/admin/customers/${id}/status`, data),
  getServiceRequests: (params) => api.get('/admin/service-requests', { params }),
  getServiceRequest: (id) => api.get(`/admin/service-requests/${id}`),
  createBusinessType: (data) => api.post('/admin/business-types', data),
  updateBusinessType: (id, data) => api.put(`/admin/business-types/${id}`, data),
  deleteBusinessType: (id) => api.delete(`/admin/business-types/${id}`),
  createState: (data) => api.post('/admin/states', data),
  updateState: (id, data) => api.put(`/admin/states/${id}`, data),
  deleteState: (id) => api.delete(`/admin/states/${id}`),
  createCity: (data) => api.post('/admin/cities', data),
  updateCity: (id, data) => api.put(`/admin/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/admin/cities/${id}`),
  createRadiusOption: (data) => api.post('/admin/radius-options', data),
  updateRadiusOption: (id, data) => api.put(`/admin/radius-options/${id}`, data),
  deleteRadiusOption: (id) => api.delete(`/admin/radius-options/${id}`),
  createVehicleType: (data) => api.post('/admin/vehicle-types', data),
  updateVehicleType: (id, data) => api.put(`/admin/vehicle-types/${id}`, data),
  deleteVehicleType: (id) => api.delete(`/admin/vehicle-types/${id}`),
  getFleet: (transporterProfileId) => api.get(`/admin/transporters/${transporterProfileId}/fleet`),
  createFleet: (data) => api.post('/admin/fleet', data),
  updateFleet: (id, data) => api.put(`/admin/fleet/${id}`, data),
  deleteFleet: (id) => api.delete(`/admin/fleet/${id}`),
  getImportTemplate: () => api.get('/admin/import/template', { responseType: 'blob' }),
  importTransporters: (formData) => api.post('/admin/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getImportedList: (params) => api.get('/admin/import/list', { params }),
  updateImported: (id, data) => api.put(`/admin/import/${id}`, data),
  deleteImported: (id) => api.delete(`/admin/import/${id}`),
  getCustomerReport: (params) => api.get('/admin/reports/customers', { params }),
  getTransporterReport: (params) => api.get('/admin/reports/transporters', { params }),
  getFleetReport: (params) => api.get('/admin/reports/fleet', { params }),
  getServiceLocationReport: (params) => api.get('/admin/reports/service-locations', { params }),
  getServiceRequestReport: (params) => api.get('/admin/reports/service-requests', { params }),
  getFavoritesReport: () => api.get('/admin/reports/favorites'),
  getAllContent: () => api.get('/admin/content'),
  saveContent: (data) => api.post('/admin/content', data),
  updateContent: (id, data) => api.put(`/admin/content/${id}`, data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),
  getSettings: () => api.get('/admin/settings'),
  getSettingsByGroup: (group) => api.get(`/admin/settings/${group}`),
  updateSetting: (data) => api.put('/admin/settings', data),
  bulkUpdateSettings: (settings) => api.put('/admin/settings/bulk', { settings }),
};

export default api;
