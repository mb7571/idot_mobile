import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  const statCards = [
    { title: 'Customers', value: dashboard?.total_customers || 0, icon: '👥', color: '#2563EB' },
    { title: 'Transporters', value: dashboard?.total_transporters || 0, icon: '🚛', color: '#059669' },
    { title: 'Pending', value: dashboard?.pending_transporters || 0, icon: '⏳', color: '#D97706' },
    { title: 'Verified', value: dashboard?.verified_transporters || 0, icon: '✅', color: '#10B981' },
    { title: 'Service Requests', value: dashboard?.total_service_requests || 0, icon: '📋', color: '#7C3AED' },
    { title: 'Favorites', value: dashboard?.total_favorites || 0, icon: '❤️', color: '#DC2626' },
  ];

  const menuItems = [
    {
      id: 1,
      title: 'Transporter Management',
      icon: '🚛',
      description: 'Manage transporters, verify, activate/deactivate',
      screen: 'AdminTransporters',
      color: '#059669',
    },
    {
      id: 2,
      title: 'Customer Management',
      icon: '👥',
      description: 'View and manage customer accounts',
      screen: 'AdminCustomers',
      color: '#2563EB',
    },
    {
      id: 3,
      title: 'Service Requests',
      icon: '📋',
      description: 'View all service requests',
      screen: 'AdminServiceRequests',
      color: '#7C3AED',
    },
    {
      id: 4,
      title: 'Master Data',
      icon: '⚙️',
      description: 'Business types, vehicle types, cities, radius',
      screen: 'AdminMasters',
      color: '#D97706',
    },
    {
      id: 5,
      title: 'Bulk Import',
      icon: '📤',
      description: 'Import transporters from Excel',
      screen: 'AdminBulkImport',
      color: '#EA580C',
    },
    {
      id: 6,
      title: 'Reports',
      icon: '📊',
      description: 'View reports and analytics',
      screen: 'AdminReports',
      color: '#0891B2',
    },
    {
      id: 7,
      title: 'Settings',
      icon: '⚙️',
      description: 'System settings and content management',
      screen: 'AdminSettings',
      color: '#6B7280',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>Admin Panel</Text>
        <Text style={styles.nameText}>{user?.name || 'Admin'}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    backgroundColor: '#1E40AF',
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
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

export default AdminDashboardScreen;
