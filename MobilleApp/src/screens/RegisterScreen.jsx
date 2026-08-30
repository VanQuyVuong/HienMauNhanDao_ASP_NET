// src/screens/RegisterScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
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

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State báo lỗi & kích hoạt hiệu ứng Shake
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const handleSendOtp = async () => {
    setErrorMsg('');
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin.');
      setShakeKey(k => k + 1);
      return;
    }

    if (!agreed) {
      setErrorMsg('Bạn phải đồng ý với điều khoản sử dụng để tiếp tục.');
      setShakeKey(k => k + 1);
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMsg('Mật khẩu phải dài hơn 6 ký tự và bao gồm cả chữ cái và số.');
      setShakeKey(k => k + 1);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      setShakeKey(k => k + 1);
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(email.trim());
      navigation.navigate('OtpVerification', {
        formData: {
          email: email.trim(),
          matKhau: password
        }
      });
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.Message || (typeof error.response?.data === 'string' ? error.response.data : null) || 'Lỗi kết nối server. Vui lòng kiểm tra backend.';
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

        {/* Floating Card Form */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Chibi Donation Illustration */}
            <Image
              source={DonationImage}
              style={styles.doctorImg}
              resizeMode="contain"
            />

            <Text style={styles.formTitle}>Đăng ký Tài khoản</Text>
            <Text style={styles.formDesc}>
              Đăng ký tài khoản tình nguyện viên ngay hôm nay để nhận thông báo chiến dịch hiến máu mới nhất tại Đà Nẵng.
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

            {/* Password Input */}
            <AnimatedInput
              label="Mật khẩu"
              icon="🔒"
              value={password}
              onChangeText={(val) => { setPassword(val); setErrorMsg(''); }}
              showToggle
              shakeKey={shakeKey}
            />

            {/* Confirm Password Input */}
            <AnimatedInput
              label="Xác nhận mật khẩu"
              icon="🔒"
              value={confirmPassword}
              onChangeText={(val) => { setConfirmPassword(val); setErrorMsg(''); }}
              showToggle
              shakeKey={shakeKey}
            />

            {/* Agree to Terms Checkbox */}
            <Pressable 
              style={styles.checkboxContainer} 
              onPress={() => setAgreed(!agreed)}
            >
              {({ hovered }) => (
                <>
                  <View style={[
                    styles.checkbox, 
                    agreed && styles.checkboxChecked,
                    (Platform.OS === 'web' && hovered) && { borderColor: '#e62e43' }
                  ]}>
                    {agreed && <Text style={styles.checkboxIcon}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Tôi đồng ý với <Text style={styles.linkText}>điều khoản sử dụng</Text> và chính sách bảo mật của hệ thống.
                  </Text>
                </>
              )}
            </Pressable>

            {/* Inline Error Alert Area */}
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠ {errorMsg}</Text>
              </View>
            ) : null}

            {/* Submit Button with Gradient */}
            <Pressable
              onPress={handleSendOtp}
              disabled={loading || !agreed}
              style={({ hovered, pressed }) => [
                styles.buttonWrapper,
                {
                  transform: [
                    { scale: pressed ? 0.92 : (Platform.OS === 'web' && hovered && agreed) ? 1.05 : 1 }
                  ],
                  shadowOpacity: (Platform.OS === 'web' && hovered && agreed) ? 0.45 : 0.22,
                  shadowRadius: (Platform.OS === 'web' && hovered && agreed) ? 14 : 6,
                  elevation: pressed ? 1 : (Platform.OS === 'web' && hovered && agreed) ? 7 : 3,
                  opacity: agreed ? 1 : 0.5
                }
              ]}
            >
              <LinearGradient
                colors={agreed ? ['#e62e43', '#c01b30'] : ['#ccc', '#bbb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>ĐĂNG KÝ NGAY</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Back to Login Link */}
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
              Đã có tài khoản? <Text style={[styles.boldRed, (Platform.OS === 'web' && hovered) && { textDecorationLine: 'underline', color: '#c01b30' }]}>Đăng nhập</Text>
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
  formDesc: { fontSize: 13.5, color: '#666', marginBottom: 20, lineHeight: 18 },
  // inputWrapper, pillInput, eyeButton đã chuyển sang AnimatedInput component
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginBottom: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#ccc', borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', transitionProperty: 'border-color', transitionDuration: '150ms' },
  checkboxChecked: { backgroundColor: '#e62e43', borderColor: '#e62e43' },
  checkboxIcon: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  linkText: { color: '#e62e43', fontWeight: 'bold' },
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
  boldRed: { color: '#e62e43', fontWeight: 'bold' }
});
