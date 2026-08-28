import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [transporterProfile, setTransporterProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      const storedProfile = await AsyncStorage.getItem('transporter_profile');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedProfile) {
          setTransporterProfile(JSON.parse(storedProfile));
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (mobile) => {
    const response = await authAPI.sendOtp(mobile);
    return response.data;
  };

  const verifyOtp = async (mobile, otp) => {
    const response = await authAPI.verifyOtp(mobile, otp);
    const { user: userData, token: authToken, transporter_profile } = response.data.data;

    await AsyncStorage.setItem('auth_token', authToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));

    if (transporter_profile) {
      await AsyncStorage.setItem('transporter_profile', JSON.stringify(transporter_profile));
      setTransporterProfile(transporter_profile);
    }

    setToken(authToken);
    setUser(userData);

    return response.data;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { user: userData, token: authToken } = response.data.data;

    await AsyncStorage.setItem('auth_token', authToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));

    setToken(authToken);
    setUser(userData);

    return response.data;
  };

  const registerTransporter = async (data) => {
    const response = await authAPI.registerTransporter(data);
    const { user: userData, token: authToken, transporter_profile } = response.data.data;

    await AsyncStorage.setItem('auth_token', authToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    await AsyncStorage.setItem('transporter_profile', JSON.stringify(transporter_profile));

    setToken(authToken);
    setUser(userData);
    setTransporterProfile(transporter_profile);

    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API fails
    }

    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    await AsyncStorage.removeItem('transporter_profile');

    setToken(null);
    setUser(null);
    setTransporterProfile(null);
  };

  const updateUser = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  };

  const updateTransporterProfile = async (profileData) => {
    setTransporterProfile(profileData);
    await AsyncStorage.setItem('transporter_profile', JSON.stringify(profileData));
  };

  const isAuthenticated = !!token;
  const isCustomer = user?.role === 'customer';
  const isTransporter = user?.role === 'transporter';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        transporterProfile,
        token,
        loading,
        isAuthenticated,
        isCustomer,
        isTransporter,
        isAdmin,
        sendOtp,
        verifyOtp,
        register,
        registerTransporter,
        logout,
        updateUser,
        updateTransporterProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
