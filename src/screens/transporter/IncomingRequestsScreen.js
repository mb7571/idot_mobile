import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../styles/colors';
import { serviceRequestAPI } from '../../api';
import { StatusBadge, EmptyState, LoadingSpinner } from '../../components/SharedComponents';
import { getStatusInfo, formatDate } from '../../utils/helpers';

const IncomingRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, []),
  );

  const loadRequests = async () => {
    try {
      const response = await serviceRequestAPI.incomingRequests({});
      const data = response.data.data;
      setRequests(data?.data || data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const renderRequest = ({ item }) => {
    const customer = item.user || item.customer || {};
    const vt = item.vehicle_type;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
        activeOpacity={0.7}
      >
        {/* ID strip */}
        <LinearGradient
          colors={['#059669', '#047857']}
          style={styles.idStrip}
        >
          <Text style={styles.requestId}>Request #{item.id}</Text>
          {item.status && <StatusBadge info={getStatusInfo(item.status)} />}
        </LinearGradient>

        <View style={styles.cardBody}>
          {/* Customer */}
          {(customer.name || customer.mobile) && (
            <View style={styles.customerRow}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>
                  {(customer.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.customerInfo}>
                {customer.name && (
                  <Text style={styles.customerName} numberOfLines={1}>
                    {customer.name}
                  </Text>
                )}
                {customer.mobile && (
                  <Text style={styles.customerMobile}>📱 {customer.mobile}</Text>
                )}
              </View>
            </View>
          )}

          {/* Route */}
          <View style={styles.routeRow}>
            <View style={styles.routeChip}>
              <Text style={styles.routeChipLabel}>🟢</Text>
              <Text style={styles.routeChipValue} numberOfLines={1}>
                {item.from_location_address || '—'}
              </Text>
            </View>
            <Text style={styles.routeArrow}>→</Text>
            <View style={styles.routeChip}>
              <Text style={styles.routeChipLabel}>🔴</Text>
              <Text style={styles.routeChipValue} numberOfLines={1}>
                {item.to_location_address || '—'}
              </Text>
            </View>
          </View>

          {/* Footer meta */}
          <View style={styles.cardFooter}>
            {vt?.name && <Text style={styles.footerInfo}>📦 {vt.name}</Text>}
            {item.preferred_date && (
              <Text style={styles.footerInfo}>📅 {formatDate(item.preferred_date)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={requests}
      renderItem={renderRequest}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <EmptyState
          icon="📥"
          title="No Incoming Requests"
          message="You don't have any incoming service requests yet."
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  idStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  requestId: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardBody: {
    padding: 14,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  customerInfo: { flex: 1 },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  customerMobile: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  routeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F4FF',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  routeChipLabel: { fontSize: 11 },
  routeChipValue: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.text,
  },
  routeArrow: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 10,
  },
  footerInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default IncomingRequestsScreen;
