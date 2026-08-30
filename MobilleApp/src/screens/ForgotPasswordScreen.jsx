// src/screens/ForgotPasswordScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedInput from '../components/AnimatedInput';
import { authService } from '../services/api';
import DonationImage from '../../assets/images/donation.png';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [step, setStep] = useState(1); // step 1: nhập email gửi OTP, step 2: nhập OTP & mật khẩu mới
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // State báo lỗi & kích hoạt hiệu ứng Shake
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  // Bộ đếm ngược 60 giây gửi lại OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Gửi OTP yêu cầu quên mật khẩu
  const handleSendOtp = async () => {
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Vui lòng nhập địa chỉ email của bạn');
      setShakeKey(k => k + 1);
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setCountdown(60);
      setStep(2); // Chuyển sang bước 2 để nhập mã và mật khẩu mới
      Alert.alert('Thành công', 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra.');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.Message || (typeof error.response?.data === 'string' ? error.response.data : null) || 'Email này chưa được đăng ký tài khoản hoặc lỗi kết nối';
      setErrorMsg(msg);
      setShakeKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận đặt lại mật khẩu mới
  const handleResetPassword = async () => {
    setErrorMsg('');
    if (!otp || !newPassword || !confirmNewPassword) {
      setErrorMsg('Vui lòng điền đầy đủ OTP và mật khẩu mới');
      setShakeKey(k => k + 1);
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự');
      setShakeKey(k => k + 1);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp');
      setShakeKey(k => k + 1);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword
      });

      Alert.alert('Thành công', 'Mật khẩu của bạn đã được đặt lại thành công.', [
        { text: 'Đăng nhập ngay', onPress: () => navigation.replace('Login') }
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.Message || (typeof error.response?.data === 'string' ? error.response.data : null) || 'Lỗi khi đặt lại mật khẩu. Mã OTP có thể đã hết hạn.';
      setErrorMsg(msg);
      setShakeKey(k => k + 1);
    } finally {
      setLoading(false);
    }
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

        {/* Floating Card Container */}
        <View style={styles.cardContainer}>
          {step === 1 ? (
            // BƯỚC 1: NHẬP EMAIL ĐỂ LẤY MÃ OTP
            <View style={styles.card}>
              {/* Chibi Donation Illustration */}
              <Image
                source={DonationImage}
                style={styles.doctorImg}
                resizeMode="contain"
              />

              <Text style={styles.formTitle}>Quên Mật Khẩu</Text>
              <Text style={styles.formDesc}>
                Nhập email đã đăng ký tài khoản của bạn để nhận mã xác thực OTP đặt lại mật khẩu.
              </Text>

              {/* Email Input */}
              <AnimatedInput
                label="Địa chỉ Email"
                icon="✉"
                value={email}
                onChangeText={(val) => { setEmail(val); setErrorMsg(''); }}
                keyboardType="email-address"
                shakeKey={shakeKey}
              />

              {/* Inline Error Alert Area */}
              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠ {errorMsg}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <Pressable
                onPress={handleSendOtp}
                disabled={loading}
                style={({ hovered, pressed }) => [
                  styles.buttonWrapper,
                  {
                    transform: [
                      { scale: pressed ? 0.92 : (Platform.OS === 'web' && hovered) ? 1.05 : 1 }
                    ],
                    shadowOpacity: (Platform.OS === 'web' && hovered) ? 0.45 : 0.22,
                    shadowRadius: (Platform.OS === 'web' && hovered) ? 14 : 6,
                    elevation: pressed ? 1 : (Platform.OS === 'web' && hovered) ? 7 : 3
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
                    <Text style={styles.buttonText}>GỬI MÃ OTP</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            // BƯỚC 2: NHẬP MÃ OTP VÀ MẬT KHẨU MỚI
            <View style={styles.card}>
              {/* Chibi Donation Illustration */}
              <Image
                source={DonationImage}
                style={styles.doctorImg}
                resizeMode="contain"
              />

              <Text style={styles.formTitle}>Đặt Lại Mật Khẩu</Text>
              <Text style={styles.formDesc}>
                Nhập mã OTP gồm 6 số đã được gửi về email <Text style={styles.boldRed}>{email}</Text> và thiết lập mật khẩu mới.
              </Text>

              {/* OTP Code Input */}
              <AnimatedInput
                label="Mã OTP (6 số)"
                icon="🔑"
                value={otp}
                onChangeText={(val) => { setOtp(val); setErrorMsg(''); }}
                keyboardType="number-pad"
                maxLength={6}
                shakeKey={shakeKey}
              />

              {/* Password Input */}
              <AnimatedInput
                label="Mật khẩu mới (tối thiểu 6 ký tự)"
                icon="🔒"
                value={newPassword}
                onChangeText={(val) => { setNewPassword(val); setErrorMsg(''); }}
                showToggle
                shakeKey={shakeKey}
              />

              {/* Confirm Password Input */}
              <AnimatedInput
                label="Xác nhận mật khẩu mới"
                icon="🔒"
                value={confirmNewPassword}
                onChangeText={(val) => { setConfirmNewPassword(val); setErrorMsg(''); }}
                showToggle
                shakeKey={shakeKey}
              />

              {/* Inline Error Alert Area */}
              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠ {errorMsg}</Text>
                </View>
              ) : null}

              {/* Reset Password Button */}
              <Pressable
                onPress={handleResetPassword}
                disabled={loading}
                style={({ hovered, pressed }) => [
                  styles.buttonWrapper,
                  {
                    transform: [
                      { scale: pressed ? 0.92 : (Platform.OS === 'web' && hovered) ? 1.05 : 1 }
                    ],
                    shadowOpacity: (Platform.OS === 'web' && hovered) ? 0.45 : 0.22,
                    shadowRadius: (Platform.OS === 'web' && hovered) ? 14 : 6,
                    elevation: pressed ? 1 : (Platform.OS === 'web' && hovered) ? 7 : 3
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
                    <Text style={styles.buttonText}>XÁC NHẬN ĐẶT LẠI MẬT KHẨU</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Resend Timer */}
              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>Gửi lại mã sau {countdown} giây</Text>
                ) : (
                  <Pressable onPress={handleSendOtp}>
                    {({ hovered, pressed }) => (
                      <Text style={[
                        styles.resendText,
                        {
                          color: (Platform.OS === 'web' && hovered) ? '#c01b30' : '#e62e43',
                          textDecorationLine: (Platform.OS === 'web' && hovered) ? 'underline' : 'none',
                          transform: [{ scale: pressed ? 0.96 : 1 }]
                        }
                      ]}>
                        Gửi lại mã OTP
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Back Link */}
        <Pressable 
          onPress={() => navigation.navigate('Login')}
          style={styles.backButton}
        >
          {({ hovered, pressed }) => (
            <Text style={[
              styles.backText,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }]
              }
            ]}>
              Quay lại <Text style={[styles.boldRed, (Platform.OS === 'web' && hovered) && { textDecorationLine: 'underline', color: '#c01b30' }]}>Đăng nhập</Text>
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
    elevation: 4
  },
  doctorImg: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 12,
  },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  formDesc: { fontSize: 13.5, color: '#666', marginBottom: 20, lineHeight: 20 },
  boldRed: { fontWeight: 'bold', color: '#e62e43' },
  // inputWrapper, pillInput đã chuyển sang AnimatedInput component
  buttonWrapper: {
    borderRadius: 25,
    shadowColor: '#e62e43',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '150ms'
      }
    })
  },
  gradientButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  errorContainer: {
    backgroundColor: '#ffeef0',
    borderColor: '#fdbdc3',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorText: {
    color: '#e62e43',
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1
  },
  backButton: { marginTop: 24, alignItems: 'center', marginBottom: 12 },
  backText: { color: '#666', fontSize: 14, fontWeight: '500' },
  resendContainer: { alignItems: 'center', marginTop: 20 },
  countdownText: { color: '#999', fontSize: 14, fontWeight: '500' },
  resendText: { fontSize: 14, fontWeight: 'bold' }
});
