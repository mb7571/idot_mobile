import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { useAuth } from '../../context/AuthContext';

const OtpScreen = ({ route, navigation }) => {
  const { mobile, otp: devOtp } = route.params;
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  // Auto-fill OTP from dev mode response
  useEffect(() => {
    if (devOtp && devOtp.length === 6) {
      const digits = devOtp.split('');
      setOtp(digits);
      // Auto-verify after a short delay
      const timer = setTimeout(() => {
        handleVerifyWithOtp(devOtp);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [devOtp]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyWithOtp = async (otpString) => {
    setLoading(true);
    try {
      await login(mobile, otpString);
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await login(mobile, otpString);
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { authAPI } = require('../../api');
      const response = await authAPI.sendOtp(mobile);
      const newOtp = response.data?.data?.otp;
      if (newOtp) {
        setOtp(newOtp.split(''));
      }
      setResendTimer(60);
    } catch {
      Alert.alert('Error', 'Failed to resend OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2563EB', '#1E40AF']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
        <Text style={styles.mobile}>+91 {mobile}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Dev mode OTP display */}
          {devOtp && (
            <View style={styles.devOtpCard}>
              <View style={styles.devOtpHeader}>
                <Text style={styles.devOtpIcon}>🔧</Text>
                <Text style={styles.devOtpLabel}>Dev Mode</Text>
              </View>
              <Text style={styles.devOtpText}>Your OTP is:</Text>
              <Text style={styles.devOtpValue}>{devOtp}</Text>
              <Text style={styles.devOtpHint}>Auto-verifying in a moment...</Text>
            </View>
          )}

          <View style={styles.otpCard}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, (otp.join('').length !== 6 || loading) && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={otp.join('').length !== 6 || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  otp.join('').length === 6 && !loading
                    ? ['#2563EB', '#7C3AED']
                    : ['#9CA3AF', '#9CA3AF']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyButtonGradient}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Verifying...' : 'Verify OTP →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.resendRow}>
            {resendTimer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in <Text style={styles.timerBold}>{resendTimer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    paddingTop: 50,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 24,
  },
  backButton: { marginBottom: 20 },
  backText: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  mobile: { fontSize: 17, fontWeight: '700', color: COLORS.white, marginTop: 4 },
  formContainer: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },

  // Dev OTP display
  devOtpCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  devOtpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  devOtpIcon: { fontSize: 18 },
  devOtpLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  devOtpText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 6,
  },
  devOtpValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 8,
  },
  devOtpHint: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  otpCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: COLORS.gray50,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  verifyButton: { borderRadius: 14, overflow: 'hidden' },
  verifyButtonDisabled: { opacity: 0.7 },
  verifyButtonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  verifyButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  resendRow: { alignItems: 'center', marginTop: 28 },
  timerText: { fontSize: 14, color: COLORS.textSecondary },
  timerBold: { fontWeight: '700', color: COLORS.primary },
  resendText: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
});

export default OtpScreen;
