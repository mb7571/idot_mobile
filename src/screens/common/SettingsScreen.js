import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
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
      color: '#2563EB',
      bgColor: '#EFF6FF',
      onPress: () => {
        Alert.alert('Info', 'Profile edit screen will be implemented');
      },
    },
    {
      id: 2,
      title: 'Terms & Conditions',
      icon: '📄',
      description: 'Customer terms and conditions',
      color: '#059669',
      bgColor: '#ECFDF5',
      onPress: () => navigation.navigate('Content', { type: 'customer_terms', title: 'Terms & Conditions' }),
    },
    {
      id: 3,
      title: 'Privacy Policy',
      icon: '🔒',
      description: 'How we protect your data',
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      onPress: () => navigation.navigate('Content', { type: 'privacy_policy', title: 'Privacy Policy' }),
    },
    {
      id: 4,
      title: 'About iDOT',
      icon: 'ℹ️',
      description: 'Version 1.0.0',
      color: '#D97706',
      bgColor: '#FFFBEB',
      onPress: () => Alert.alert('iDOT', 'Version 1.0.0\nTransport Made Simple\n\n© 2026 iDOT. All rights reserved.'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userMobile}>{user?.mobile || ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleIcon}>👤</Text>
              <Text style={styles.roleText}>Customer Account</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <View style={[styles.menuArrow, { backgroundColor: item.color + '10' }]}>
                <Text style={[styles.menuArrowText, { color: item.color }]}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 16,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userMobile: {
    fontSize: 15,
    color: '#BFDBFE',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  roleIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  roleText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 16,
    marginTop: -24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuDescription: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  menuArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuArrowText: {
    fontSize: 20,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
