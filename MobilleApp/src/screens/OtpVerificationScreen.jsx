// src/screens/OtpVerificationScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { authService } from "../services/api";

export default function OtpVerificationScreen({ route, navigation }) {
  const { email } = route.params || { email: "tnv@gmail.com" };
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendOtp = async () => {
    try {
      await authService.sendOtp(email);
      setCountdown(60);
      Alert.alert("Thành công", "Mã OTP mới đã được gửi đến email của bạn");
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi lại mã OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      Alert.alert("Thông báo", "Vui lòng nhập đủ 6 ký tự mã OTP");
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp(email, otpCode.trim());
      Alert.alert("Xác thực thành công", "Email của bạn đã được xác thực thành công", [
        {
          text: "Đăng ký ngay",
          onPress: () => navigation.navigate("Register", { email, emailVerified: true })
        }
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn!";
      Alert.alert("Xác thực thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Xác thực OTP</Text>
        <Text style={styles.subtitle}>Mã OTP đã được gửi về email {email}. Vui lòng kiểm tra và nhập mã vào bên dưới.</Text>

        <TextInput
          placeholder="Nhập 6 ký tự mã OTP"
          placeholderTextColor="#999"
          value={otpCode}
          onChangeText={setOtpCode}
          maxLength={6}
          style={styles.input}
          keyboardType="number-pad"
          textAlign="center"
        />

        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác thực</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Gửi lại mã sau {countdown} giây</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendText}>Gửi lại mã OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#b7102a', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  input: {
    borderWidth: 1,
    borderColor: '#e1e3e4',
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#b7102a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resendContainer: { alignItems: 'center', marginTop: 24 },
  countdownText: { color: '#999', fontSize: 15 },
  resendText: { color: '#b7102a', fontSize: 15, fontWeight: 'bold', textDecorationLine: 'underline' }
});
