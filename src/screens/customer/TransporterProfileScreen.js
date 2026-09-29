import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Modal,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { transporterAPI, favoriteAPI } from '../../api';
import { APP_DOWNLOAD_LINK } from '../../config/api';
import { StatusBadge, LoadingSpinner } from '../../components/SharedComponents';
import ServiceAreaMap from '../../components/ServiceAreaMap';
import { getStatusInfo, getLogoUrl } from '../../utils/helpers';

const TransporterProfileScreen = ({ route, navigation }) => {
  const { transporterId } = route.params;
  const [transporter, setTransporter] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, favRes] = await Promise.all([
        transporterAPI.getProfile(transporterId),
        favoriteAPI.check(transporterId).catch(() => ({ data: { data: { is_favorited: false } } })),
      ]);
      setTransporter(profileRes.data.data || profileRes.data);
      setIsFavorite(
        favRes.data?.data?.is_favorited ||
        favRes.data?.is_favorited ||
        false
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load transporter profile.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await favoriteAPI.remove(transporterId);
        setIsFavorite(false);
      } else {
        await favoriteAPI.add(transporterId);
        setIsFavorite(true);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update favorite.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingFavorite(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!transporter) return null;

  const logoUrl = getLogoUrl(transporter.logo);
  const initials = (transporter.business_name || 'N/A')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Share via the native system share sheet (WhatsApp, SMS, etc.)
  const shareTransporter = () => {
    const lines = [
      '🚛 iDOT — Transporter Details',
      '',
      `🏢 ${transporter.business_name || 'Transporter'}`,
    ];
    if (transporter.contact_person_name) {
      lines.push(`👤 Contact: ${transporter.contact_person_name}`);
    }
    if (transporter.business_location_address) {
      lines.push(`📍 Address: ${transporter.business_location_address}`);
    }
    if (transporter.business_city) {
      lines.push(`🏙️ City: ${transporter.business_city}`);
    }
    if (transporter.mobile) {
      lines.push(`📱 Mobile: ${transporter.mobile}`);
    }
    lines.push('', '📲 Download the iDOT app:', APP_DOWNLOAD_LINK);

    Share.share({
      message: lines.join('\n'),
      title: `${transporter.business_name || 'Transporter'} — iDOT`,
    }).catch(() => {
      // User cancelled the share sheet — nothing to do
    });
  };

  const getVehicleTypeNames = () => {
    const fleet = transporter.fleet || [];
    const types = new Set();
    fleet.forEach((f) => {
      if (f.vehicle_types && Array.isArray(f.vehicle_types)) {
        f.vehicle_types.forEach((vt) => types.add(vt.name));
      }
      if (f.vehicle_type) types.add(f.vehicle_type.name);
    });
    return types.size > 0 ? Array.from(types).join(', ') : null;
  };

  const getServiceLocations = () => {
    const fleet = transporter.fleet || [];
    const fromLocations = new Set();
    const toLocations = new Set();
    let maxRadius = 0;
    fleet.forEach((f) => {
      if (f.from_service_cities) f.from_service_cities.forEach((c) => fromLocations.add(c.name));
      if (f.to_service_cities) f.to_service_cities.forEach((c) => toLocations.add(c.name));
      if (f.service_radius_km > maxRadius) maxRadius = f.service_radius_km;
    });
    return {
      from: fromLocations.size > 0 ? Array.from(fromLocations).join(', ') : null,
      to: toLocations.size > 0 ? Array.from(toLocations).join(', ') : null,
      radius: maxRadius > 0 ? `${maxRadius} km` : null,
    };
  };

  const vehicleTypeNames = getVehicleTypeNames();
  const serviceLocations = getServiceLocations();
  const radiusOption = transporter.radius_option;
  // Count only ACTIVE fleet entries — matches what the transporter actually operates
  const fleetCount = (transporter.fleet || []).filter((f) => f.is_active).length;
  const hasContact = transporter.mobile || transporter.email;

  const openDialer = () => {
    if (!transporter.mobile) return;
    Linking.openURL(`tel:${transporter.mobile}`).catch(() =>
      Alert.alert('Error', 'Could not open the dialer.'),
    );
  };

  const openEmail = () => {
    if (!transporter.email) return;
    Linking.openURL(`mailto:${transporter.email}`).catch(() =>
      Alert.alert('Error', 'Could not open the mail app.'),
    );
  };

  const stats = [
    { icon: '🚛', value: fleetCount, label: fleetCount === 1 ? 'Vehicle' : 'Vehicles' },
    { icon: '📍', value: serviceLocations.from ? serviceLocations.from.split(',').length : 0, label: 'Origin Cities' },
    { icon: '🏁', value: serviceLocations.to ? serviceLocations.to.split(',').length : 0, label: 'Destination Cities' },
  ];

  const infoSections = [
    {
      title: 'Business Information',
      icon: '🏢',
      items: [
        { label: 'Business Name', value: transporter.business_name },
        { label: 'Business Type', value: transporter.business_type?.name },
        { label: 'Description', value: transporter.description },
      ],
    },
    {
      title: 'Contact Details',
      icon: '📞',
      items: [
        { label: 'Contact Person', value: transporter.contact_person_name },
        { label: 'Mobile', value: transporter.mobile },
        { label: 'Email', value: transporter.email },
      ],
    },
    {
      title: 'Location',
      icon: '📍',
      items: [
        { label: 'Address', value: transporter.business_location_address },
        { label: 'City', value: transporter.business_city },
        { label: 'State', value: transporter.business_state },
      ],
    },
    {
      title: 'Service Details',
      icon: '🚛',
      items: [
        { label: 'Vehicle Types', value: vehicleTypeNames },
        { label: 'Service From', value: serviceLocations.from || transporter.service_location_address },
        { label: 'Service To', value: serviceLocations.to },
        { label: 'Radius', value: serviceLocations.radius || radiusOption?.label },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gradient Hero Header */}
        <LinearGradient colors={['#2563EB', '#1E40AF', '#1E3A8A']} style={styles.hero}>
          <View style={styles.heroContent}>
            {/* Logo */}
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

            <Text style={styles.businessName}>{transporter.business_name || 'N/A'}</Text>

            <View style={styles.heroBadges}>
              {transporter.verification_status && (
                <StatusBadge info={getStatusInfo(transporter.verification_status)} />
              )}
              {transporter.business_type?.name && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{transporter.business_type.name}</Text>
                </View>
              )}
            </View>

            {/* Favorite + Share buttons */}
            <View style={styles.heroActionRow}>
              <TouchableOpacity
                style={[
                  styles.favoriteBtn,
                  isFavorite && styles.favoriteBtnActive,
                ]}
                onPress={toggleFavorite}
                disabled={loadingFavorite}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.favoriteIcon,
                    isFavorite && styles.favoriteIconActive,
                  ]}
                >
                  {loadingFavorite ? '⏳' : isFavorite ? '★' : '☆'}
                </Text>
                <View>
                  <Text
                    style={[
                      styles.favoriteText,
                      isFavorite && styles.favoriteTextActive,
                    ]}
                  >
                    {isFavorite ? 'In Favorites' : 'Add Favorite'}
                  </Text>
                  <Text
                    style={[
                      styles.favoriteSubtext,
                      isFavorite && styles.favoriteSubtextActive,
                    ]}
                  >
                    {isFavorite ? 'Tap to remove' : 'Save for quick access'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={shareTransporter}
                activeOpacity={0.7}
              >
                <Text style={styles.shareIcon}>📤</Text>
                <Text style={styles.shareText}>Share</Text>
              </TouchableOpacity>
            </View>
            {/* Stats strip */}
            <View style={styles.statsStrip}>
              {stats.map((s, i) => (
                <View
                  key={i}
                  style={[styles.statItem, i > 0 && styles.statItemBordered]}
                >
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick contact actions */}
            {hasContact && (
              <View style={styles.quickActions}>
                {transporter.mobile && (
                  <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={openDialer}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickActionIcon}>📞</Text>
                    <Text style={styles.quickActionText}>Call</Text>
                  </TouchableOpacity>
                )}
                {transporter.email && (
                  <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={openEmail}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickActionIcon}>✉️</Text>
                    <Text style={styles.quickActionText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Info Sections */}
        <View style={styles.sectionsContainer}>
          {infoSections.map((section, sIndex) => {
            const validItems = section.items.filter((item) => item.value);
            if (validItems.length === 0) return null;
            return (
              <View key={sIndex} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>{section.icon}</Text>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                {validItems.map((item, iIndex) => (
                  <View
                    key={iIndex}
                    style={[
                      styles.infoRow,
                      iIndex === validItems.length - 1 && styles.infoRowLast,
                    ]}
                  >
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                ))}

                {/* View Service Area Map button (bottom of Service Details card) */}
                {section.title === 'Service Details' &&
                  (transporter.fleet || []).length > 0 && (
                    <TouchableOpacity
                      style={styles.mapViewBtn}
                      onPress={() => setMapModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.mapViewBtnText}>
                        🗺️ View Service Area Map
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            );
          })}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                navigation.navigate('ServiceRequest', {
                  transporterId: transporter.id,
                  transporter,
                })
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563EB', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>📋 Submit Service Request</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, isFavorite && styles.secondaryBtnActive]}
              onPress={toggleFavorite}
              disabled={loadingFavorite}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, isFavorite && styles.secondaryBtnTextActive]}>
                {isFavorite ? '⭐ Remove from Favorites' : '☆ Add to Favorites'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Full-page Service Area Map modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              style={styles.mapModalCloseBtn}
              onPress={() => setMapModalVisible(false)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.mapModalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>🗺️ Service Area</Text>
            <View style={styles.mapModalCloseBtn} />
          </View>
          <View style={styles.mapModalBody}>
            <ServiceAreaMap fleet={transporter.fleet || []} fullHeight />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },

  // Hero
  hero: {
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroContent: { alignItems: 'center', paddingHorizontal: 20 },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: { fontSize: 36, fontWeight: '900', color: COLORS.white },
  businessName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroBadges: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  // Favorite + share row
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
    marginBottom: 18,
  },
  favoriteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  favoriteBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  favoriteIcon: { fontSize: 26, color: COLORS.white },
  favoriteIconActive: { color: '#D97706' },
  favoriteText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  favoriteTextActive: { color: '#D97706' },
  favoriteSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  favoriteSubtextActive: { color: 'rgba(180,83,9,0.75)' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  shareIcon: { fontSize: 16 },
  shareText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statItemBordered: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.18)' },
  statIcon: { fontSize: 14, opacity: 0.9 },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Quick contact actions
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickActionIcon: { fontSize: 15 },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Sections
  sectionsContainer: { padding: 16 },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  infoRow: {
    paddingVertical: 9,
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

  // Actions
  actions: { gap: 12, marginTop: 4, marginBottom: 30 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  primaryBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnActive: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  secondaryBtnTextActive: { color: '#D97706' },

  // View Service Area Map button
  mapViewBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mapViewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  // Full-page map modal
  mapModalContainer: { flex: 1, backgroundColor: '#F0F4F8' },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapModalCloseText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  mapModalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  mapModalBody: { flex: 1, padding: 16 },
});

export default TransporterProfileScreen;
