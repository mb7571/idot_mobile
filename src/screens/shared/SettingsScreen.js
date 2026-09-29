import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    {
      icon: '👤',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      screen: 'EditProfile',
      color: '#3B82F6',
    },
    {
      icon: 'ℹ️',
      title: 'About Us',
      subtitle: 'Learn about iDOT',
      onPress: () => navigation.navigate('Content', { type: 'about_us' }),
      color: '#0EA5E9',
    },
    {
      icon: '❓',
      title: 'FAQ',
      subtitle: 'Frequently asked questions',
      onPress: () => navigation.navigate('Content', { type: 'faq' }),
      color: '#14B8A6',
    },
    {
      icon: '📜',
      title: 'Terms & Conditions',
      subtitle: 'Customer terms',
      onPress: () => navigation.navigate('Content', { type: 'customer_terms' }),
      color: '#8B5CF6',
    },
    {
      icon: '🔒',
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      onPress: () => navigation.navigate('Content', { type: 'privacy_policy' }),
      color: '#6366F1',
    },
    {
      icon: '📞',
      title: 'Help & Contact',
      subtitle: 'Get support',
      onPress: () => navigation.navigate('Content', { type: 'contact' }),
      color: '#EC4899',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient colors={['#2563EB', '#1E40AF']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Customer</Text>
          </View>
          {user?.mobile && (
            <Text style={styles.profileInfo}>📱 {user.mobile}</Text>
          )}
          {user?.email && (
            <Text style={styles.profileInfo}>📧 {user.email}</Text>
          )}
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress || (() => navigation.navigate(item.screen))}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.menuIconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <LinearGradient
            colors={['#FEE2E2', '#FECACA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.version}>iDOT v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  roleText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  profileInfo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 22,
    color: COLORS.gray300,
    fontWeight: '300',
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 20,
  },
});

export default SettingsScreen;
