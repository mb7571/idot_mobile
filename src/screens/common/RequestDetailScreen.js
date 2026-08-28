import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { serviceRequestAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RequestDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      const response = await serviceRequestAPI.getDetails(id);
      setRequest(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    const messages = {
      accepted: 'Accept this service request?',
      declined: 'Decline this service request?',
      completed: 'Mark this request as completed?',
      cancelled: 'Cancel this service request?',
    };

    Alert.alert('Confirm', messages[status], [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setUpdating(true);
          try {
            await serviceRequestAPI.updateStatus(id, { status });
            Alert.alert('Success', 'Request status updated');
            loadRequest();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      accepted: '#10B981',
      declined: '#EF4444',
      completed: '#2563EB',
      cancelled: '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Request not found</Text>
      </View>
    );
  }

  const isTransporter = user?.role === 'transporter';
  const isRequester = request.user_id === user?.id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.requestTitle}>Service Request #{request.id}</Text>
        <Text style={styles.dateText}>Created: {new Date(request.created_at).toLocaleString()}</Text>
      </View>

      {/* Transporter Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transporter</Text>
        <Text style={styles.infoText}>{request.transporter_profile?.business_name || 'N/A'}</Text>
        <Text style={styles.infoSubtext}>{request.transporter_profile?.business_type?.name || ''}</Text>
      </View>

      {/* Requester Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requested By</Text>
        <Text style={styles.infoText}>{request.user?.name || 'N/A'}</Text>
        <Text style={styles.infoSubtext}>{request.user?.mobile || ''}</Text>
      </View>

      {/* Route Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Route</Text>
        <View style={styles.routeCard}>
          <View style={styles.routeItem}>
            <Text style={styles.routeLabel}>From</Text>
            <Text style={styles.routeText}>📍 {request.from_location_address}</Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeItem}>
            <Text style={styles.routeLabel}>To</Text>
            <Text style={styles.routeText}>📍 {request.to_location_address}</Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        {request.vehicle_type && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle Type</Text>
            <Text style={styles.detailValue}>🚛 {request.vehicle_type.name}</Text>
          </View>
        )}
        {request.estimated_weight && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Weight</Text>
            <Text style={styles.detailValue}>⚖️ {request.estimated_weight} tons</Text>
          </View>
        )}
        {request.preferred_date && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Preferred Date</Text>
            <Text style={styles.detailValue}>📅 {request.preferred_date}</Text>
          </View>
        )}
        {request.preferred_time && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Preferred Time</Text>
            <Text style={styles.detailValue}>🕐 {request.preferred_time}</Text>
          </View>
        )}
        {request.message && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Message</Text>
            <Text style={styles.detailValue}>{request.message}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {request.status === 'pending' && (
        <View style={styles.actionSection}>
          {isTransporter && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => updateStatus('accepted')}
                disabled={updating}
              >
                <Text style={styles.acceptBtnText}>Accept Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.declineBtn]}
                onPress={() => updateStatus('declined')}
                disabled={updating}
              >
                <Text style={styles.declineBtnText}>Decline Request</Text>
              </TouchableOpacity>
            </>
          )}
          {isRequester && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => updateStatus('cancelled')}
              disabled={updating}
            >
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {request.status === 'accepted' && isRequester && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => updateStatus('completed')}
            disabled={updating}
          >
            <Text style={styles.completeBtnText}>Mark as Completed</Text>
          </TouchableOpacity>
        </View>
      )}

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
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
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
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  routeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  routeItem: {
    paddingVertical: 8,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  declineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  declineBtnText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  completeBtn: {
    backgroundColor: '#2563EB',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RequestDetailScreen;
