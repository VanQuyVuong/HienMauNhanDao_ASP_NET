// App.js
import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import các màn hình Xác thực
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OtpVerificationScreen from './src/screens/OtpVerificationScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Import các màn hình chính (Bottom Tab Bar)
import HomeScreen from './src/screens/HomeScreen';
import CampaignScreen from './src/screens/CampaignScreen';
import RegisterDonateScreen from './src/screens/RegisterDonateScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UpdateProfileScreen from './src/screens/UpdateProfileScreen';

// ─── 1. TẠO BOTTOM TAB NAVIGATOR ────────────────────────
const Tab = createBottomTabNavigator();

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let emoji;
          if (route.name === 'TrangChu') emoji = '🏠';
          else if (route.name === 'ChienDich') emoji = '📋';
          else if (route.name === 'DangKyHienMau') emoji = '🩸';
          else if (route.name === 'HoSo') emoji = '👤';
          return (
            <Text style={{
              fontSize: focused ? 22 : 19,
              opacity: focused ? 1 : 0.6,
            }}>
              {emoji}
            </Text>
          );
        },
        tabBarActiveTintColor: '#e62e43',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="TrangChu"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="ChienDich"
        component={CampaignScreen}
        options={{ tabBarLabel: 'Chiến dịch' }}
      />
      <Tab.Screen
        name="DangKyHienMau"
        component={RegisterDonateScreen}
        options={{ tabBarLabel: 'Hiến máu' }}
      />
      <Tab.Screen
        name="HoSo"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}

// ─── 2. STACK NAVIGATOR (GỐC) ──────────────────────────
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Màn hình Đăng nhập */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Màn hình Đăng ký */}
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Màn hình Xác thực OTP */}
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />

        {/* Màn hình Quên mật khẩu */}
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Màn hình Trang chủ chính (Bottom Tab Navigator 4 tabs) */}
        <Stack.Screen name="Home" component={MainApp} />

        {/* Màn hình Cập nhật Hồ sơ cá nhân */}
        <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
