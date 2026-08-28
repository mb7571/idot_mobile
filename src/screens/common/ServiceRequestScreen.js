import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { serviceRequestAPI, mastersAPI } from '../../services/api';

const ServiceRequestScreen = ({ route, navigation }) => {
  const { transporterProfileId, transporterName } = route.params;
  const [formData, setFormData] = useState({
    vehicle_type_id: null,
    from_location_address: '',
    from_latitude: null,
    from_longitude: null,
    to_location_address: '',
    to_latitude: null,
    to_longitude: null,
    message: '',
    estimated_weight: '',
    preferred_date: '',
    preferred_time: '',
  });
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const loadVehicleTypes = async () => {
    try {
      const response = await mastersAPI.getVehicleTypes();
      setVehicleTypes(response.data.data);
    } catch (error) {
      console.error('Failed to load vehicle types:', error);
    }
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.from_location_address.trim()) {
      Alert.alert('Error', 'Please enter from location');
      return;
    }
    if (!formData.to_location_address.trim()) {
      Alert.alert('Error', 'Please enter to location');
      return;
    }

    setLoading(true);
    try {
      await serviceRequestAPI.submit({
        transporter_profile_id: transporterProfileId,
        ...formData,
        vehicle_type_id: formData.vehicle_type_id || undefined,
        estimated_weight: formData.estimated_weight ? parseFloat(formData.estimated_weight) : undefined,
      });
      Alert.alert('Success', 'Service request submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Request</Text>
        <Text style={styles.subtitle}>Request services from {transporterName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Details</Text>

        <Text style={styles.label}>From Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pickup location"
          value={formData.from_location_address}
          onChangeText={(v) => updateField('from_location_address', v)}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => Alert.alert('Info', 'Google Maps location picker will open here')}
        >
          <Text style={styles.mapBtnText}>📍 Select on Map</Text>
        </TouchableOpacity>

        <Text style={styles.label}>To Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter delivery location"
          value={formData.to_location_address}
          onChangeText={(v) => updateField('to_location_address', v)}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => Alert.alert('Info', 'Google Maps location picker will open here')}
        >
          <Text style={styles.mapBtnText}>📍 Select on Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transport Details</Text>

        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.chipContainer}>
          {vehicleTypes.map((vt) => (
            <TouchableOpacity
              key={vt.id}
              style={[
                styles.chip,
                formData.vehicle_type_id === vt.id && styles.chipSelected,
              ]}
              onPress={() => updateField('vehicle_type_id', vt.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.vehicle_type_id === vt.id && styles.chipTextSelected,
                ]}
              >
                {vt.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Estimated Weight (tons)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter estimated weight"
          value={formData.estimated_weight}
          onChangeText={(v) => updateField('estimated_weight', v)}
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Preferred Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={formData.preferred_date}
          onChangeText={(v) => updateField('preferred_date', v)}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Preferred Time</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          value={formData.preferred_time}
          onChangeText={(v) => updateField('preferred_time', v)}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter any additional details or special requirements..."
          value={formData.message}
          onChangeText={(v) => updateField('message', v)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? 'Submitting...' : 'Submit Service Request'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  mapBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  mapBtnText: {
    color: '#374151',
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  chipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  chipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceRequestScreen;
