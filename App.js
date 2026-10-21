import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initApiConfig, isApiConfigReady } from './src/config/api';
import { toastConfig } from './src/components/toastConfig';

const App = () => {
  // The dynamic host resolver (initApiConfig, started in index.js) must finish
  // before any screen fires a request, otherwise they hit a stale base URL.
  const [ready, setReady] = useState(isApiConfigReady());

  useEffect(() => {
    if (!ready) {
      initApiConfig().then(() => setReady(true));
    }
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
      {/* Global toast overlay (low-searches warnings etc.) */}
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;
