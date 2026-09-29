import React, { useState, useMemo } from 'react';
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
import { serviceRequestAPI } from '../../api';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import CalendarPicker from '../../components/CalendarPicker';

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const ServiceRequestScreen = ({ route, navigation }) => {
  const { transporterId, transporter } = route.params;

  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Vehicle types offered by THIS transporter only (from their fleet).
  // Falls back to an empty list if the fleet has no types — in that case
  // the vehicle selector is hidden and the backend leaves the field null.
  const transporterVehicleTypes = useMemo(() => {
    const fleet = transporter?.fleet || [];
    const seen = new Map();
    fleet.forEach((f) => {
      if (Array.isArray(f.vehicle_types)) {
        f.vehicle_types.forEach((vt) => {
          if (vt?.id && !seen.has(vt.id)) seen.set(vt.id, vt);
        });
      }
      if (f.vehicle_type?.id && !seen.has(f.vehicle_type.id)) {
        seen.set(f.vehicle_type.id, f.vehicle_type);
      }
    });
    return Array.from(seen.values());
  }, [transporter]);

  const handleSubmit = async () => {
    if (!fromLocation?.description) {
      Alert.alert('Required', 'Please select a pickup (from) location.');
      return;
    }
    if (!toLocation?.description) {
      Alert.alert('Required', 'Please select a delivery (to) location.');
      return;
    }

    setLoading(true);
    try {
      // Backend expects these exact field names:
      await serviceRequestAPI.submit({
        transporter_profile_id: transporterId,
        vehicle_type_id: selectedVehicleType?.id,
        from_location_address: fromLocation.description,
        from_latitude: fromLocation.latitude,
        from_longitude: fromLocation.longitude,
        to_location_address: toLocation.description,
        to_latitude: toLocation.latitude,
        to_longitude: toLocation.longitude,
        message: message.trim() || undefined,
        preferred_date: preferredDate || undefined,
      });
      Alert.alert('Success', 'Service request submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit request.';
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        Alert.alert('Validation Error', firstError || msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Transporter hero card */}
        <LinearGradient
          colors={['#2563EB', '#1E40AF']}
          style={styles.hero}
        >
          <Text style={styles.heroLabel}>Sending request to</Text>
          <Text style={styles.heroName} numberOfLines={2}>
            {transporter?.business_name || 'Transporter'}
          </Text>
          {transporter?.business_type?.name && (
            <View style={styles.heroTypeBadge}>
              <Text style={styles.heroTypeText}>
                {transporter.business_type.name}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Form card */}
        <View style={styles.formCard}>
          {/* Route */}
          <LocationAutocomplete
            label="📍 From Location (Pickup) *"
            placeholder="Search pickup location..."
            onSelect={setFromLocation}
            value={fromLocation?.description}
          />

          <LocationAutocomplete
            label="🏁 To Location (Delivery) *"
            placeholder="Search delivery location..."
            onSelect={setToLocation}
            value={toLocation?.description}
          />

          {/* Route preview */}
          {(fromLocation?.description || toLocation?.description) && (
            <View style={styles.routePreview}>
              <Text style={styles.routePreviewText} numberOfLines={2}>
                {fromLocation?.description || 'Pickup'}
                {'  →  '}
                {toLocation?.description || 'Delivery'}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Vehicle type — only this transporter's vehicles */}
          {transporterVehicleTypes.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🚚 Vehicle Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
                nestedScrollEnabled
              >
                {transporterVehicleTypes.map((vt) => {
                  const active = selectedVehicleType?.id === vt.id;
                  return (
                    <TouchableOpacity
                      key={vt.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedVehicleType(active ? null : vt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {vt.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Preferred date — calendar with presets */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📅 Preferred Date</Text>
            <TouchableOpacity
              style={[styles.dateInput, preferredDate && styles.dateInputActive]}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dateText,
                  !preferredDate && styles.datePlaceholder,
                ]}
                numberOfLines={1}
              >
                {preferredDate
                  ? formatDisplayDate(preferredDate)
                  : 'Pick a date (optional)'}
              </Text>
              {preferredDate ? (
                <TouchableOpacity
                  onPress={() => setPreferredDate('')}
                  style={styles.dateClear}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.dateClearText}>✕</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.dateChevron}>▾</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.hint}>Tap to open the calendar</Text>
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>💬 Message / Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter any additional details..."
              placeholderTextColor={COLORS.placeholder}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2563EB', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>
                {loading ? 'Submitting…' : '📤 Submit Service Request'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Calendar modal */}
      <CalendarPicker
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={setPreferredDate}
        value={preferredDate}
        title="Preferred Date"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 32,
  },

  // Hero
  hero: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 10,
  },
  heroTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroTypeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },

  // Form card
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },

  // Route preview
  routePreview: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  routePreviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 16,
  },

  // Inputs
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: { height: 100, paddingTop: 12 },
  hint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 5,
    fontStyle: 'italic',
  },

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

  // Date input
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  dateInputActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  dateText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  datePlaceholder: {
    color: COLORS.placeholder,
    fontWeight: '400',
  },
  dateChevron: { fontSize: 14, color: COLORS.textSecondary },
  dateClear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateClearText: { fontSize: 11, color: COLORS.gray600, fontWeight: '700' },

  // Submit
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  submitBtnDisabled: { opacity: 0.7 },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default ServiceRequestScreen;
