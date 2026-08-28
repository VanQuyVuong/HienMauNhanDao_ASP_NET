// src/screens/LoginScreen.jsx
import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/api';
import DonationImage from '../../assets/images/donation.png';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States for Input Hover and Focus
  const [emailHovered, setEmailHovered] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordHovered, setPasswordHovered] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const clearSession = async () => {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('email');
    };
    clearSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email: email.trim(), matKhau: password });
      const resData = response.data?.success ? response.data.data : (response.data ?? response);
      
      const token = resData.accessToken || resData.access_token || resData.token;
      const role = resData.maVaiTro;

      if (role !== 'TNV') {
        Alert.alert('Từ chối truy cập', 'Tài khoản nội bộ không được phép đăng nhập trên ứng dụng di động!');
        setLoading(false);
        return;
      }

      if (token) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('email', resData.email || email);
        Alert.alert('Thành công', 'Đăng nhập thành công', [
          { text: 'OK', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy token trong phản hồi từ server');
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.';
      Alert.alert('Lỗi đăng nhập', typeof errorMsg === 'string' ? errorMsg : 'Đăng nhập thất bại.');
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
          {/* Wave Layer 1: Background wave */}
          <View style={styles.waveBackground} />

          {/* Wave Layer 2: Foreground wave (Gradient) */}
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

            <Text style={styles.formTitle}>Đăng Nhập</Text>
            <Text style={styles.formDesc}>Vui lòng điền thông tin email và mật khẩu của bạn.</Text>

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

            {/* Submit Button with Gradient & Pressable interactions */}
            <Pressable
              onPress={handleLogin}
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
                  <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Footer Navigation */}
            <View style={styles.footer}>
              <Pressable onPress={() => navigation.navigate('Register')}>
                {({ hovered, pressed }) => (
                  <Text style={[
                    styles.footerLink,
                    {
                      color: (Platform.OS === 'web' && hovered) ? '#c01b30' : '#e62e43',
                      textDecorationLine: (Platform.OS === 'web' && hovered) ? 'underline' : 'none',
                      transform: [{ scale: pressed ? 0.96 : 1 }]
                    }
                  ]}>
                    Đăng ký tài khoản
                  </Text>
                )}
              </Pressable>
              
              <Text style={styles.divider}>|</Text>

              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                {({ hovered, pressed }) => (
                  <Text style={[
                    styles.footerLink,
                    {
                      color: (Platform.OS === 'web' && hovered) ? '#c01b30' : '#e62e43',
                      textDecorationLine: (Platform.OS === 'web' && hovered) ? 'underline' : 'none',
                      transform: [{ scale: pressed ? 0.96 : 1 }]
                    }
                  ]}>
                    Quên mật khẩu?
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Slogan Slogan */}
        <View style={styles.sloganContainer}>
          <Text style={styles.sloganText}>
            "Mỗi giọt máu cho đi, một cuộc đời ở lại. Cảm ơn bạn đã luôn đồng hành cùng chúng tôi."
          </Text>
        </View>
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
  formDesc: { fontSize: 13, color: '#666', marginBottom: 20 },
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
    outlineStyle: 'none' // remove web focus outline
  },
  eyeButton: { padding: 4 },
  eyeText: { color: '#e62e43', fontSize: 13, fontWeight: 'bold' },
  buttonWrapper: {
    marginTop: 10,
    borderRadius: 25,
    shadowColor: '#e62e43',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    // Add smooth CSS transition for web
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center' },
  footerLink: { fontSize: 14, fontWeight: 'bold' },
  divider: { marginHorizontal: 16, color: '#eee' },
  sloganContainer: { marginTop: 28, paddingHorizontal: 32 },
  sloganText: { fontSize: 13, color: '#888', fontStyle: 'italic', textAlign: 'center', lineHeight: 18 }
});
