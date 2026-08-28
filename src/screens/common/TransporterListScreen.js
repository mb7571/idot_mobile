import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { transporterAPI, favoriteAPI } from '../../services/api';

const TransporterListScreen = ({ route, navigation }) => {
  const { searchParams } = route.params || {};
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadTransporters();
    loadFavorites();
  }, []);

  const loadTransporters = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await transporterAPI.search({
        ...searchParams,
        page: pageNum,
        per_page: 20,
      });
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

  const loadFavorites = async () => {
    try {
      const response = await favoriteAPI.list();
      const favIds = new Set(response.data.data.map((f) => f.transporter_profile_id));
      setFavorites(favIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const toggleFavorite = async (transporterId) => {
    try {
      if (favorites.has(transporterId)) {
        await favoriteAPI.remove(transporterId);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(transporterId);
          return next;
        });
      } else {
        await favoriteAPI.add(transporterId);
        setFavorites((prev) => new Set(prev).add(transporterId));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const renderTransporter = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TransporterProfile', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.businessName}>{item.business_name}</Text>
          <Text style={styles.registrationType}>{item.business_type?.name || 'N/A'}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={styles.favoriteIcon}>
            {favorites.has(item.id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>📍 {item.business_location_address || 'Location not set'}</Text>
        {item.business_city && (
          <Text style={styles.detailText}>🏙️ {item.business_city}</Text>
        )}
        {item.fleet && item.fleet.length > 0 && (
          <Text style={styles.detailText}>
            🚛 {item.fleet.length} vehicle(s) available
          </Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.contactText}>📞 {item.mobile}</Text>
        <Text style={styles.viewMore}>View Details ›</Text>
      </View>
    </TouchableOpacity>
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTransporters(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transporters}
        renderItem={renderTransporter}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No transporters found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search filters</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color="#2563EB" style={styles.loader} />
          ) : null
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  registrationType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
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

export default TransporterListScreen;
