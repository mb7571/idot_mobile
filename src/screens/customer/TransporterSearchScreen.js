import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { mastersAPI, transporterAPI } from '../../api';
import { LoadingSpinner } from '../../components/SharedComponents';
import LocationAutocomplete from '../../components/LocationAutocomplete';

const TransporterSearchScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(true);

  // Search filters
  const [query, setQuery] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);

  // Master data
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const vtRes = await mastersAPI.getVehicleTypes();
      setVehicleTypes(vtRes.data.data || vtRes.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingMasters(false);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedVehicleType(null);
    setFromLocation(null);
    setToLocation(null);
  };

  const handleSearch = async () => {
    // Build params matching backend API
    const params = {};

    // Backend uses 'query' for text search (matches business_name, contact_person_name, mobile, etc.)
    if (query.trim()) params.query = query.trim();

    if (selectedVehicleType) params.vehicle_type_id = selectedVehicleType.id;

    // From location - backend resolves master city from text, or uses coordinates
    if (fromLocation?.description) params.from_location = fromLocation.description;

    // To location - backend resolves master city from text, or uses coordinates
    if (toLocation?.description) params.to_location = toLocation.description;

    // Per-side coordinates from autocomplete so backend can apply the
    // admin-configured service radius around FROM / TO service cities
    if (fromLocation?.latitude && fromLocation?.longitude) {
      params.from_latitude = fromLocation.latitude;
      params.from_longitude = fromLocation.longitude;
    }
    if (toLocation?.latitude && toLocation?.longitude) {
      params.to_latitude = toLocation.latitude;
      params.to_longitude = toLocation.longitude;
    }

    setLoading(true);
    try {
      const response = await transporterAPI.search(params);

      // Backend returns paginated data: { success: true, data: { current_page, data: [...], total, ... } }
      const responseData = response.data;
      let results = [];

      if (responseData?.data?.data) {
        // Paginated response: response.data.data is the paginator, .data is the items array
        results = responseData.data.data;
      } else if (Array.isArray(responseData?.data)) {
        // Direct array response
        results = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Response is directly an array
        results = responseData;
      }

      // isSearch flag tells the list screen this came from an actual search,
      // so even an EMPTY result must show "not found" instead of all transporters
      navigation.navigate('TransporterList', { results, isSearch: true });
    } catch (error) {
      const msg = error.response?.data?.message || 'Search failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMasters) {
    return <LoadingSpinner />;
  }

  const hasFilters = query || selectedVehicleType || fromLocation || toLocation;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form card overlapping the header */}
        <View style={styles.formCard}>
          {/* General search query - matches business name, contact, mobile, city, etc. */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔍 Keyword</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Name, mobile, business, or city..."
                placeholderTextColor={COLORS.placeholder}
                value={query}
                onChangeText={setQuery}
                returnKeyType="next"
              />
              {query.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Vehicle Type - quick select chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🚚 Vehicle Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              nestedScrollEnabled
            >
              <TouchableOpacity
                style={[styles.chip, !selectedVehicleType && styles.chipActive]}
                onPress={() => setSelectedVehicleType(null)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    !selectedVehicleType && styles.chipTextActive,
                  ]}
                >
                  All Types
                </Text>
              </TouchableOpacity>
              {vehicleTypes.map((vt) => {
                const active = selectedVehicleType?.id === vt.id;
                return (
                  <TouchableOpacity
                    key={vt.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSelectedVehicleType(active ? null : vt)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {vt.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* From Location with Google Places Autocomplete */}
          <LocationAutocomplete
            label="📍 From Location (Origin)"
            placeholder="Search origin location..."
            onSelect={setFromLocation}
            value={fromLocation?.description}
          />

          {/* To Location with Google Places Autocomplete */}
          <LocationAutocomplete
            label="🏁 To Location (Destination)"
            placeholder="Search destination location..."
            onSelect={setToLocation}
            value={toLocation?.description}
          />

          {/* Route preview line */}
          {(fromLocation?.description || toLocation?.description) && (
            <View style={styles.routePreview}>
              <Text style={styles.routePreviewText} numberOfLines={2}>
                {fromLocation?.description || 'Anywhere'}
                {'  →  '}
                {toLocation?.description || 'Anywhere'}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={resetFilters}
              disabled={!hasFilters || loading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resetBtnText,
                  (!hasFilters || loading) && styles.resetBtnTextDisabled,
                ]}
              >
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563EB', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.searchBtnGradient}
              >
                {loading ? (
                  <Text style={styles.searchBtnText}>Searching…</Text>
                ) : (
                  <Text style={styles.searchBtnText}>🔍 Search Transporters</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Scroll + form card
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  // Inputs
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 38,
    height: 48,
    fontSize: 15,
    color: COLORS.text,
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    top: 14,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: { fontSize: 11, color: COLORS.gray600, fontWeight: '700' },

  // Vehicle chips
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: { color: COLORS.primaryDark },

  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 16,
  },

  // Route preview
  routePreview: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  routePreviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  resetBtn: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  resetBtnTextDisabled: { color: COLORS.gray300 },
  searchBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  searchBtnDisabled: { opacity: 0.7 },
  searchBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 14,
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default TransporterSearchScreen;
