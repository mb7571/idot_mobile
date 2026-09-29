import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import { transporterAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/SharedComponents';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  locked,
  keyboardType,
  autoCapitalize,
  hint,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea, locked && styles.inputLocked]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
      editable={!locked}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

const TransporterEditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params || {};
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    business_name: profile?.business_name || '',
    contact_person_name: profile?.contact_person_name || '',
    email: profile?.email || '',
    business_location_address: profile?.business_location_address || '',
    business_city: profile?.business_city || '',
    business_state: profile?.business_state || '',
    business_pincode: profile?.business_pincode || '',
    description: profile?.description || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (text) => setForm((prev) => ({ ...prev, [key]: text }));

  const handleSave = async () => {
    if (!form.business_name.trim()) {
      Alert.alert('Required', 'Business name is required.');
      return;
    }
    if (!form.contact_person_name.trim()) {
      Alert.alert('Required', 'Contact person name is required.');
      return;
    }
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
      Alert.alert('Invalid', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await transporterAPI.updateMyProfile({
        business_name: form.business_name.trim(),
        contact_person_name: form.contact_person_name.trim(),
        email: form.email.trim() || null,
        business_location_address: form.business_location_address.trim(),
        business_city: form.business_city.trim() || null,
        business_state: form.business_state.trim() || null,
        business_pincode: form.business_pincode.trim() || null,
        description: form.description.trim() || null,
      });

      const updatedProfile = response.data.data || response.data;
      if (user && updatedProfile) {
        await updateUser({
          name: updatedProfile.contact_person_name || user.name,
          email: updatedProfile.email || user.email,
        });
      }

      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      const errors = error.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0]?.[0];
        Alert.alert('Validation Error', first || msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Business info */}
        <Text style={styles.sectionLabel}>🏢 Business Information</Text>
        <InputField
          label="Business Name *"
          value={form.business_name}
          onChangeText={set('business_name')}
          placeholder="Enter business name"
        />
        <InputField
          label="Contact Person Name *"
          value={form.contact_person_name}
          onChangeText={set('contact_person_name')}
          placeholder="Enter contact person name"
          autoCapitalize="words"
        />

        {/* Contact */}
        <Text style={styles.sectionLabel}>📞 Contact Details</Text>
        <InputField
          label="Mobile Number 🔒"
          value={profile?.mobile || user?.mobile || ''}
          locked
          keyboardType="phone-pad"
          hint="Mobile number is your login identity and cannot be changed"
        />
        <InputField
          label="Email"
          value={form.email}
          onChangeText={set('email')}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Location */}
        <Text style={styles.sectionLabel}>📍 Business Location</Text>
        <InputField
          label="Address"
          value={form.business_location_address}
          onChangeText={set('business_location_address')}
          placeholder="Enter business address"
          multiline
        />
        <InputField
          label="City"
          value={form.business_city}
          onChangeText={set('business_city')}
          placeholder="Enter city"
        />
        <InputField
          label="State"
          value={form.business_state}
          onChangeText={set('business_state')}
          placeholder="Enter state"
        />
        <InputField
          label="Pincode"
          value={form.business_pincode}
          onChangeText={set('business_pincode')}
          placeholder="Enter pincode"
          keyboardType="number-pad"
        />

        {/* Description */}
        <Text style={styles.sectionLabel}>📝 About Your Business</Text>
        <InputField
          label="Description"
          value={form.description}
          onChangeText={set('description')}
          placeholder="Describe your transport services, experience, fleet highlights..."
          multiline
        />

        <PrimaryButton title="Save Changes" onPress={handleSave} loading={loading} />
        <Text style={styles.note}>
          Vehicle fleet and service cities are managed by the iDOT admin team. Contact support for
          changes.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 8,
    marginBottom: 14,
  },
  inputGroup: { marginBottom: 16, gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: { height: 96, paddingTop: 12 },
  inputLocked: {
    backgroundColor: COLORS.gray100,
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  note: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
});

export default TransporterEditProfileScreen;
