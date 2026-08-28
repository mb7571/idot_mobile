import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RegisterTransporterScreen from '../screens/auth/RegisterTransporterScreen';

// Common Screens
import HomeScreen from '../screens/common/HomeScreen';
import TransporterSearchScreen from '../screens/common/TransporterSearchScreen';
import TransporterListScreen from '../screens/common/TransporterListScreen';
import TransporterProfileScreen from '../screens/common/TransporterProfileScreen';
import FavoritesScreen from '../screens/common/FavoritesScreen';
import ServiceRequestScreen from '../screens/common/ServiceRequestScreen';
import MyRequestsScreen from '../screens/common/MyRequestsScreen';
import RequestDetailScreen from '../screens/common/RequestDetailScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import ContentScreen from '../screens/common/ContentScreen';

// Transporter Screens
import TransporterDashboardScreen from '../screens/transporter/TransporterDashboardScreen';
import IncomingRequestsScreen from '../screens/transporter/IncomingRequestsScreen';
import MyFleetScreen from '../screens/transporter/MyFleetScreen';
import TransporterSettingsScreen from '../screens/transporter/TransporterSettingsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminTransportersScreen from '../screens/admin/AdminTransportersScreen';
import AdminCustomersScreen from '../screens/admin/AdminCustomersScreen';
import AdminServiceRequestsScreen from '../screens/admin/AdminServiceRequestsScreen';
import AdminMastersScreen from '../screens/admin/AdminMastersScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminBulkImportScreen from '../screens/admin/AdminBulkImportScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#FFFFFF' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="RegisterTransporter" component={RegisterTransporterScreen} />
  </Stack.Navigator>
);

const CustomerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2563EB' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'iDOT' }} />
    <Stack.Screen name="TransporterSearch" component={TransporterSearchScreen} options={{ title: 'Search Transporters' }} />
    <Stack.Screen name="TransporterList" component={TransporterListScreen} options={{ title: 'Transporters' }} />
    <Stack.Screen name="TransporterProfile" component={TransporterProfileScreen} options={{ title: 'Transporter Profile' }} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'My Favorites' }} />
    <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} options={{ title: 'Service Request' }} />
    <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'My Requests' }} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request Details' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="Content" component={ContentScreen} options={{ title: 'Content' }} />
  </Stack.Navigator>
);

const TransporterStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2563EB' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <Stack.Screen name="TransporterDashboard" component={TransporterDashboardScreen} options={{ title: 'iDOT - Transporter' }} />
    <Stack.Screen name="TransporterSearch" component={TransporterSearchScreen} options={{ title: 'Search Transporters' }} />
    <Stack.Screen name="TransporterList" component={TransporterListScreen} options={{ title: 'Transporters' }} />
    <Stack.Screen name="TransporterProfile" component={TransporterProfileScreen} options={{ title: 'Transporter Profile' }} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'My Favorites' }} />
    <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} options={{ title: 'Service Request' }} />
    <Stack.Screen name="IncomingRequests" component={IncomingRequestsScreen} options={{ title: 'Incoming Requests' }} />
    <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'My Requests' }} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request Details' }} />
    <Stack.Screen name="MyFleet" component={MyFleetScreen} options={{ title: 'My Fleet' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="TransporterSettings" component={TransporterSettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="Content" component={ContentScreen} options={{ title: 'Content' }} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1E40AF' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'iDOT - Admin Panel' }} />
    <Stack.Screen name="AdminTransporters" component={AdminTransportersScreen} options={{ title: 'Transporter Management' }} />
    <Stack.Screen name="AdminCustomers" component={AdminCustomersScreen} options={{ title: 'Customer Management' }} />
    <Stack.Screen name="AdminServiceRequests" component={AdminServiceRequestsScreen} options={{ title: 'Service Requests' }} />
    <Stack.Screen name="AdminMasters" component={AdminMastersScreen} options={{ title: 'Master Data' }} />
    <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Reports' }} />
    <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'System Settings' }} />
    <Stack.Screen name="AdminBulkImport" component={AdminBulkImportScreen} options={{ title: 'Bulk Import' }} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  switch (user?.role) {
    case 'admin':
      return <AdminStack />;
    case 'transporter':
      return <TransporterStack />;
    case 'customer':
    default:
      return <CustomerStack />;
  }
};

export default AppNavigator;
