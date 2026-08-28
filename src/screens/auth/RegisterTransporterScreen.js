import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { mastersAPI } from '../../services/api';

const RegisterTransporterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    business_name: '',
    business_type_id: '',
    contact_person_name: '',
    business_location_address: '',
    business_latitude: null,
    business_longitude: null,
    business_city: '',
    business_state: '',
    business_pincode: '',
  });
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const { registerTransporter } = useAuth();

  useEffect(() => {
    loadBusinessTypes();
  }, []);

  const loadBusinessTypes = async () => {
    try {
      const response = await mastersAPI.getBusinessTypes();
      setBusinessTypes(response.data.data);
    } catch (error) {
      console.error('Failed to load business types:', error);
    } finally {
      setLoadingMasters(false);
    }
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!formData.mobile || formData.mobile.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }
    if (!formData.business_name.trim()) {
      Alert.alert('Error', 'Please enter business name');
      return;
    }
    if (!formData.business_type_id) {
      Alert.alert('Error', 'Please select business type');
      return;
    }
    if (!formData.contact_person_name.trim()) {
      Alert.alert('Error', 'Please enter contact person name');
      return;
    }
    if (!formData.business_location_address.trim()) {
      Alert.alert('Error', 'Please enter business location');
      return;
    }

    setLoading(true);
    try {
      await registerTransporter(formData);
      Alert.alert('Success', 'Registration successful! Your profile is pending verification.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMasters) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Transporter Registration</Text>
          <Text style={styles.subtitle}>Register your transport business</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(v) => updateField('name', v)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            value={formData.mobile}
            onChangeText={(v) => updateField('mobile', v)}
            keyboardType="phone-pad"
            maxLength={15}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter business name"
            value={formData.business_name}
            onChangeText={(v) => updateField('business_name', v)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Registration Type *</Text>
          <View style={styles.radioGroup}>
            {businessTypes.map((bt) => (
              <TouchableOpacity
                key={bt.id}
                style={[
                  styles.radioOption,
                  formData.business_type_id === bt.id && styles.radioOptionSelected,
                ]}
                onPress={() => updateField('business_type_id', bt.id)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.business_type_id === bt.id && styles.radioTextSelected,
                  ]}
                >
                  {bt.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Contact Person Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter contact person name"
            value={formData.contact_person_name}
            onChangeText={(v) => updateField('contact_person_name', v)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Location</Text>

          <Text style={styles.label}>Business Location Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full address"
            value={formData.business_location_address}
            onChangeText={(v) => updateField('business_location_address', v)}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={formData.business_city}
            onChangeText={(v) => updateField('business_city', v)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter state"
            value={formData.business_state}
            onChangeText={(v) => updateField('business_state', v)}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pincode"
            value={formData.business_pincode}
            onChangeText={(v) => updateField('business_pincode', v)}
            keyboardType="number-pad"
            maxLength={10}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => {
              // TODO: Implement Google Maps location picker
              Alert.alert('Info', 'Google Maps location picker will open here');
            }}
          >
            <Text style={styles.mapButtonText}>📍 Select Location on Map</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registering...' : 'Register as Transporter'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Login</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  radioOption: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  radioOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  radioText: {
    color: '#6B7280',
    fontSize: 14,
  },
  radioTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  mapButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  mapButtonText: {
    color: '#374151',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    padding: 12,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginBold: {
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default RegisterTransporterScreen;
