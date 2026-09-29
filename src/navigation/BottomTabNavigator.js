import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../styles/colors';

// Customer screens
import HomeScreen from '../screens/customer/HomeScreen';
import TransporterSearchScreen from '../screens/customer/TransporterSearchScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import MyRequestsScreen from '../screens/customer/MyRequestsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

const CustomerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray400,
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="SearchTab"
      component={TransporterSearchScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="🔍" label="Search" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="FavoritesTab"
      component={FavoritesScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="⭐" label="Favorites" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="RequestsTab"
      component={MyRequestsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Requests" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="SettingsTab"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Settings" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

// Transporter tab navigator
import TransporterDashboardScreen from '../screens/transporter/TransporterDashboardScreen';
import IncomingRequestsScreen from '../screens/transporter/IncomingRequestsScreen';
import MyFleetScreen from '../screens/transporter/MyFleetScreen';
import TransporterSettingsScreen from '../screens/transporter/TransporterSettingsScreen';

const TransporterTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray400,
    }}
  >
    <Tab.Screen
      name="DashboardTab"
      component={TransporterDashboardScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="IncomingTab"
      component={IncomingRequestsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="📥" label="Requests" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="FleetTab"
      component={MyFleetScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="🚛" label="Services" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="TransporterSettingsTab"
      component={TransporterSettingsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Settings" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.gray400,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export { CustomerTabNavigator, TransporterTabNavigator };
