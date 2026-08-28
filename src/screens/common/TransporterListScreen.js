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
      // Silent fail
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
      // Silent fail
    }
  };

  const renderTransporter = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TransporterProfile', { id: item.id })}
      activeOpacity={0.7}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.business_name?.charAt(0) || 'T'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.businessName} numberOfLines={1}>{item.business_name}</Text>
          <Text style={styles.registrationType}>{item.business_type?.name || 'Transporter'}</Text>
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

      {/* Card Details */}
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {item.business_location_address || 'Location not set'}
          </Text>
        </View>
        {item.business_city && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏙️</Text>
            <Text style={styles.detailText}>{item.business_city}</Text>
          </View>
        )}
        {item.fleet && item.fleet.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🚛</Text>
            <Text style={styles.detailText}>{item.fleet.length} vehicle(s) available</Text>
          </View>
        )}
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.contactBadge}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={styles.contactText}>{item.mobile}</Text>
        </View>
        <View style={styles.viewBadge}>
          <Text style={styles.viewText}>View Details</Text>
          <Text style={styles.viewArrow}>›</Text>
        </View>
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
              <Text style={styles.emptyTitle}>No transporters found</Text>
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
    backgroundColor: '#F1F5F9',
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  registrationType: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  cardDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  contactIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginRight: 4,
  },
  viewArrow: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
  },
  loader: {
    marginVertical: 16,
  },
});

export default TransporterListScreen;
