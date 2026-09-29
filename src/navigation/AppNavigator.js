import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Splash
import SplashScreen from '../screens/SplashScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RegisterTransporterScreen from '../screens/auth/RegisterTransporterScreen';

// Bottom Tabs
import { CustomerTabNavigator, TransporterTabNavigator } from './BottomTabNavigator';

// Stack-only screens (pushed on top of tabs)
import TransporterSearchScreen from '../screens/customer/TransporterSearchScreen';
import TransporterListScreen from '../screens/customer/TransporterListScreen';
import TransporterProfileScreen from '../screens/customer/TransporterProfileScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import ServiceRequestScreen from '../screens/customer/ServiceRequestScreen';
import MyRequestsScreen from '../screens/customer/MyRequestsScreen';
import RequestDetailScreen from '../screens/customer/RequestDetailScreen';

// Transporter stack screens
import IncomingRequestsScreen from '../screens/transporter/IncomingRequestsScreen';
import MyFleetScreen from '../screens/transporter/MyFleetScreen';
import TransporterMyProfileScreen from '../screens/transporter/TransporterMyProfileScreen';
import TransporterEditProfileScreen from '../screens/transporter/TransporterEditProfileScreen';

// Shared screens
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ContentScreen from '../screens/shared/ContentScreen';

const Stack = createNativeStackNavigator();

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: '#2563EB',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '600', fontSize: 17 },
  headerBackTitleVisible: false,
  animation: 'slide_from_right',
};

// ==================== SPLASH + AUTH ====================
const AuthFlow = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Auth" component={AuthStack} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F0F4F8' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="RegisterTransporter" component={RegisterTransporterScreen} />
  </Stack.Navigator>
);

// ==================== CUSTOMER FLOW ====================
// Tabs are the root, detail screens are pushed on top
const CustomerFlow = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    {/* Tab navigator as the home screen - shows bottom tabs */}
    <Stack.Screen
      name="CustomerTabs"
      component={CustomerTabNavigator}
      options={{ headerShown: false }}
    />

    {/* Detail screens pushed ON TOP of tabs - back button returns to tabs */}
    <Stack.Screen name="TransporterSearch" component={TransporterSearchScreen} options={{ title: 'Search Transporters' }} />
    <Stack.Screen name="TransporterList" component={TransporterListScreen} options={{ title: 'Transporters' }} />
    <Stack.Screen name="TransporterProfile" component={TransporterProfileScreen} options={{ title: 'Transporter Profile' }} />
    <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} options={{ title: 'Service Request' }} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'My Favorites' }} />
    <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'My Requests' }} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request Details' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Content" component={ContentScreen} options={{ title: 'Content' }} />
  </Stack.Navigator>
);

// ==================== TRANSPORTER FLOW ====================
const TransporterFlow = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="TransporterTabs"
      component={TransporterTabNavigator}
      options={{ headerShown: false }}
    />

    <Stack.Screen name="TransporterSearch" component={TransporterSearchScreen} options={{ title: 'Search Transporters' }} />
    <Stack.Screen name="TransporterList" component={TransporterListScreen} options={{ title: 'Transporters' }} />
    <Stack.Screen name="TransporterProfile" component={TransporterProfileScreen} options={{ title: 'Transporter Profile' }} />
    <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} options={{ title: 'Service Request' }} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'My Favorites' }} />
    <Stack.Screen name="IncomingRequests" component={IncomingRequestsScreen} options={{ title: 'Incoming Requests' }} />
    <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'My Requests' }} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request Details' }} />
    <Stack.Screen name="MyFleet" component={MyFleetScreen} options={{ title: 'My Fleet Services' }} />
    <Stack.Screen name="TransporterMyProfile" component={TransporterMyProfileScreen} options={{ title: 'My Profile' }} />
    <Stack.Screen name="TransporterEditProfile" component={TransporterEditProfileScreen} options={{ title: 'Edit Business Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Content" component={ContentScreen} options={{ title: 'Content' }} />
  </Stack.Navigator>
);

// ==================== MAIN NAVIGATOR ====================
const AppNavigator = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  switch (user?.role) {
    case 'transporter':
      return <TransporterFlow />;
    case 'customer':
    default:
      return <CustomerFlow />;
  }
};

export default AppNavigator;
