import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { serviceRequestAPI } from '../../services/api';

const MyRequestsScreen = ({ navigation }) => {
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
      const response = await serviceRequestAPI.myRequests({ page: pageNum, per_page: 20 });
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
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RequestDetail', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.transporterName}>{item.transporter_profile?.business_name || 'Transporter'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <Text style={styles.routeText}>📍 {item.from_location_address}</Text>
        <Text style={styles.routeArrow}>↓</Text>
        <Text style={styles.routeText}>📍 {item.to_location_address}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <Text style={styles.viewMore}>View Details ›</Text>
      </View>
    </TouchableOpacity>
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
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No requests yet</Text>
              <Text style={styles.emptySubtext}>Submit a service request to get started</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#2563EB" style={styles.loader} /> : null
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
  transporterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  routeArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewMore: {
    fontSize: 14,
    color: '#2563EB',
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
  },
  loader: {
    marginVertical: 16,
  },
});

export default MyRequestsScreen;
