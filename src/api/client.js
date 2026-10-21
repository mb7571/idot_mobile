import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api';

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // ── Cache-busting headers ──────────────────────────────────────────
    // These prevent the OS / networking layer from serving a stale response.
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

// Request interceptor - resolve base URL per request and attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Always use the live base URL — the host can change after boot when the
    // dynamic resolver finishes probing or a manual override is applied.
    config.baseURL = getApiUrl();
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Append a timestamp query-param so even GET requests bypass caches
    config.params = { ...config.params, _t: Date.now() };
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and network errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    }

    // Log useful debug info when a request fails
    if (error.code === 'ECONNABORTED') {
      console.warn('[API] Request timed out:', error.config?.url);
    } else if (!error.response) {
      console.warn(
        '[API] Network error – is the server running?',
        error.config?.url,
        error.message,
      );
    }

    return Promise.reject(error);
  },
);

export default apiClient;
