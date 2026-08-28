import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { favoriteAPI } from '../../services/api';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteAPI.list();
      setFavorites(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (transporterId) => {
    Alert.alert('Remove Favorite', 'Are you sure you want to remove this transporter from favorites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await favoriteAPI.remove(transporterId);
            setFavorites((prev) => prev.filter((f) => f.transporter_profile_id !== transporterId));
          } catch (error) {
            Alert.alert('Error', 'Failed to remove favorite');
          }
        },
      },
    ]);
  };

  const renderFavorite = ({ item }) => {
    const profile = item.transporter_profile;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TransporterProfile', { id: profile.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.businessName}>{profile.business_name}</Text>
            <Text style={styles.registrationType}>{profile.business_type?.name || 'N/A'}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeFavorite(profile.id)}
          >
            <Text style={styles.removeBtnText}>❤️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardDetails}>
          <Text style={styles.detailText}>📍 {profile.business_location_address || 'Location not set'}</Text>
          {profile.business_city && (
            <Text style={styles.detailText}>🏙️ {profile.business_city}</Text>
          )}
          <Text style={styles.detailText}>📞 {profile.mobile}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.addedOn}>Added {new Date(item.created_at).toLocaleDateString()}</Text>
          <Text style={styles.viewMore}>View Profile ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Add transporters to your favorites list</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  removeBtn: {
    padding: 8,
  },
  removeBtnText: {
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
  addedOn: {
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
});

export default FavoritesScreen;
