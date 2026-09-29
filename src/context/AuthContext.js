import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';

const AuthContext = createContext(null);

// Normalize API user payloads:
// - /auth/profile returns { data: { user, transporter_profile } }
// - login/verify-otp return { data: { user, token } }
// - some endpoints may return the user object directly
// Without this, the wrapper object gets stored as the user and every
// screen shows "User" with empty fields (user.name === undefined).
const extractUser = (payload) => {
  if (!payload) return null;
  if (payload.user && typeof payload.user === 'object') return payload.user;
  return payload;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        const parsedUser = extractUser(JSON.parse(userData));
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Refresh profile in background
        try {
          const response = await authAPI.getProfile();
          const freshUser = extractUser(response.data?.data || response.data);
          if (freshUser?.id) {
            setUser(freshUser);
            await AsyncStorage.setItem('user_data', JSON.stringify(freshUser));
          }
        } catch {
          // Token might be expired — keep cached data but don't block
        }
      }
    } catch {
      // No valid session
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobile, otp) => {
    const response = await authAPI.verifyOtp(mobile, otp);
    const data = response.data.data || response.data;
    const token = data.token || data.access_token;
    const userData = extractUser(data);

    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const registerCustomer = async (data) => {
    const response = await authAPI.register(data);
    const result = response.data.data || response.data;
    // Don't auto-login — let the user verify OTP first.
    // Return full result (user, otp in dev mode) so the caller can navigate to OTP screen.
    return result;
  };

  const registerTransporter = async (data) => {
    const response = await authAPI.registerTransporter(data);
    const result = response.data.data || response.data;
    // Don't auto-login — let the user verify OTP first.
    // Return full result (user, otp in dev mode) so the caller can navigate to OTP screen.
    return result;
  };

  const updateUser = async (newData) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    await AsyncStorage.setItem('user_data', JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout API errors
    }
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    registerCustomer,
    registerTransporter,
    updateUser,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
