import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { mastersAPI } from '../../services/api';

const TransporterSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [sortBy, setSortBy] = useState('name_asc');
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

  const handleSearch = () => {
    const params = {};
    if (searchQuery.trim()) params.query = searchQuery.trim();
    if (fromLocation.trim()) params.from_location = fromLocation.trim();
    if (toLocation.trim()) params.to_location = toLocation.trim();
    if (selectedVehicleType) params.vehicle_type_id = selectedVehicleType;
    params.sort_by = sortBy;

    navigation.navigate('TransporterList', { searchParams: params });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search Transporters</Text>

        <Text style={styles.label}>Search by Name/Mobile/Business</Text>
        <TextInput
          style={styles.input}
          placeholder="Search transporters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>From Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter from location"
          value={fromLocation}
          onChangeText={setFromLocation}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>To Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter to location"
          value={toLocation}
          onChangeText={setToLocation}
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            // TODO: Implement Google Maps autocomplete
            Alert.alert('Info', 'Google Maps autocomplete will open here');
          }}
        >
          <Text style={styles.locationButtonText}>📍 Use Map for Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Vehicle Type</Text>
        <View style={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, !selectedVehicleType && styles.chipSelected]}
            onPress={() => setSelectedVehicleType(null)}
          >
            <Text style={[styles.chipText, !selectedVehicleType && styles.chipTextSelected]}>
              All
            </Text>
          </TouchableOpacity>
          {vehicleTypes.map((vt) => (
            <TouchableOpacity
              key={vt.id}
              style={[styles.chip, selectedVehicleType === vt.id && styles.chipSelected]}
              onPress={() => setSelectedVehicleType(vt.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedVehicleType === vt.id && styles.chipTextSelected,
                ]}
              >
                {vt.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.chipContainer}>
          {[
            { value: 'name_asc', label: 'A → Z' },
            { value: 'name_desc', label: 'Z → A' },
            { value: 'created_desc', label: 'Newest' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, sortBy === option.value && styles.chipSelected]}
              onPress={() => setSortBy(option.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  sortBy === option.value && styles.chipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search Transporters</Text>
      </TouchableOpacity>
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
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
    marginBottom: 16,
  },
  locationButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  locationButtonText: {
    color: '#374151',
    fontSize: 16,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransporterSearchScreen;
