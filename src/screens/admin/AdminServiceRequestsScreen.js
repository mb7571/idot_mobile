import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { adminAPI } from '../../services/api';

const AdminServiceRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await adminAPI.getServiceRequests({ page: pageNum, per_page: 20 });
      const data = response.data.data;

      if (pageNum === 1) {
        setRequests(data.data);
      } else {
        setRequests((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.current_page < data.last_page);
      setPage(data.current_page);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
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

  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.id}>#{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.parties}>
        <Text style={styles.party}>Customer: {item.user?.name || 'N/A'}</Text>
        <Text style={styles.party}>Transporter: {item.transporter_profile?.business_name || 'N/A'}</Text>
      </View>

      <View style={styles.route}>
        <Text style={styles.routeText}>📍 {item.from_location_address} → {item.to_location_address}</Text>
      </View>

      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (!loading && hasMore) loadRequests(page + 1);
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No service requests</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#1E40AF" style={styles.loader} /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  list: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  id: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  parties: { marginBottom: 8 },
  party: { fontSize: 14, color: '#374151', marginBottom: 4 },
  route: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginBottom: 8 },
  routeText: { fontSize: 13, color: '#4B5563' },
  date: { fontSize: 12, color: '#9CA3AF' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#6B7280' },
  loader: { marginVertical: 16 },
});

export default AdminServiceRequestsScreen;
