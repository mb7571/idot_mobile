import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../styles/colors';
import { transporterAPI } from '../../api';
import { StatusBadge, LoadingSpinner } from '../../components/SharedComponents';
import { APP_DOWNLOAD_LINK } from '../../config/api';
import { getStatusInfo, getLogoUrl } from '../../utils/helpers';

const TransporterMyProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    try {
      const response = await transporterAPI.getMyProfile();
      setProfile(response.data.data || response.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Profile not found.</Text>
      </View>
    );
  }

  const logoUrl = getLogoUrl(profile.logo);
  const initials = (profile.business_name || 'T')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const vehicleTypeNames = (() => {
    const types = new Set();
    (profile.fleet || []).forEach((f) => {
      if (Array.isArray(f.vehicle_types)) f.vehicle_types.forEach((vt) => types.add(vt.name));
      if (f.vehicle_type?.name) types.add(f.vehicle_type.name);
    });
    return types.size ? Array.from(types).join(', ') : null;
  })();

  const activeFleet = (profile.fleet || []).filter((f) => f.is_active).length;

  // Share own profile via the native system share sheet (WhatsApp, SMS, etc.)
  const shareProfile = () => {
    const lines = [
      '🚛 iDOT — Transporter Details',
      '',
      `🏢 ${profile.business_name || 'Transporter'}`,
    ];
    if (profile.contact_person_name) {
      lines.push(`👤 Contact: ${profile.contact_person_name}`);
    }
    if (profile.business_location_address) {
      lines.push(`📍 Address: ${profile.business_location_address}`);
    }
    if (profile.business_city) {
      lines.push(`🏙️ City: ${profile.business_city}`);
    }
    if (profile.business_state) {
      lines.push(`🗺️ State: ${profile.business_state}`);
    }
    if (profile.mobile) {
      lines.push(`📱 Mobile: ${profile.mobile}`);
    }
    lines.push('', '📲 Download the iDOT app:', APP_DOWNLOAD_LINK);

    Share.share({
      message: lines.join('\n'),
      title: `${profile.business_name || 'Transporter'} — iDOT`,
    }).catch(() => {
      // User cancelled the share sheet — nothing to do
    });
  };

  const sections = [
    {
      title: 'Business Information',
      icon: '🏢',
      rows: [
        { label: 'Business Name', value: profile.business_name },
        { label: 'Business Type', value: profile.business_type?.name },
        { label: 'Contact Person', value: profile.contact_person_name },
        { label: 'Description', value: profile.description },
      ],
    },
    {
      title: 'Contact Details',
      icon: '📞',
      rows: [
        { label: 'Mobile (login)', value: profile.mobile, locked: true },
        { label: 'Email', value: profile.email },
      ],
    },
    {
      title: 'Business Location',
      icon: '📍',
      rows: [
        { label: 'Address', value: profile.business_location_address },
        { label: 'City', value: profile.business_city },
        { label: 'State', value: profile.business_state },
        { label: 'Pincode', value: profile.business_pincode },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero */}
        <LinearGradient colors={['#2563EB', '#1E40AF', '#1E3A8A']} style={styles.hero}>
          <View style={styles.heroContent}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.logoPlaceholder}
              >
                <Text style={styles.logoInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <Text style={styles.businessName}>{profile.business_name || 'My Business'}</Text>
            <View style={styles.heroBadges}>
              {profile.verification_status && (
                <StatusBadge info={getStatusInfo(profile.verification_status)} />
              )}
              {profile.business_type?.name && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{profile.business_type.name}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Sections */}
        <View style={styles.sections}>
          {sections.map((section, si) => {
            const rows = section.rows.filter((r) => r.value);
            if (rows.length === 0) return null;
            return (
              <View key={si} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{section.icon}</Text>
                  <Text style={styles.cardTitle}>{section.title}</Text>
                </View>
                {rows.map((row, ri) => (
                  <View
                    key={ri}
                    style={[styles.infoRow, ri === rows.length - 1 && styles.infoRowLast]}
                  >
                    <Text style={styles.infoLabel}>
                      {row.label}
                      {row.locked && ' 🔒'}
                    </Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            );
          })}

          {/* Service Area Map (compact) */}

          {/* Edit + Share buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('TransporterEditProfile', { profile })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563EB', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editBtnGradient}
              >
                <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={shareProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.shareBtnText}>📤 Share Profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.lockNote}>
            🔒 Mobile number is your login identity and cannot be changed. Contact support for
            help.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: COLORS.textSecondary },

  // Hero
  hero: {
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroContent: { alignItems: 'center', paddingHorizontal: 20 },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: { fontSize: 32, fontWeight: '900', color: COLORS.white },
  businessName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroBadges: { flexDirection: 'row', gap: 8 },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },

  // Sections
  sections: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  infoRowLast: { borderBottomWidth: 0, paddingBottom: 2 },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Edit + Share buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  editBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 14,
  },
  editBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  shareBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  lockNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default TransporterMyProfileScreen;
