import apiClient from './client';

export const subscriptionAPI = {
  // Current subscription state (plan, remaining searches, expiry)
  getStatus: () => apiClient.get('/subscription/status'),

  // Available plans (empty list when subscriptions disabled)
  getPlans: () => apiClient.get('/subscription/plans'),

  // One-time free plan activation
  activateFree: () => apiClient.post('/subscription/free/activate'),

  // Razorpay flow
  createOrder: (planId) => apiClient.post('/subscription/payment/order', { plan_id: planId }),
  verifyPayment: (payload) => apiClient.post('/subscription/payment/verify', payload),

  // Payment history + invoices
  getPayments: () => apiClient.get('/subscription/payments'),
  invoiceUrl: (paymentId, token) =>
    `/subscription/payments/${paymentId}/invoice`,
};
