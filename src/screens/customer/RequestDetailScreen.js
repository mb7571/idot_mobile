import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { serviceRequestAPI } from '../../api';
import { StatusBadge, LoadingSpinner } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { getStatusInfo, formatDate, formatDateTime } from '../../utils/helpers';

const RequestDetailScreen = ({ route }) => {
  const { requestId } = route.params;
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadRequest = useCallback(async () => {
    try {
      const response = await serviceRequestAPI.getDetails(requestId);
      setRequest(response.data.data || response.data);
    } catch {
      Alert.alert('Error', 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequest();
    setRefreshing(false);
  };

  const openDialer = (mobile) => {
    if (!mobile) return;
    Linking.openURL(`tel:${mobile}`).catch(() =>
      Alert.alert('Error', 'Could not open the dialer.'),
    );
  };

  const openEmail = (email) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() =>
      Alert.alert('Error', 'Could not open the mail app.'),
    );
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      await serviceRequestAPI.updateStatus(requestId, { status });
      await loadRequest();
      Alert.alert('Success', `Request ${status}.`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update status.';
      Alert.alert('Error', msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return null;

  const tp = request.transporter_profile || {};
  const customer = request.user || {};
  const vt = request.vehicle_type;

  // Relationship of the logged-in user to THIS request — decides the UI.
  // A transporter can also be a requester (request they sent to another
  // transporter), so the global role alone is not enough.
  const isRequester = !!user && request.user?.id === user.id;
  const isRecipient = !!user && !isRequester && tp.user_id === user.id;

  const shipmentRows = [
    { label: 'Vehicle Type', value: vt?.name, icon: '🚛' },
    { label: 'Preferred Date', value: request.preferred_date ? formatDate(request.preferred_date) : null, icon: '📅' },
    { label: 'Preferred Time', value: request.preferred_time, icon: '⏰' },
    { label: 'Est. Weight', value: request.estimated_weight ? `${request.estimated_weight} kg` : null, icon: '⚖️' },
  ].filter((r) => r.value);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Status hero */}
      <LinearGradient colors={['#2563EB', '#1E40AF']} style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.heroId}>Request #{request.id}</Text>
          {request.status && (
            <StatusBadge info={getStatusInfo(request.status)} />
          )}
        </View>
        <Text style={styles.heroDate}>
          Created {formatDateTime(request.created_at)}
        </Text>
      </LinearGradient>

      {/* Route card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🧭</Text>
          <Text style={styles.cardTitle}>Route</Text>
        </View>

        <View style={styles.routeBox}>
          <View style={styles.routeSide}>
            <Text style={styles.routeSideLabel}>🟢 FROM</Text>
            <Text style={styles.routeSideValue}>
              {request.from_location_address || '—'}
            </Text>
            {request.from_latitude && request.from_longitude && (
              <Text style={styles.routeCoords}>
                {Number(request.from_latitude).toFixed(4)},{' '}
                {Number(request.from_longitude).toFixed(4)}
              </Text>
            )}
          </View>
          <Text style={styles.routeArrow}>→</Text>
          <View style={styles.routeSide}>
            <Text style={styles.routeSideLabelTo}>🔴 TO</Text>
            <Text style={styles.routeSideValue}>
              {request.to_location_address || '—'}
            </Text>
            {request.to_latitude && request.to_longitude && (
              <Text style={styles.routeCoords}>
                {Number(request.to_latitude).toFixed(4)},{' '}
                {Number(request.to_longitude).toFixed(4)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Shipment card */}
      {shipmentRows.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={styles.cardTitle}>Shipment Details</Text>
          </View>
          {shipmentRows.map((row, i) => (
            <View
              key={row.label}
              style={[styles.infoRow, i === shipmentRows.length - 1 && styles.infoRowLast]}
            >
              <Text style={styles.infoLabel}>{row.icon} {row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Message card */}
      {request.message ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={styles.cardTitle}>Message</Text>
          </View>
          <Text style={styles.messageText}>{request.message}</Text>
        </View>
      ) : null}

      {/* Counterparty card — based on relationship to this request */}
      {isRecipient ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Customer Details</Text>
          </View>
          {customer.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Name</Text>
              <Text style={styles.infoValue}>{customer.name}</Text>
            </View>
          )}
          {customer.mobile && (
            <TouchableOpacity
              style={styles.infoRowAction}
              onPress={() => openDialer(customer.mobile)}
              activeOpacity={0.6}
            >
              <Text style={styles.infoLabel}>📱 Mobile</Text>
              <View style={styles.infoValueAction}>
                <Text style={[styles.infoValue, styles.linkValue]}>
                  {customer.mobile}
                </Text>
                <Text style={styles.callIcon}>📞</Text>
              </View>
            </TouchableOpacity>
          )}
          {customer.email && (
            <TouchableOpacity
              style={styles.infoRowLast}
              onPress={() => openEmail(customer.email)}
              activeOpacity={0.6}
            >
              <Text style={styles.infoLabel}>✉️ Email</Text>
              <Text style={[styles.infoValue, styles.linkValue]} numberOfLines={1}>
                {customer.email}
              </Text>
            </TouchableOpacity>
          )}
          {!customer.name && !customer.mobile && !customer.email && (
            <Text style={styles.emptyText}>Customer information unavailable</Text>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🚛</Text>
            <Text style={styles.cardTitle}>Transporter Details</Text>
          </View>
          {tp.business_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏢 Business</Text>
              <Text style={styles.infoValue}>{tp.business_name}</Text>
            </View>
          )}
          {tp.business_type?.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏷️ Type</Text>
              <Text style={styles.infoValue}>{tp.business_type.name}</Text>
            </View>
          )}
          {tp.contact_person_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Contact</Text>
              <Text style={styles.infoValue}>{tp.contact_person_name}</Text>
            </View>
          )}
          {tp.mobile && (
            <TouchableOpacity
              style={styles.infoRowAction}
              onPress={() => openDialer(tp.mobile)}
              activeOpacity={0.6}
            >
              <Text style={styles.infoLabel}>📱 Mobile</Text>
              <View style={styles.infoValueAction}>
                <Text style={[styles.infoValue, styles.linkValue]}>
                  {tp.mobile}
                </Text>
                <Text style={styles.callIcon}>📞</Text>
              </View>
            </TouchableOpacity>
          )}
          {(tp.business_location_address || tp.business_city) && (
            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>📍 Location</Text>
              <Text style={styles.infoValue}>
                {[tp.business_location_address, tp.business_city, tp.business_state]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          )}
          {!tp.business_name && !tp.mobile && (
            <Text style={styles.emptyText}>Transporter information unavailable</Text>
          )}
        </View>
      )}

      {/* Status note / timeline */}
      {(request.status_note || request.responded_at) && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🕒</Text>
            <Text style={styles.cardTitle}>Status History</Text>
          </View>
          {request.responded_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Responded</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(request.responded_at)}
              </Text>
            </View>
          )}
          {request.status_note && (
            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>Note</Text>
              <Text style={styles.infoValue}>{request.status_note}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions — based on relationship to this request, matching backend rules */}
      {isRecipient && request.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleStatusUpdate('accepted')}
            disabled={updating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionText}>
                {updating ? '…' : '✓ Accept Request'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleStatusUpdate('declined')}
            disabled={updating}
            activeOpacity={0.8}
          >
            <Text style={styles.declineText}>✕ Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {isRequester && request.status === 'pending' && (
        <TouchableOpacity
          style={styles.declineBtnFull}
          onPress={() => handleStatusUpdate('cancelled')}
          disabled={updating}
          activeOpacity={0.8}
        >
          <Text style={styles.declineText}>Cancel Request</Text>
        </TouchableOpacity>
      )}

      {isRequester && request.status === 'accepted' && (
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleStatusUpdate('completed')}
          disabled={updating}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.actionGradient}
          >
            <Text style={styles.actionText}>
              {updating ? '…' : '✓ Mark as Completed'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  content: { padding: 16, paddingBottom: 32 },

  // Hero
  hero: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroId: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  heroDate: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  // Cards
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
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
  cardIcon: { fontSize: 17 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },

  // Route
  routeBox: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  routeSide: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  routeSideLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  routeSideLabelTo: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  routeSideValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  routeCoords: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 3,
  },
  routeArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    textAlignVertical: 'center',
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  infoRowAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  infoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  infoValueAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  linkValue: { color: COLORS.primary },
  callIcon: { fontSize: 15 },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 12,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Actions
  actions: { gap: 10, marginTop: 4 },
  acceptBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 14,
  },
  actionText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  declineBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  declineBtnFull: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: 4,
  },
  declineText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },
});

export default RequestDetailScreen;
