import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { API_URL } from '../config/api';
import { COLORS } from '../styles/colors';
import MapLocationPicker from './MapLocationPicker';

// ── Backend proxy for Google APIs (device can't reach google directly) ──
const searchPlaces = async (query) => {
  if (!query || query.length < 2) return { results: [], error: null };
  try {
    const url =
      `${API_URL}/maps/autocomplete` +
      `?input=${encodeURIComponent(query)}` +
      `&components=country:in` +
      `&language=en`;

    console.log('[Autocomplete] Searching:', query, 'via', url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    console.log('[Autocomplete] API status:', data.status, 'count:', data.predictions?.length || 0);

    if (data.status === 'OK' && data.predictions) {
      return {
        results: data.predictions.map((p) => ({
          id: p.place_id,
          description: p.description,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || '',
          place_id: p.place_id,
        })),
        error: null,
      };
    }
    return {
      results: [],
      error: data.error_message || `API returned: ${data.status}`,
    };
  } catch (err) {
    console.log('[Autocomplete] fetch error:', err?.name, err?.message);
    if (err?.name === 'AbortError') {
      return { results: [], error: 'Request timed out. Check your connection to the server.' };
    }
    return { results: [], error: `Network error: ${err?.message}` };
  }
};

// ── Get place details via backend proxy ──────────────────────────────────
const getPlaceDetails = async (placeId) => {
  try {
    const url =
      `${API_URL}/maps/place-details` +
      `?place_id=${placeId}` +
      `&fields=geometry,formatted_address`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();

    if (data.status === 'OK' && data.result) {
      return {
        latitude: data.result.geometry?.location?.lat,
        longitude: data.result.geometry?.location?.lng,
        address: data.result.formatted_address || '',
      };
    }
    return null;
  } catch (err) {
    console.log('[Autocomplete] getPlaceDetails error:', err?.message);
    return null;
  }
};

// ═════════════════════════════════════════════════════════════════════════
const LocationAutocomplete = ({
  label,
  placeholder = 'Search location...',
  onSelect,
  value,
  showMapPicker = true,
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [apiError, setApiError] = useState(null);
  const debounceRef = useRef(null);
  const searchIdRef = useRef(0);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value || '');
      setSelected(!!value);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Debounced search ──────────────────────────────────────────────────
  const handleTextChange = useCallback((text) => {
    setQuery(text);
    setSelected(false);
    setApiError(null);
    isTypingRef.current = true;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      searchIdRef.current++;
      isTypingRef.current = false;
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const currentId = ++searchIdRef.current;
      setLoading(true);
      setApiError(null);

      const { results, error } = await searchPlaces(text);

      if (searchIdRef.current === currentId) {
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setLoading(false);
        if (error) {
          setApiError(error);
        }
      }
      isTypingRef.current = false;
    }, 400);
  }, []);

  // ── Select a suggestion ───────────────────────────────────────────────
  const handleSelect = useCallback(
    async (item) => {
      setQuery(item.description);
      setSelected(true);
      setShowDropdown(false);
      setSuggestions([]);
      setLoading(false);
      setApiError(null);
      searchIdRef.current++;

      const details = await getPlaceDetails(item.place_id);
      const locationData = {
        description: item.description,
        place_id: item.place_id,
        latitude: details?.latitude,
        longitude: details?.longitude,
        source: 'autocomplete',
      };
      setCurrentLocation({
        latitude: details?.latitude,
        longitude: details?.longitude,
      });
      onSelect?.(locationData);
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setSelected(false);
    setSuggestions([]);
    setShowDropdown(false);
    setCurrentLocation(null);
    setLoading(false);
    setApiError(null);
    searchIdRef.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSelect?.(null);
  }, [onSelect]);

  const handleMapConfirm = useCallback(
    (locationData) => {
      setQuery(locationData.description || '');
      setSelected(true);
      setMapPickerVisible(false);
      setApiError(null);
      setCurrentLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      onSelect?.({
        description: locationData.description,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        source: 'map',
      });
    },
    [onSelect],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSelect(item)}
        activeOpacity={0.6}
      >
        <View style={styles.suggestionIcon}>
          <Text>📍</Text>
        </View>
        <View style={styles.suggestionText}>
          <Text style={styles.suggestionMain} numberOfLines={1}>
            {item.mainText}
          </Text>
          {item.secondaryText ? (
            <Text style={styles.suggestionSecondary} numberOfLines={1}>
              {item.secondaryText}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    ),
    [handleSelect],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Search input */}
      <View style={styles.inputRow}>
        <View style={styles.searchIcon}>
          <Text>📍</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={query}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              if (!isTypingRef.current) {
                setShowDropdown(false);
              }
            }, 250);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.inputLoader}
          />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* API Error message */}
      {apiError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {apiError}</Text>
        </View>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={styles.dropdownList}
          />
        </View>
      )}

      {/* Pick on Map button */}
      {showMapPicker && (
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setMapPickerVisible(true)}
        >
          <Text style={styles.mapButtonIcon}>🗺️</Text>
          <Text style={styles.mapButtonText}>Pick on Map</Text>
        </TouchableOpacity>
      )}

      {/* Coordinates preview */}
      {selected && currentLocation?.latitude && (
        <View style={styles.coordinatesPreview}>
          <Text style={styles.coordinatesText}>
            📌 {currentLocation.latitude.toFixed(4)},{' '}
            {currentLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Map Location Picker Modal */}
      {mapPickerVisible && (
        <MapLocationPicker
          visible={mapPickerVisible}
          onClose={() => setMapPickerVisible(false)}
          onConfirm={handleMapConfirm}
          initialLocation={currentLocation}
          title={label || 'Pick Location'}
        />
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  inputLoader: {
    marginLeft: 8,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 4,
  },
  clearBtnText: {
    fontSize: 16,
    color: COLORS.gray400,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 16,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: 220,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 999,
  },
  dropdownList: {
    maxHeight: 220,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  suggestionSecondary: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
  },
  mapButtonIcon: {
    fontSize: 16,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  coordinatesPreview: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default LocationAutocomplete;
