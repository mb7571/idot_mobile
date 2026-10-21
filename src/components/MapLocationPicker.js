import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS } from '../styles/colors';
import { DEFAULT_REGION } from '../config/maps';
import { getApiUrl } from '../config/api';

// ── Android permission ──────────────────────────────────────────────────
const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'iDOT needs access to your location to show your position on the map.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

// ── Reverse-geocode via BACKEND PROXY (device can't reach Google directly) ──
const reverseGeocode = async (lat, lng) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(
      `${getApiUrl()}/maps/geocode?latlng=${lat},${lng}`,
      { signal: controller.signal },
    );
    clearTimeout(timer);
    const data = await res.json();
    if (data.results?.length > 0) {
      return data.results[0].formatted_address;
    }
  } catch (err) {
    console.log('[MapPicker] reverseGeocode error:', err?.message);
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// ═════════════════════════════════════════════════════════════════════════
const MapLocationPicker = ({
  visible,
  onClose,
  onConfirm,
  initialLocation,
  title = 'Pick Location',
}) => {
  const mapRef = useRef(null);
  const gotInitialGPS = useRef(false);
  const isDragging = useRef(false);

  const [region, setRegion] = useState({
    ...DEFAULT_REGION,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    if (!visible) return;
    gotInitialGPS.current = false;
    isDragging.current = false;
    setMapError(null);

    if (initialLocation) {
      setMarker(initialLocation);
      setRegion({ ...initialLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      reverseGeocode(initialLocation.latitude, initialLocation.longitude).then(setAddress);
      setPermissionGranted(false);
      return;
    }

    (async () => {
      const granted = await requestLocationPermission();
      setPermissionGranted(granted);
    })();
  }, [visible, initialLocation]);

  const handleMapReady = useCallback(() => {
    console.log('[MapPicker] Map ready');
  }, []);

  const handleMapError = useCallback((error) => {
    console.log('[MapPicker] Map error:', JSON.stringify(error?.nativeEvent || error));
    setMapError(error?.nativeEvent?.message || 'Map failed to load. Check Google Maps API key.');
  }, []);

  const handleUserLocationChange = useCallback(
    (e) => {
      if (gotInitialGPS.current) return;
      if (!e?.nativeEvent?.coordinate) return;

      const { latitude, longitude } = e.nativeEvent.coordinate;
      gotInitialGPS.current = true;

      console.log('[MapPicker] User location:', latitude, longitude);
      setMarker({ latitude, longitude });
      setRegion({ ...region, latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      reverseGeocode(latitude, longitude).then(setAddress);

      setTimeout(() => {
        mapRef.current?.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          500,
        );
      }, 200);
    },
    [region],
  );

  const handleMapPress = useCallback((e) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    const { latitude, longitude } = e.nativeEvent.coordinate;
    console.log('[MapPicker] Map pressed at:', latitude, longitude);
    setMarker({ latitude, longitude });
    setLoadingAddress(true);
    reverseGeocode(latitude, longitude).then((addr) => {
      setAddress(addr);
      setLoadingAddress(false);
    });
  }, []);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    console.log('[MapPicker] Marker drag started');
  }, []);

  const handleDragEnd = useCallback((e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    isDragging.current = false;
    console.log('[MapPicker] Marker dragged to:', latitude, longitude);
    setMarker({ latitude, longitude });
    setLoadingAddress(true);
    reverseGeocode(latitude, longitude).then((addr) => {
      setAddress(addr);
      setLoadingAddress(false);
    });
  }, []);

  const handleMyLocation = useCallback(() => {
    gotInitialGPS.current = false;
    setPermissionGranted(false);
    setTimeout(() => setPermissionGranted(true), 100);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!marker) return;
    onConfirm?.({
      description: address,
      latitude: marker.latitude,
      longitude: marker.longitude,
    });
    onClose?.();
  }, [marker, address, onConfirm, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity
            style={[styles.headerButton, !marker && styles.headerButtonDisabled]}
            onPress={handleConfirm}
            disabled={!marker}
          >
            <Text style={[styles.headerButtonText, styles.confirmText]}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          {mapError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Map Failed to Load</Text>
              <Text style={styles.errorMessage}>{mapError}</Text>
              <Text style={styles.errorHint}>
                Make sure "Maps SDK for Android" is enabled for your API key in Google Cloud Console.
              </Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={region}
              showsUserLocation={permissionGranted}
              showsMyLocationButton={false}
              showsCompass={true}
              showsScale={true}
              toolbarEnabled={false}
              onPress={handleMapPress}
              onUserLocationChange={handleUserLocationChange}
              onMapReady={handleMapReady}
              onMapLoaded={handleMapReady}
              onError={handleMapError}
              onRegionChangeComplete={(r) => setRegion(r)}
              provider="google"
            >
              {marker && (
                <Marker
                  coordinate={marker}
                  draggable
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  title="Selected Location"
                  description={address}
                  pinColor={COLORS.danger}
                  tracksViewChanges={false}
                />
              )}
            </MapView>
          )}

          {/* Center crosshair */}
          {!mapError && (
            <View style={styles.centerCrosshair} pointerEvents="none">
              <View style={styles.crosshairVertical} />
              <View style={styles.crosshairHorizontal} />
              <View style={styles.crosshairCenter} />
            </View>
          )}

          {/* My Location FAB */}
          {!mapError && (
            <TouchableOpacity style={styles.myLocationBtn} onPress={handleMyLocation}>
              <Text style={styles.myLocationIcon}>📍</Text>
            </TouchableOpacity>
          )}

          {/* Hint when no pin */}
          {!marker && !mapError && (
            <View style={styles.hintOverlay} pointerEvents="none">
              <Text style={styles.hintText}>Tap anywhere on the map to drop a pin</Text>
            </View>
          )}
        </View>

        {/* Address bar */}
        <View style={styles.addressBar}>
          <View style={styles.addressIcon}>
            <Text>📌</Text>
          </View>
          <View style={styles.addressInfo}>
            {loadingAddress ? (
              <View style={styles.addressLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.addressLoadingText}>Getting address…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.addressText} numberOfLines={2}>
                  {address || 'Tap on the map to select a location'}
                </Text>
                {marker && (
                  <Text style={styles.addressCoords}>
                    {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, !marker && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!marker}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
          <Text style={styles.footerHint}>
            Drag the pin to fine-tune, or tap anywhere on the map
          </Text>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 40 : 14,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonDisabled: {
    opacity: 0.4,
  },
  headerButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  confirmText: {
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Map Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F9FAFB',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  // Crosshair
  centerCrosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  crosshairCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  myLocationBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  myLocationIcon: {
    fontSize: 20,
  },
  hintOverlay: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  hintText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.gray50,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    minHeight: 60,
  },
  addressIcon: {
    marginRight: 10,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  addressCoords: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addressLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLoadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  footerHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MapLocationPicker;
