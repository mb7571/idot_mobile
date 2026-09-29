import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { COLORS } from '../styles/colors';

// Colors matching the list screen's 🟢 FROM / 🔴 TO chips
const FROM_COLOR = '#10B981';
const TO_COLOR = '#EF4444';

/**
 * ServiceAreaMap — renders a transporter's service area on a Google map.
 *
 * Data comes from the public profile endpoint which eager-loads
 * `fleet.fromServiceCities` / `fleet.toServiceCities` (City models with
 * latitude/longitude) plus `pivot.service_radius_km`.
 *
 * Shows:
 *  - 🟢 Markers for origin (FROM) service cities
 *  - 🔴 Markers for destination (TO) service cities
 *  - Translucent circles for each city's configured service radius (km)
 */
const ServiceAreaMap = ({ fleet = [], fullHeight = false }) => {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);

  // Collect unique markers + radius circles from all fleets
  const { markers, circles, region } = useMemo(() => {
    const seen = new Set();
    const markerList = [];
    const circleList = [];
    const coords = [];

    fleet.forEach((f) => {
      const groups = [
        { cities: f.from_service_cities || [], direction: 'from', color: FROM_COLOR, label: 'Origin' },
        { cities: f.to_service_cities || [], direction: 'to', color: TO_COLOR, label: 'Destination' },
      ];

      groups.forEach(({ cities, direction, color, label }) => {
        cities.forEach((city) => {
          const lat = parseFloat(city.latitude);
          const lng = parseFloat(city.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lng)) return;

          const key = `${direction}-${city.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            coords.push({ latitude: lat, longitude: lng });
            markerList.push({
              id: key,
              latlng: { latitude: lat, longitude: lng },
              title: city.name,
              description: label,
              color,
            });

            const radius = parseFloat(city.pivot?.service_radius_km);
            if (!Number.isNaN(radius) && radius > 0) {
              circleList.push({
                id: `${key}-circle`,
                center: { latitude: lat, longitude: lng },
                radius,
                color,
              });
            }
          }
        });
      });
    });

    // Compute a bounding-box region (fallback: India-wide)
    let computedRegion;
    if (coords.length > 0) {
      const lats = coords.map((c) => c.latitude);
      const lngs = coords.map((c) => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      // Expand box so radius circles stay partially visible
      const maxRadiusDeg = Math.max(0, ...circleList.map((c) => c.radius / 111));
      const latDelta = Math.max((maxLat - minLat) + maxRadiusDeg * 2, 0.08) * 1.35;
      const lngDelta = Math.max((maxLng - minLng) + maxRadiusDeg * 2, 0.08) * 1.35;
      computedRegion = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    } else {
      computedRegion = {
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 20,
        longitudeDelta: 20,
      };
    }

    return { markers: markerList, circles: circleList, region: computedRegion };
  }, [fleet]);

  const fitToContent = () => {
    if (markers.length === 0 || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      markers.map((m) => m.latlng),
      {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: false,
      },
    );
  };

  const hasData = markers.length > 0;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.mapContainer, fullHeight && styles.mapContainerFull]}>
        {mapError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>
              Map failed to load. Check the Google Maps API key.
            </Text>
          </View>
        ) : hasData ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            provider="google"
            showsCompass={false}
            showsScale={false}
            toolbarEnabled={false}
            scrollEnabled
            zoomEnabled
            onMapReady={fitToContent}
            onError={(err) =>
              setMapError(
                err?.nativeEvent?.message || 'Map failed to load.',
              )
            }
          >
            {circles.map((c) => (
              <Circle
                key={c.id}
                center={c.center}
                radius={c.radius * 1000} // km → meters
                strokeWidth={1.5}
                strokeColor={c.color}
                fillColor={`${c.color}1A`} // ~10% opacity
              />
            ))}
            {markers.map((m) => (
              <Marker
                key={m.id}
                coordinate={m.latlng}
                title={m.title}
                description={`${m.description} city`}
                pinColor={m.color}
                tracksViewChanges={false}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>
              No service locations with map data
            </Text>
          </View>
        )}

        {/* Legend overlay */}
        {hasData && !mapError && (
          <View style={styles.legend} pointerEvents="none">
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: FROM_COLOR }]} />
              <Text style={styles.legendText}>From</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TO_COLOR }]} />
              <Text style={styles.legendText}>To</Text>
            </View>
          </View>
        )}
      </View>

      {/* Radius hint */}
      {hasData && circles.length > 0 && (
        <Text style={[styles.hint, fullHeight && styles.hintFullHeight]}>
          Shaded circles show the service radius around each city
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  mapContainer: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.gray100,
  },
  mapContainerFull: {
    flex: 1,
    height: undefined,
    borderRadius: 14,
  },
  map: { ...StyleSheet.absoluteFillObject },

  // Error / empty states
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: { fontSize: 28, marginBottom: 8 },
  errorText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: { fontSize: 28, marginBottom: 8, opacity: 0.6 },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Legend
  legend: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600', color: COLORS.text },

  hint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  hintFullHeight: { paddingBottom: 4 },
});

export default ServiceAreaMap;
