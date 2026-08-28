// src/screens/RegisterScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { authService } from "../services/api";

export default function RegisterScreen({ route, navigation }) {
  // Lấy emailVerified được truyền ngược lại từ màn hình OTP sau khi xác thực thành công
  const emailVerified = route.params?.emailVerified || false;
  const verifiedEmail = route.params?.email || "";

  // Khai báo state
  const [email, setEmail] = useState(verifiedEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý chung cho nút bấm hành động
  const handleRegisterOrSendOtp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ các thông tin");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      if (!emailVerified) {
        // Giai đoạn 1: Gửi OTP trước
        await authService.sendOtp(email.trim());
        Alert.alert(
          "Thành công",
          "Mã OTP đã được gửi thành công. Vui lòng kiểm tra email của bạn.",
          [
            {
              text: "Nhập OTP",
              onPress: () =>
                navigation.navigate("OtpVerification", { email: email.trim() }),
            },
          ],
        );
      } else {
        // Giai đoạn 2: Đăng ký chính thức khi đã xác thực OTP thành công
        const response = await authService.register({
          email: email.trim(),
          matKhau: password,
          xacNhanMatKhau: confirmPassword,
        });

        if (response.data?.success || response.status === 200) {
          Alert.alert(
            "Đăng ký thành công",
            "Tài khoản của bạn đã được khởi tạo thành công.",
            [
              {
                text: "Đăng nhập ngay",
                onPress: () => navigation.replace("Login"),
              },
            ],
          );
        } else {
          Alert.alert(
            "Đăng ký thất bại",
            response.data?.message || "Có lỗi xảy ra",
          );
        }
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi trong quá trình xử lý";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>
      <Text style={styles.subtitle}>
        {emailVerified
          ? "Email của bạn đã được xác thực thành công. Nhập mật khẩu để hoàn tất đăng ký."
          : "Nhập Email của bạn để nhận mã OTP xác thực trước."}
      </Text>

      {/* Ô nhập Email: Nếu đã xác thực thì không cho chỉnh sửa nữa */}
      <TextInput
        placeholder="Địa chỉ Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, emailVerified && styles.disabledInput]}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!emailVerified} // editable = false sẽ khoá không cho gõ
      />
      <TextInput
        placeholder="Mật khẩu (tối thiểu 6 ký tự)"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Xác nhận mật khẩu"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegisterOrSendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {emailVerified ? "Hoàn tất Đăng ký" : "Nhận mã OTP Xác thực"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.backText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#b7102a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e3e4",
    backgroundColor: "#fff",
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#e9ecef", // Tô màu xám nền khi bị khoá
    color: "#495057",
  },
  button: {
    backgroundColor: "#b7102a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backButton: { marginTop: 24, alignItems: "center" },
  backText: { color: "#666", fontSize: 15, fontWeight: "500" },
});
