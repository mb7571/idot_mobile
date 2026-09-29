import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../styles/colors';
import { transporterAPI } from '../../api';
import { EmptyState, LoadingSpinner } from '../../components/SharedComponents';
import ServiceAreaMap from '../../components/ServiceAreaMap';

const CityList = ({ cities, dotColor }) => {
  if (!cities || cities.length === 0) return null;
  return (
    <View style={styles.cityWrap}>
      {cities.map((c, i) => (
        <View key={`${c.id}-${i}`} style={styles.cityChip}>
          <View style={[styles.cityDot, { backgroundColor: dotColor }]} />
          <Text style={styles.cityName} numberOfLines={1}>
            {c.name}
            {c.pivot?.service_radius_km ? ` · ${parseFloat(c.pivot.service_radius_km)} km` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
};

const MyFleetScreen = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFleet();
    }, []),
  );

  const loadFleet = async () => {
    try {
      const response = await transporterAPI.getMyFleet();
      const data = response.data.data;
      setFleet(data?.data || data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFleet();
    setRefreshing(false);
  };

  const renderFleet = ({ item }) => {
    const vehicleTypes = (item.vehicle_types || [])
      .map((vt) => vt.name)
      .concat(item.vehicle_type ? [item.vehicle_type.name] : []);
    const uniqueTypes = [...new Set(vehicleTypes)].filter(Boolean);
    const fromCities = item.from_service_cities || [];
    const toCities = item.to_service_cities || [];

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.truckBadge}>
            <Text style={styles.truckIcon}>🚛</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.cardTitle}>My Fleet Services</Text>
            <Text style={styles.cardSubtitle}>
              {item.is_active ? '🟢 Active — visible in search' : '⚪ Inactive — hidden from search'}
            </Text>
          </View>
        </View>

        {/* Vehicle types */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>VEHICLE TYPES</Text>
          {uniqueTypes.length > 0 ? (
            <View style={styles.typeWrap}>
              {uniqueTypes.map((name, i) => (
                <View key={i} style={styles.typeChip}>
                  <Text style={styles.typeChipText}>{name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyValue}>Not configured</Text>
          )}
        </View>

        {/* From cities */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: '#16A34A' }]}>
            🟢 FROM — WE PICK UP FROM
          </Text>
          {fromCities.length > 0 ? (
            <CityList cities={fromCities} dotColor="#10B981" />
          ) : (
            <Text style={styles.emptyValue}>None configured</Text>
          )}
        </View>

        {/* To cities */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: '#DC2626' }]}>
            🔴 TO — WE DELIVER TO
          </Text>
          {toCities.length > 0 ? (
            <CityList cities={toCities} dotColor="#EF4444" />
          ) : (
            <Text style={styles.emptyValue}>None configured</Text>
          )}
        </View>

        {/* View Service Area Map button */}
        {fromCities.length > 0 || toCities.length > 0 ? (
          <TouchableOpacity
            style={styles.mapViewBtn}
            onPress={() => setMapModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.mapViewBtnText}>🗺️ View Service Area Map</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (loading) return <LoadingSpinner />;

  // Any fleet entry has radius configured → show the explainer below the card(s)
  const hasRadius = fleet.some((f) =>
    [...(f.from_service_cities || []), ...(f.to_service_cities || [])].some(
      (c) => c.pivot?.service_radius_km !== null && c.pivot?.service_radius_km !== undefined,
    ),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={fleet}
        renderItem={renderFleet}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={
          fleet.length > 0 ? (
            <View>
              {/* Radius explainer — below the fleet service card */}
              {hasRadius && (
                <View style={styles.radiusNote}>
                  <Text style={styles.radiusNoteTitle}>📍 What does the km number mean?</Text>
                  <Text style={styles.radiusNoteText}>
                    It is the service radius around each city. Customers searching from a point
                    within that many kilometers of the city will find your service — even if their
                    exact location is outside the city.
                  </Text>
                  <Text style={styles.radiusNoteExample}>
                    Example: "Nashik · 10 km" means a customer in Trimbak (12 km from Nashik) will
                    NOT see you, but one in Adgaon (8 km from Nashik) WILL.
                  </Text>
                </View>
              )}

              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  ℹ️ Fleet service entries (vehicles & service cities) are managed by the iDOT admin
                  team. Contact support to make changes.
                </Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="🚛"
            title="No Fleet Service Yet"
            message="Your fleet service entry will appear here once configured by the admin team."
          />
        }
      />

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
            <ServiceAreaMap fleet={fleet} fullHeight />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  infoBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoBannerText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  truckBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckIcon: { fontSize: 20 },
  headerInfo: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Sections
  sectionBlock: { marginBottom: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyValue: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },

  // Vehicle type chips
  typeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },

  // City chips
  cityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  cityDot: { width: 7, height: 7, borderRadius: 4 },
  cityName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
  },

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

  // Radius explainer
  radiusNote: {
    backgroundColor: '#F0F4FF',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  radiusNoteTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 5,
  },
  radiusNoteText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
  radiusNoteExample: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default MyFleetScreen;
