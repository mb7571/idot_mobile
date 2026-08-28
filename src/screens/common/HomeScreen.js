import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.unreadCount();
      setUnreadCount(response.data.data.unread_count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUnreadCount();
    setRefreshing(false);
  };

  const menuItems = [
    {
      id: 1,
      title: 'Search Transporters',
      icon: '🔍',
      description: 'Find transporters by name, location, or vehicle type',
      screen: 'TransporterSearch',
      color: '#2563EB',
    },
    {
      id: 2,
      title: 'My Favorites',
      icon: '❤️',
      description: 'View your saved transporters',
      screen: 'Favorites',
      color: '#DC2626',
    },
    {
      id: 3,
      title: 'My Requests',
      icon: '📋',
      description: 'View your service requests',
      screen: 'MyRequests',
      color: '#059669',
    },
    {
      id: 4,
      title: 'Notifications',
      icon: '🔔',
      description: unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications',
      screen: 'Notifications',
      color: '#D97706',
      badge: unreadCount,
    },
    {
      id: 5,
      title: 'Settings',
      icon: '⚙️',
      description: 'Manage your account settings',
      screen: 'Settings',
      color: '#6B7280',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.nameText}>{user?.name || 'User'}</Text>
        <Text style={styles.roleText}>
          {user?.role === 'customer' ? 'Customer' : 'Transporter'} Account
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              {item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  welcomeSection: {
    backgroundColor: '#2563EB',
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#BFDBFE',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  menuDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
