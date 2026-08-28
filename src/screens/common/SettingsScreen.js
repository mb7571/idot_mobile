import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 1,
      title: 'My Profile',
      icon: '👤',
      description: 'View and edit your profile',
      onPress: () => {
        // TODO: Navigate to profile edit
        Alert.alert('Info', 'Profile edit screen will be implemented');
      },
    },
    {
      id: 2,
      title: 'Customer Terms & Conditions',
      icon: '📄',
      description: 'View terms and conditions',
      onPress: () => navigation.navigate('Content', { type: 'customer_terms', title: 'Terms & Conditions' }),
    },
    {
      id: 3,
      title: 'Privacy Policy',
      icon: '🔒',
      description: 'View privacy policy',
      onPress: () => navigation.navigate('Content', { type: 'privacy_policy', title: 'Privacy Policy' }),
    },
    {
      id: 4,
      title: 'About iDOT',
      icon: 'ℹ️',
      description: 'Version 1.0.0',
      onPress: () => Alert.alert('iDOT', 'Version 1.0.0\nTransport made simple'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userMobile}>{user?.mobile || ''}</Text>
        <Text style={styles.userRole}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Account</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
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
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  userMobile: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  userRole: {
    fontSize: 13,
    color: '#2563EB',
    marginTop: 4,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
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

export default SettingsScreen;
