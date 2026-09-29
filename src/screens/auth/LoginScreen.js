import React, { useState } from 'react';
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
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { authAPI } from '../../api';
import { isValidMobile } from '../../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleaned = mobile.replace(/\D/g, '');
    if (!isValidMobile(cleaned)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.sendOtp(cleaned);
      // Capture OTP from dev mode response
      const otp = response.data?.data?.otp;
      navigation.navigate('Otp', { mobile: cleaned, otp });
    } catch (error) {
      let msg = error.response?.data?.message;
      if (!msg && !error.response) {
        // No HTTP response at all → connection to the server failed
        msg = 'Cannot reach the server. Please check your internet connection and try again.';
      }
      Alert.alert('Error', msg || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2563EB', '#1E40AF']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.brandName}>iDOT</Text>
          <Text style={styles.tagline}>Smart Transport Solutions</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Enter your mobile number to continue</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputRow}>
                <View style={styles.prefixContainer}>
                  <Text style={styles.prefixFlag}>🇮🇳</Text>
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

            <TouchableOpacity
              style={[styles.loginButton, (mobile.replace(/\D/g, '').length !== 10 || loading) && styles.loginButtonDisabled]}
              onPress={handleSendOtp}
              disabled={mobile.replace(/\D/g, '').length !== 10 || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  mobile.replace(/\D/g, '').length === 10 && !loading
                    ? ['#2563EB', '#7C3AED']
                    : ['#9CA3AF', '#9CA3AF']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Sending...' : 'Send OTP →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerBtnText}>
                New user? <Text style={styles.registerBold}>Register as Customer</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerBtnSecondary}
              onPress={() => navigation.navigate('RegisterTransporter')}
            >
              <Text style={styles.registerBtnSecondaryText}>
                🚛 <Text style={styles.registerBold}>Register as Transporter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoEmoji: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    gap: 6,
  },
  prefixFlag: {
    fontSize: 18,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    marginHorizontal: 14,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  registerBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    marginBottom: 10,
  },
  registerBtnText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  registerBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  registerBtnSecondary: {
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },
  registerBtnSecondaryText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
