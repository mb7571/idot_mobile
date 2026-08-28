import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { transporterAPI, favoriteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TransporterProfileScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [transporter, setTransporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadTransporter();
    checkFavorite();
  }, [id]);

  const loadTransporter = async () => {
    try {
      const response = await transporterAPI.getProfile(id);
      setTransporter(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transporter profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoriteAPI.check(id);
      setIsFavorited(response.data.data.is_favorited);
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await favoriteAPI.remove(id);
        setIsFavorited(false);
      } else {
        await favoriteAPI.add(id);
        setIsFavorited(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const handleServiceRequest = () => {
    navigation.navigate('ServiceRequest', { transporterProfileId: id, transporterName: transporter.business_name });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!transporter) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Transporter not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.businessName}>{transporter.business_name}</Text>
            <Text style={styles.registrationType}>{transporter.business_type?.name || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.favoriteBtn} onPress={toggleFavorite}>
            <Text style={styles.favoriteIcon}>{isFavorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusBadge}>
          <View style={[styles.badge, styles.badgeVerified]}>
            <Text style={styles.badgeText}>✓ Verified</Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact Person</Text>
          <Text style={styles.infoValue}>{transporter.contact_person_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile</Text>
          <Text style={styles.infoValue}>📞 {transporter.mobile}</Text>
        </View>
        {transporter.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>📧 {transporter.email}</Text>
          </View>
        )}
      </View>

      {/* Business Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Location</Text>
        <Text style={styles.addressText}>📍 {transporter.business_location_address}</Text>
        {transporter.business_city && (
          <Text style={styles.locationDetail}>🏙️ {transporter.business_city}{transporter.business_state ? `, ${transporter.business_state}` : ''}</Text>
        )}
        {transporter.business_pincode && (
          <Text style={styles.locationDetail}>📮 {transporter.business_pincode}</Text>
        )}
      </View>

      {/* Service Location & Radius */}
      {transporter.service_location_address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Area</Text>
          <Text style={styles.addressText}>📍 {transporter.service_location_address}</Text>
          {transporter.radius_option && (
            <Text style={styles.locationDetail}>📐 Service Radius: {transporter.radius_option.label}</Text>
          )}
        </View>
      )}

      {/* Fleet Information */}
      {transporter.fleet && transporter.fleet.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fleet Information</Text>
          {transporter.fleet.map((vehicle, index) => (
            <View key={index} style={styles.fleetCard}>
              <Text style={styles.fleetName}>{vehicle.vehicle_name || vehicle.vehicle_type?.name || 'Vehicle'}</Text>
              {vehicle.vehicle_number && (
                <Text style={styles.fleetDetail}>🔢 {vehicle.vehicle_number}</Text>
              )}
              <Text style={styles.fleetDetail}>📦 Type: {vehicle.vehicle_type?.name || 'N/A'}</Text>
              {vehicle.capacity_weight && (
                <Text style={styles.fleetDetail}>⚖️ Capacity: {vehicle.capacity_weight} tons</Text>
              )}
              {vehicle.capacity_volume && (
                <Text style={styles.fleetDetail}>📐 Volume: {vehicle.capacity_volume}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {transporter.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{transporter.description}</Text>
        </View>
      )}

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.serviceRequestBtn} onPress={handleServiceRequest}>
          <Text style={styles.serviceRequestBtnText}>Submit Service Request</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  registrationType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  favoriteBtn: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  statusBadge: {
    marginTop: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeVerified: {
    backgroundColor: '#D1FAE5',
  },
  badgeText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  locationDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  fleetCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  fleetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  fleetDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionSection: {
    padding: 16,
  },
  serviceRequestBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  serviceRequestBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransporterProfileScreen;
