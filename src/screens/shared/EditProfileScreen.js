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
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { PrimaryButton } from '../../components/SharedComponents';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      const updatedUser = response.data.data || response.data;
      await updateUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.mobile || ''}
            editable={false}
          />
          <Text style={styles.hint}>Mobile number cannot be changed</Text>
        </View>

        <PrimaryButton title="Save Changes" onPress={handleSave} loading={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
  },
  disabledInput: {
    backgroundColor: COLORS.gray100,
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default EditProfileScreen;
