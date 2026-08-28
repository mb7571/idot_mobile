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

const AdminCustomersScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = { page: pageNum, per_page: 20 };
      if (searchQuery) params.query = searchQuery;

      const response = await adminAPI.getCustomers(params);
      const data = response.data.data;

      if (pageNum === 1) {
        setCustomers(data.data);
      } else {
        setCustomers((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.current_page < data.last_page);
      setPage(data.current_page);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await adminAPI.toggleCustomerStatus(id, { status: newStatus });
      loadCustomers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const deleteCustomer = (id) => {
    Alert.alert('Delete Customer', 'Are you sure you want to delete this customer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminAPI.deleteCustomer(id);
            loadCustomers();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete customer');
          }
        },
      },
    ]);
  };

  const renderCustomer = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.mobile}>📱 {item.mobile}</Text>
          {item.email && <Text style={styles.email}>📧 {item.email}</Text>}
        </View>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.statusText, item.status === 'active' ? styles.textActive : styles.textInactive]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>Joined: {new Date(item.created_at).toLocaleDateString()}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, item.status === 'active' ? styles.deactivateBtn : styles.activateBtn]}
          onPress={() => toggleStatus(item.id, item.status)}
        >
          <Text style={item.status === 'active' ? styles.deactivateText : styles.activateText}>
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCustomer(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => loadCustomers()}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onEndReached={() => {
          if (!loading && hasMore) loadCustomers(page + 1);
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No customers found</Text>
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mobile: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  email: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
  },
  badgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textActive: {
    color: '#065F46',
  },
  textInactive: {
    color: '#6B7280',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deactivateBtn: {
    backgroundColor: '#FEF3C7',
  },
  activateBtn: {
    backgroundColor: '#D1FAE5',
  },
  deactivateText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
  },
  activateText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
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

export default AdminCustomersScreen;
