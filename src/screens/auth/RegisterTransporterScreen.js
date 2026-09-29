import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import { useAuth } from '../../context/AuthContext';
import { mastersAPI } from '../../api';
import { isValidMobile } from '../../utils/helpers';
import { PrimaryButton, LoadingSpinner } from '../../components/SharedComponents';

const RegisterTransporterScreen = ({ navigation }) => {
  const { registerTransporter } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(true);

  // Form state
  const [registrationType, setRegistrationType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Master data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showStates, setShowStates] = useState(false);
  const [showCities, setShowCities] = useState(false);

  const regTypes = ['Vehicle Owner', 'Broker', 'Transporter'];

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState.id);
    }
  }, [selectedState]);

  const loadMasters = async () => {
    try {
      const [statesRes] = await Promise.all([mastersAPI.getStates()]);
      setStates(statesRes.data.data || statesRes.data || []);
    } catch {
      // Use empty arrays
    } finally {
      setLoadingMasters(false);
    }
  };

  const loadCities = async (stateId) => {
    try {
      const res = await mastersAPI.getCities(stateId);
      setCities(res.data.data || res.data || []);
    } catch {
      setCities([]);
    }
  };

  const handleRegister = async () => {
    if (!registrationType) {
      Alert.alert('Required', 'Please select a registration type.');
      return;
    }
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business name.');
      return;
    }
    if (!contactPerson.trim()) {
      Alert.alert('Required', 'Please enter contact person name.');
      return;
    }
    const cleaned = mobile.replace(/\D/g, '');
    if (!isValidMobile(cleaned)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerTransporter({
        registration_type: registrationType.toLowerCase().replace(/\s+/g, '_'),
        business_name: businessName.trim(),
        contact_person_name: contactPerson.trim(),
        mobile: cleaned,
        email: email.trim() || undefined,
        business_location: businessLocation.trim() || undefined,
        state_id: selectedState?.id,
        city_id: selectedCity?.id,
      });
      // Navigate to OTP screen with the OTP (dev mode) for verification
      const otp = result?.otp;
      navigation.navigate('Otp', { mobile: cleaned, otp });
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMasters) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Transporter Registration</Text>
          <Text style={styles.subtitle}>Fill in your business details to register</Text>
        </View>

        <View style={styles.form}>
          {/* Registration Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Type *</Text>
            <View style={styles.typeRow}>
              {regTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    registrationType === type && styles.typeChipActive,
                  ]}
                  onPress={() => setRegistrationType(type)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      registrationType === type && styles.typeChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter business name"
              placeholderTextColor={COLORS.placeholder}
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          {/* Contact Person */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Person Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact person name"
              placeholderTextColor={COLORS.placeholder}
              value={contactPerson}
              onChangeText={setContactPerson}
              autoCapitalize="words"
            />
          </View>

          {/* Mobile */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefix}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Business Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Location (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter business address"
              placeholderTextColor={COLORS.placeholder}
              value={businessLocation}
              onChangeText={setBusinessLocation}
            />
          </View>

          {/* State */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State (Optional)</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowStates(!showStates)}
            >
              <Text style={selectedState ? styles.selectText : styles.selectPlaceholder}>
                {selectedState?.name || 'Select State'}
              </Text>
              <Text style={styles.selectArrow}>{showStates ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showStates && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {states.map((state) => (
                    <TouchableOpacity
                      key={state.id}
                      style={[
                        styles.dropdownItem,
                        selectedState?.id === state.id && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedState(state);
                        setSelectedCity(null);
                        setShowStates(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{state.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* City */}
          {selectedState && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City (Optional)</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowCities(!showCities)}
              >
                <Text style={selectedCity ? styles.selectText : styles.selectPlaceholder}>
                  {selectedCity?.name || 'Select City'}
                </Text>
                <Text style={styles.selectArrow}>{showCities ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showCities && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {cities.map((city) => (
                      <TouchableOpacity
                        key={city.id}
                        style={[
                          styles.dropdownItem,
                          selectedCity?.id === city.id && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setSelectedCity(city);
                          setShowCities(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>{city.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          <PrimaryButton title="Submit Registration" onPress={handleRegister} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefixContainer: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
  },
  typeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  typeChipTextActive: {
    color: COLORS.primary,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  selectText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectPlaceholder: {
    fontSize: 16,
    color: COLORS.placeholder,
  },
  selectArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    maxHeight: 200,
    marginTop: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.text,
  },
});

export default RegisterTransporterScreen;
