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
  StatusBar,
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
      // Silent fail
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Transporters</Text>
          <Text style={styles.headerSubtitle}>Search by name, location, or vehicle type</Text>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🔍 Search</Text>
            <TextInput
              style={styles.input}
              placeholder="Business name, contact, mobile..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.locationRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>📍 From</Text>
              <TextInput
                style={styles.input}
                placeholder="Pickup location"
                value={fromLocation}
                onChangeText={setFromLocation}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>📍 To</Text>
              <TextInput
                style={styles.input}
                placeholder="Delivery location"
                value={toLocation}
                onChangeText={setToLocation}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Vehicle Type Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>🚛 Vehicle Type</Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.chip, !selectedVehicleType && styles.chipSelected]}
              onPress={() => setSelectedVehicleType(null)}
            >
              <Text style={[styles.chipText, !selectedVehicleType && styles.chipTextSelected]}>
                All Types
              </Text>
            </TouchableOpacity>
            {vehicleTypes.map((vt) => (
              <TouchableOpacity
                key={vt.id}
                style={[styles.chip, selectedVehicleType === vt.id && styles.chipSelected]}
                onPress={() => setSelectedVehicleType(vt.id)}
              >
                <Text
                  style={[styles.chipText, selectedVehicleType === vt.id && styles.chipTextSelected]}
                >
                  {vt.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort By */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>📊 Sort By</Text>
          <View style={styles.chipContainer}>
            {[
              { value: 'name_asc', label: 'A → Z', icon: '🔤' },
              { value: 'name_desc', label: 'Z → A', icon: '🔠' },
              { value: 'created_desc', label: 'Newest', icon: '🕐' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.chip, sortBy === option.value && styles.chipSelected]}
                onPress={() => setSortBy(option.value)}
              >
                <Text style={styles.chipIcon}>{option.icon}</Text>
                <Text
                  style={[styles.chipText, sortBy === option.value && styles.chipTextSelected]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchButtonText}>🔍 Search Transporters</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    fontSize: 15,
    color: '#1E293B',
  },
  locationRow: {
    flexDirection: 'row',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  chipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TransporterSearchScreen;
