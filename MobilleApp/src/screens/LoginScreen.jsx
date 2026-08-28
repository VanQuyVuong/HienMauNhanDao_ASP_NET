// src/screens/LoginScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email: email.trim(), matKhau: password });
      const resData = response.data;
      if (resData.success) {
        const token = resData.data?.access_token || resData.data?.token;
        if (token) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('email', email);
          Alert.alert('Thành công', 'Đăng nhập thành công', [
            { text: 'OK', onPress: () => navigation.replace('Home') }
          ]);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy token trong phản hồi từ server');
        }
      } else {
        Alert.alert('Lỗi', resData.message || 'Đăng nhập thất bại');
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message || 'Lỗi kết nối đến server';
      Alert.alert('Lỗi đăng nhập', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>VitalStream</Text>
      <Text style={styles.subText}>Hiến Máu Nhân Đạo Đà Nẵng</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Đăng ký tài khoản</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>|</Text>
        <TouchableOpacity onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}>
          <Text style={styles.footerLink}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#b7102a', textAlign: 'center', marginBottom: 8 },
  subText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#e1e3e4',
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#b7102a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#b7102a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center' },
  footerLink: { color: '#b7102a', fontSize: 15, fontWeight: '600' },
  divider: { marginHorizontal: 12, color: '#ccc' }
});
