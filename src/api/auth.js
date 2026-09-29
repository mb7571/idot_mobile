import apiClient from './client';

export const authAPI = {
  sendOtp: (mobile) => apiClient.post('/auth/send-otp', { mobile }),
  verifyOtp: (mobile, otp) => apiClient.post('/auth/verify-otp', { mobile, otp }),
  register: (data) => apiClient.post('/auth/register', data),
  registerTransporter: (data) => apiClient.post('/auth/register-transporter', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  logout: () => apiClient.post('/auth/logout'),
  deleteAccount: () => apiClient.delete('/auth/account'),
};
