import apiClient from './client';

export const mastersAPI = {
  getBusinessTypes: () => apiClient.get('/masters/business-types', { params: { active_only: true } }),
  getVehicleTypes: () => apiClient.get('/masters/vehicle-types', { params: { active_only: true } }),
  getStates: () => apiClient.get('/masters/states', { params: { active_only: true } }),
  getCities: (stateId) =>
    apiClient.get('/masters/cities', { params: { state_id: stateId, active_only: true } }),
  getRadiusOptions: () => apiClient.get('/masters/radius-options', { params: { active_only: true } }),
};
