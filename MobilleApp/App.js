// App.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import các màn hình
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OtpVerificationScreen from './src/screens/OtpVerificationScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// 1. Tạo màn hình Home tạm thời
function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('email');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Chào mừng đến với Hệ thống!</Text>
      <Text style={styles.desc}>Bạn đã đăng nhập thành công.</Text>
      <Button title="Đăng xuất" onPress={handleLogout} color="#e62e43" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdf8f9' },
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#c01b30', marginBottom: 8 },
  desc: { fontSize: 15, color: '#666', marginBottom: 24 }
});

// 2. Cấu hình Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#e62e43' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'black' },
        }}>
        
        {/* Màn hình Đăng nhập (Ẩn header thanh trên vì đã có thiết kế riêng) */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        
        {/* Màn hình Đăng ký */}
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        
        {/* Màn hình Xác thực OTP */}
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerificationScreen}
          options={{ headerShown: false }}
        />

        {/* Màn hình Quên mật khẩu */}
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        
        {/* Màn hình Trang chủ tạm thời */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Trang chủ Hiến máu Nhân đạo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
