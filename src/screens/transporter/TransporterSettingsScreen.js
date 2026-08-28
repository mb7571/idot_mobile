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

const TransporterSettingsScreen = ({ navigation }) => {
  const { user, transporterProfile, logout } = useAuth();

  const menuItems = [
    {
      id: 1,
      title: 'My Profile',
      icon: '👤',
      description: 'View and edit your business profile',
      onPress: () => Alert.alert('Info', 'Profile edit screen will be implemented'),
    },
    {
      id: 2,
      title: 'Verification Status',
      icon: '✅',
      description: `Status: ${transporterProfile?.verification_status || 'pending'}`,
      onPress: () => {
        const status = transporterProfile?.verification_status;
        let message = '';
        if (status === 'verified') {
          message = 'Your transporter profile has been verified successfully.';
        } else if (status === 'rejected') {
          message = `Your registration has been rejected. ${transporterProfile?.rejection_reason || 'Please contact administrator.'}`;
        } else {
          message = 'Your registration is pending verification. Please wait for admin approval.';
        }
        Alert.alert('Verification Status', message);
      },
    },
    {
      id: 3,
      title: 'Service Location',
      icon: '📍',
      description: `Service Radius: ${transporterProfile?.radius_option?.label || 'Not set'}`,
      onPress: () => {
        Alert.alert(
          'Service Location',
          `Location: ${transporterProfile?.service_location_address || 'Not set'}\nRadius: ${transporterProfile?.radius_option?.label || 'Not set'}\n\nNote: Service location is configured by admin.`
        );
      },
    },
    {
      id: 4,
      title: 'Transporter Terms & Conditions',
      icon: '📄',
      description: 'View terms and conditions',
      onPress: () => navigation.navigate('Content', { type: 'transporter_terms', title: 'Terms & Conditions' }),
    },
    {
      id: 5,
      title: 'Privacy Policy',
      icon: '🔒',
      description: 'View privacy policy',
      onPress: () => navigation.navigate('Content', { type: 'privacy_policy', title: 'Privacy Policy' }),
    },
    {
      id: 6,
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
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'T'}</Text>
        </View>
        <Text style={styles.businessName}>{transporterProfile?.business_name || user?.name || 'Transporter'}</Text>
        <Text style={styles.contactPerson}>{transporterProfile?.contact_person_name || ''}</Text>
        <Text style={styles.mobile}>{user?.mobile || ''}</Text>
        <View style={[styles.statusBadge, transporterProfile?.verification_status === 'verified' ? styles.badgeVerified : styles.badgePending]}>
          <Text style={[styles.statusText, transporterProfile?.verification_status === 'verified' ? styles.textVerified : styles.textPending]}>
            {transporterProfile?.verification_status === 'verified' ? '✓ Verified' : '⏳ Pending'}
          </Text>
        </View>
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
  businessName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  contactPerson: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  mobile: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeVerified: {
    backgroundColor: '#D1FAE5',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  textVerified: {
    color: '#065F46',
  },
  textPending: {
    color: '#92400E',
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

export default TransporterSettingsScreen;
