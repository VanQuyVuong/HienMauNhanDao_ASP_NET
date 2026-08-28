// src/screens/OtpVerificationScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/api';

const { width } = Dimensions.get('window');

export default function OtpVerificationScreen({ route, navigation }) {
  const formData = route.params?.formData;
  const inputRef = useRef(null);

  useEffect(() => {
    if (!formData) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin đăng ký. Vui lòng thử lại.', [
        { text: 'Quay lại', onPress: () => navigation.navigate('Register') }
      ]);
    }
  }, [formData]);

  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Bộ đếm ngược 60s
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!formData) {
    return null;
  }

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await authService.sendOtp(formData.email);
      setCountdown(60);
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn.');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || (typeof err.response?.data === 'string' ? err.response.data : null) || 'Lỗi kết nối server.';
      Alert.alert('Lỗi', msg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Thông báo', 'Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }

    setLoading(true);
    try {
      // 1. Xác thực OTP
      try {
        await authService.verifyOtp({ Email: formData.email, Otp: otp.trim() });
      } catch (otpErr) {
        const msg = otpErr.response?.data?.message || otpErr.response?.data?.Message || (typeof otpErr.response?.data === 'string' ? otpErr.response.data : null) || 'Mã OTP không hợp lệ hoặc đã hết hạn!';
        Alert.alert('Xác thực thất bại', msg);
        setLoading(false);
        return;
      }

      // 2. Đăng ký tài khoản
      const registerPayload = {
        Email: formData.email,
        MatKhau: formData.matKhau,
        XacNhanMatKhau: formData.matKhau
      };
      await authService.register(registerPayload);

      Alert.alert('Thành công', 'Tài khoản của bạn đã được khởi tạo thành công.', [
        { text: 'Đăng nhập ngay', onPress: () => navigation.replace('Login') }
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || (typeof err.response?.data === 'string' ? err.response.data : null) || 'Có lỗi xảy ra khi tạo tài khoản.';
      Alert.alert('Lỗi đăng ký', msg);
    } finally {
      setLoading(false);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Render 6 ô tròn OTP
  const renderOtpDigits = () => {
    const digits = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i] || '';
      const isCurrent = otp.length === i;
      digits.push(
        <View 
          key={i} 
          style={[
            styles.otpCircle, 
            char ? styles.otpCircleFilled : null,
            isCurrent && isFocused ? styles.otpCircleActive : null
          ]}
        >
          <Text style={styles.otpChar}>{char}</Text>
        </View>
      );
    }
    return digits;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
        {/* Layered Waves Header */}
        <View style={styles.headerContainer}>
          {/* Custom Back Arrow */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ hovered, pressed }) => [
              styles.backArrowWrapper,
              {
                transform: [{ scale: pressed ? 0.9 : (Platform.OS === 'web' && hovered) ? 1.1 : 1 }]
              }
            ]}
          >
            <Text style={styles.backArrowText}>←</Text>
          </Pressable>

          <View style={styles.waveBackground} />
          <LinearGradient
            colors={['#e62e43', '#c01b30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.waveForeground}
          >
            <View style={styles.headerContent}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoHeart}>♥</Text>
              </View>
              <Text style={styles.headerTitle}>HỆ THỐNG HIẾN MÁU</Text>
              <Text style={styles.headerSubtitle}>TP. ĐÀ NẴNG</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Floating Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Phone Illustration from Mockup 1 */}
            <View style={styles.illustrationContainer}>
              <View style={styles.phoneBody}>
                <View style={styles.phoneScreen}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                </View>
                <View style={styles.phoneButton} />
              </View>
            </View>

            <Text style={styles.formTitle}>Xác Thực Email</Text>
            <Text style={styles.formDesc}>
              Chúng tôi đã gửi mã OTP gồm 6 chữ số đến email:{'\n'}
              <Text style={styles.emailText}>{formData?.email}</Text>
            </Text>

            {/* Hidden Input for OTP */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              keyboardType="number-pad"
              style={styles.hiddenInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            {/* OTP circles row with Hover effect */}
            <Pressable 
              activeOpacity={1} 
              onPress={focusInput} 
              style={({ hovered }) => [
                styles.otpRow,
                (Platform.OS === 'web' && hovered) && styles.otpRowHovered
              ]}
            >
              {renderOtpDigits()}
            </Pressable>

            {/* Submit Button */}
            <Pressable
              onPress={handleVerifyAndRegister}
              disabled={loading}
              style={({ hovered, pressed }) => [
                styles.buttonWrapper,
                {
                  transform: [
                    { scale: pressed ? 0.96 : (Platform.OS === 'web' && hovered) ? 1.03 : 1 }
                  ],
                  shadowOpacity: (Platform.OS === 'web' && hovered) ? 0.35 : 0.22,
                  shadowRadius: (Platform.OS === 'web' && hovered) ? 12 : 6,
                  elevation: pressed ? 2 : (Platform.OS === 'web' && hovered) ? 6 : 3
                }
              ]}
            >
              <LinearGradient
                colors={['#e62e43', '#c01b30']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>XÁC NHẬN VÀ HOÀN TẤT</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Resend Code Timer */}
            <View style={styles.resendContainer}>
              {resendLoading ? (
                <ActivityIndicator color="#e62e43" />
              ) : countdown > 0 ? (
                <Text style={styles.countdownText}>Gửi lại mã sau {countdown} giây</Text>
              ) : (
                <Pressable onPress={handleResendOtp}>
                  {({ hovered, pressed }) => (
                    <Text style={[
                      styles.resendText,
                      {
                        color: (Platform.OS === 'web' && hovered) ? '#c01b30' : '#e62e43',
                        textDecorationLine: (Platform.OS === 'web' && hovered) ? 'underline' : 'none',
                        transform: [{ scale: pressed ? 0.96 : 1 }]
                      }
                    ]}>
                      GỬI LẠI MÃ OTP
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Back to Edit Link */}
        <Pressable 
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
          style={styles.backButtonWrapper}
        >
          {({ hovered, pressed }) => (
            <Text style={[
              styles.backText,
              {
                color: (Platform.OS === 'web' && hovered) ? '#666' : '#888',
                textDecorationLine: (Platform.OS === 'web' && hovered) ? 'underline' : 'none',
                transform: [{ scale: pressed ? 0.96 : 1 }]
              }
            ]}>
              Quay lại chỉnh sửa email
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf8f9' },
  scrollInner: { flexGrow: 1, paddingBottom: 24 },
  backArrowWrapper: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '150ms',
        cursor: 'pointer'
      }
    })
  },
  backArrowText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 22
  },
  headerContainer: {
    height: 240,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20
  },
  waveBackground: {
    position: 'absolute',
    top: -110,
    left: -40,
    width: width + 80,
    height: 310,
    backgroundColor: 'rgba(230, 46, 67, 0.12)',
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 200,
    transform: [{ rotate: '-4deg' }]
  },
  waveForeground: {
    position: 'absolute',
    top: -130,
    left: -50,
    width: width + 100,
    height: 320,
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
    transform: [{ rotate: '2deg' }]
  },
  headerContent: {
    alignItems: 'center',
    width: width,
    transform: [{ rotate: '-2deg' }]
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  logoHeart: { color: '#e62e43', fontSize: 32, fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: 2, marginTop: 1 },
  cardContainer: {
    paddingHorizontal: 24,
    marginTop: -40,
    zIndex: 10
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center'
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  phoneBody: {
    width: 70,
    height: 120,
    borderWidth: 3.5,
    borderColor: '#e8ecef',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneButton: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e8ecef',
    marginTop: 3
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2e86de',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2e86de',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
  checkIcon: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 6, textAlign: 'center' },
  formDesc: { fontSize: 13.5, color: '#666', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  emailText: { fontWeight: 'bold', color: '#333' },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 24,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    // transition for web
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '150ms'
      }
    })
  },
  otpRowHovered: {
    borderColor: 'rgba(230, 46, 67, 0.15)',
    backgroundColor: '#fdf8f9'
  },
  otpCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#e8ecef',
    backgroundColor: '#f8f9fa'
  },
  otpCircleFilled: {
    borderColor: '#e62e43',
    backgroundColor: '#fdf8f9'
  },
  otpCircleActive: {
    borderColor: '#2e86de',
    borderWidth: 2,
    backgroundColor: '#fff'
  },
  otpChar: { fontSize: 20, fontWeight: 'bold', color: '#111', textAlign: 'center', lineHeight: 39 },
  buttonWrapper: {
    borderRadius: 25,
    shadowColor: '#e62e43',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '150ms'
      }
    })
  },
  gradientButton: {
    height: 50,
    width: width - 96,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  resendContainer: { alignItems: 'center', marginTop: 20 },
  countdownText: { color: '#999', fontSize: 14, fontWeight: '500' },
  resendText: { fontSize: 14, fontWeight: 'bold' },
  backButtonWrapper: { marginTop: 24, alignItems: 'center', marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '500' }
});
