import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { adminAPI } from '../../services/api';

const AdminTransportersScreen = ({ navigation }) => {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTransporters();
  }, [statusFilter]);

  const loadTransporters = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = { page: pageNum, per_page: 20 };
      if (searchQuery) params.query = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const response = await adminAPI.getTransporters(params);
      const data = response.data.data;

      if (pageNum === 1) {
        setTransporters(data.data);
      } else {
        setTransporters((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.current_page < data.last_page);
      setPage(data.current_page);
    } catch (error) {
      console.error('Failed to load transporters:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyTransporter = (id, action) => {
    Alert.alert(
      action === 'verified' ? 'Verify Transporter' : 'Reject Transporter',
      `Are you sure you want to ${action} this transporter?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await adminAPI.verifyTransporter(id, { status: action });
              Alert.alert('Success', `Transporter ${action}`);
              loadTransporters();
            } catch (error) {
              Alert.alert('Error', 'Failed to update transporter');
            }
          },
        },
      ]
    );
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await adminAPI.toggleTransporterStatus(id, { status: newStatus });
      loadTransporters();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: '#F59E0B', verified: '#10B981', rejected: '#EF4444' };
    return colors[status] || '#6B7280';
  };

  const renderTransporter = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.businessName}>{item.business_name}</Text>
          <Text style={styles.contactName}>{item.contact_person_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.verification_status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.verification_status) }]}>
            {item.verification_status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>📱 {item.mobile}</Text>
        {item.email && <Text style={styles.detailText}>📧 {item.email}</Text>}
        <Text style={styles.detailText}>📍 {item.business_city || item.business_location_address}</Text>
      </View>

      <View style={styles.actions}>
        {item.verification_status === 'pending' && (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => verifyTransporter(item.id, 'verified')}>
              <Text style={styles.verifyText}>✓ Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnReject} onPress={() => verifyTransporter(item.id, 'rejected')}>
              <Text style={styles.rejectText}>✗ Reject</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: item.status === 'active' ? '#FEF3C7' : '#D1FAE5' }]}
          onPress={() => toggleStatus(item.id, item.status)}
        >
          <Text style={{ color: item.status === 'active' ? '#92400E' : '#065F46', fontSize: 13 }}>
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transporters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => loadTransporters()}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.filterBar}>
        {['', 'pending', 'verified', 'rejected'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipSelected]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterText, statusFilter === status && styles.filterTextSelected]}>
              {status || 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transporters}
        renderItem={renderTransporter}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (!loading && hasMore) loadTransporters(page + 1);
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transporters found</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchBar: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
  },
  filterTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  details: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
  },
  actionBtnReject: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  verifyText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '500',
  },
  rejectText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loader: {
    marginVertical: 16,
  },
});

export default AdminTransportersScreen;
