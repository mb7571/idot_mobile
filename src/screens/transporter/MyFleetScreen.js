import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { transporterAPI } from '../../services/api';

const MyFleetScreen = ({ navigation }) => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFleet();
  }, []);

  const loadFleet = async () => {
    try {
      setLoading(true);
      const response = await transporterAPI.getMyProfile();
      const profile = response.data.data;
      setFleet(profile.fleet || []);
    } catch (error) {
      console.error('Failed to load fleet:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFleetItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.vehicleName}>{item.vehicle_name || item.vehicle_type?.name || 'Vehicle'}</Text>
        <View style={[styles.statusBadge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.badgeText, item.is_active ? styles.textActive : styles.textInactive]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        {item.vehicle_number && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle Number</Text>
            <Text style={styles.detailValue}>🔢 {item.vehicle_number}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vehicle Type</Text>
          <Text style={styles.detailValue}>🚛 {item.vehicle_type?.name || 'N/A'}</Text>
        </View>
        {item.capacity_weight && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacity (Weight)</Text>
            <Text style={styles.detailValue}>⚖️ {item.capacity_weight} tons</Text>
          </View>
        )}
        {item.capacity_volume && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacity (Volume)</Text>
            <Text style={styles.detailValue}>📐 {item.capacity_volume}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>ℹ️ Fleet information is managed by the administrator. Contact admin for changes.</Text>
      </View>

      <FlatList
        data={fleet}
        renderItem={renderFleetItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚛</Text>
            <Text style={styles.emptyText}>No fleet information</Text>
            <Text style={styles.emptySubtext}>Your fleet details will appear here once assigned by admin</Text>
          </View>
        }
      />
    </View>
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
  infoBanner: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
  },
  badgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textActive: {
    color: '#065F46',
  },
  textInactive: {
    color: '#6B7280',
  },
  details: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MyFleetScreen;
