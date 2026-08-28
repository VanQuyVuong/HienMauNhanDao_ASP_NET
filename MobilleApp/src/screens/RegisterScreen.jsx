// src/screens/RegisterScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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

  // States for Input Hover and Focus
  const [emailHovered, setEmailHovered] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordHovered, setPasswordHovered] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordHovered, setConfirmPasswordHovered] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ các thông tin.');
      return;
    }

    if (!agreed) {
      Alert.alert('Thông báo', 'Bạn phải đồng ý với điều khoản sử dụng để tiếp tục.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Thông báo', 'Mật khẩu phải dài hơn 6 ký tự và bao gồm cả chữ cái và số.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp!');
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
      const msg = error.response?.data?.message || error.response?.data || 'Lỗi kết nối server. Vui lòng kiểm tra backend.';
      Alert.alert('Lỗi gửi OTP', typeof msg === 'string' ? msg : 'Lỗi kết nối. Vui lòng thử lại.');
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
            <View 
              style={[
                styles.inputWrapper,
                emailHovered && styles.inputWrapperHovered,
                emailFocused && styles.inputWrapperFocused
              ]}
              onMouseEnter={() => Platform.OS === 'web' && setEmailHovered(true)}
              onMouseLeave={() => Platform.OS === 'web' && setEmailHovered(false)}
            >
              <Text style={[
                styles.inputIcon,
                (emailHovered || emailFocused) && styles.inputIconActive
              ]}>✉</Text>
              <TextInput
                placeholder="Địa chỉ Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                style={styles.pillInput}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password Input */}
            <View 
              style={[
                styles.inputWrapper,
                passwordHovered && styles.inputWrapperHovered,
                passwordFocused && styles.inputWrapperFocused
              ]}
              onMouseEnter={() => Platform.OS === 'web' && setPasswordHovered(true)}
              onMouseLeave={() => Platform.OS === 'web' && setPasswordHovered(false)}
            >
              <Text style={[
                styles.inputIcon,
                (passwordHovered || passwordFocused) && styles.inputIconActive
              ]}>🔒</Text>
              <TextInput
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.pillInput}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={({ pressed }) => [
                  styles.eyeButton,
                  { transform: [{ scale: pressed ? 0.9 : 1 }] }
                ]}
              >
                {({ hovered }) => (
                  <Text style={[
                    styles.eyeText,
                    (Platform.OS === 'web' && hovered) && { textDecorationLine: 'underline', color: '#c01b30' }
                  ]}>
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Confirm Password Input */}
            <View 
              style={[
                styles.inputWrapper,
                confirmPasswordHovered && styles.inputWrapperHovered,
                confirmPasswordFocused && styles.inputWrapperFocused
              ]}
              onMouseEnter={() => Platform.OS === 'web' && setConfirmPasswordHovered(true)}
              onMouseLeave={() => Platform.OS === 'web' && setConfirmPasswordHovered(false)}
            >
              <Text style={[
                styles.inputIcon,
                (confirmPasswordHovered || confirmPasswordFocused) && styles.inputIconActive
              ]}>🔒</Text>
              <TextInput
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.pillInput}
                autoCapitalize="none"
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={({ pressed }) => [
                  styles.eyeButton,
                  { transform: [{ scale: pressed ? 0.9 : 1 }] }
                ]}
              >
                {({ hovered }) => (
                  <Text style={[
                    styles.eyeText,
                    (Platform.OS === 'web' && hovered) && { textDecorationLine: 'underline', color: '#c01b30' }
                  ]}>
                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                  </Text>
                )}
              </Pressable>
            </View>

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

            {/* Submit Button with Gradient */}
            <Pressable
              onPress={handleSendOtp}
              disabled={loading || !agreed}
              style={({ hovered, pressed }) => [
                styles.buttonWrapper,
                {
                  transform: [
                    { scale: pressed ? 0.96 : (Platform.OS === 'web' && hovered && agreed) ? 1.03 : 1 }
                  ],
                  shadowOpacity: (Platform.OS === 'web' && hovered && agreed) ? 0.35 : 0.22,
                  shadowRadius: (Platform.OS === 'web' && hovered && agreed) ? 12 : 6,
                  elevation: pressed ? 2 : (Platform.OS === 'web' && hovered && agreed) ? 6 : 3,
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>Đã có tài khoản? <Text style={styles.boldRed}>Đăng nhập</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf8f9' },
  scrollInner: { flexGrow: 1, paddingBottom: 24 },
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e8ecef',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '150ms'
      }
    })
  },
  inputIcon: { fontSize: 18, color: '#999', marginRight: 10, transitionProperty: 'color', transitionDuration: '150ms' },
  inputIconActive: { color: '#e62e43' },
  inputWrapperHovered: {
    borderColor: 'rgba(230, 46, 67, 0.35)',
    backgroundColor: '#fff'
  },
  inputWrapperFocused: {
    borderColor: '#e62e43',
    backgroundColor: '#fff',
    shadowColor: '#e62e43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1
  },
  pillInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    height: '100%',
    outlineStyle: 'none'
  },
  eyeButton: { padding: 4 },
  eyeText: { color: '#e62e43', fontSize: 13, fontWeight: 'bold' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, marginBottom: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#ccc', borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', transitionProperty: 'border-color', transitionDuration: '150ms' },
  checkboxChecked: { backgroundColor: '#e62e43', borderColor: '#e62e43' },
  checkboxIcon: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  linkText: { color: '#e62e43', fontWeight: 'bold' },
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
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  backButton: { marginTop: 24, alignItems: 'center', marginBottom: 12 },
  backText: { color: '#666', fontSize: 14, fontWeight: '500' },
  boldRed: { color: '#e62e43', fontWeight: 'bold' }
});
