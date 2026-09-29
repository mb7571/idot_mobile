import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../styles/colors';
import { favoriteAPI } from '../../api';
import { EmptyState, LoadingSpinner, StatusBadge } from '../../components/SharedComponents';
import { getStatusInfo, getLogoUrl } from '../../utils/helpers';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const loadFavorites = async () => {
    try {
      const response = await favoriteAPI.list();
      setFavorites(response.data.data || response.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const removeFavorite = (t, favoriteRowId) => {
    Alert.alert(
      'Remove Favorite',
      `Remove ${t.business_name || 'this transporter'} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(favoriteRowId);
            try {
              await favoriteAPI.remove(t.id || favoriteRowId);
              setFavorites((prev) =>
                prev.filter((f) => f.id !== favoriteRowId),
              );
            } catch {
              Alert.alert('Error', 'Failed to remove favorite.');
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
    );
  };

  const getVehicleTypeNames = (t) => {
    const fleet = t.fleet || [];
    const types = new Set();
    fleet.forEach((f) => {
      if (Array.isArray(f.vehicle_types)) {
        f.vehicle_types.forEach((vt) => types.add(vt.name));
      }
      if (f.vehicle_type?.name) types.add(f.vehicle_type.name);
    });
    return types.size > 0 ? Array.from(types).join(', ') : null;
  };

  const filtered = favorites.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const t = f.transporter_profile || f;
    return (
      (t.business_name || '').toLowerCase().includes(q) ||
      (t.contact_person_name || '').toLowerCase().includes(q) ||
      (t.business_city || '').toLowerCase().includes(q) ||
      (t.business_type?.name || '').toLowerCase().includes(q)
    );
  });

  const renderFavorite = ({ item }) => {
    const t = item.transporter_profile || item;
    const logoUrl = getLogoUrl(t.logo);
    const initials = (t.business_name || 'N/A')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    const vehicleTypes = getVehicleTypeNames(t);
    const isRemoving = removingId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() =>
            navigation.navigate('TransporterProfile', {
              transporterId: t.id || item.transporter_profile_id,
            })
          }
          activeOpacity={0.7}
        >
          {/* Avatar */}
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={['#2563EB', '#7C3AED']}
              style={styles.logoPlaceholder}
            >
              <Text style={styles.logoInitials}>{initials}</Text>
            </LinearGradient>
          )}

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.businessName} numberOfLines={1}>
              {t.business_name || 'N/A'}
            </Text>
            {t.business_type?.name && (
              <Text style={styles.businessType}>{t.business_type.name}</Text>
            )}
            <View style={styles.metaRow}>
              {vehicleTypes && (
                <Text style={styles.metaText} numberOfLines={1}>
                  🚛 {vehicleTypes}
                </Text>
              )}
            </View>
            {(t.business_city || t.business_location_address) && (
              <Text style={styles.locationText} numberOfLines={1}>
                📍 {[t.business_location_address, t.business_city].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>

          {/* Right column */}
          <View style={styles.rightCol}>
            {t.verification_status && (
              <StatusBadge info={getStatusInfo(t.verification_status)} />
            )}
            <Text style={styles.star}>⭐</Text>
          </View>
        </TouchableOpacity>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() =>
              navigation.navigate('TransporterProfile', {
                transporterId: t.id || item.transporter_profile_id,
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.profileBtnText}>View Profile →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeFavorite(t, item.id)}
            disabled={isRemoving}
            activeOpacity={0.7}
          >
            <Text style={styles.removeBtnText}>
              {isRemoving ? 'Removing…' : '🗑️ Remove'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={[styles.searchBar, styles.searchBarTop]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
          placeholderTextColor={COLORS.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderFavorite}
        keyExtractor={(item, index) => String(item.id || item.transporter_profile_id || index)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          searchQuery.trim() ? (
            <EmptyState
              icon="🔍"
              title="No Matches"
              message={`No favorites match "${searchQuery}"`}
            />
          ) : (
            <EmptyState
              icon="⭐"
              title="No Favorites Yet"
              message="Add transporters to your favorites from their profile"
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarTop: {
    marginTop: 14,
  },
  searchIcon: { fontSize: 15, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  clearBtn: {
    fontSize: 15,
    color: COLORS.textSecondary,
    paddingHorizontal: 4,
  },

  // List
  list: {
    padding: 16,
    paddingBottom: 24,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTouchable: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: COLORS.gray100,
  },
  logoPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 14,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.white,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  businessType: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  star: {
    fontSize: 18,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  profileBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
  },
  profileBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  removeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray100,
  },
  removeBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.danger,
  },
});

export default FavoritesScreen;
