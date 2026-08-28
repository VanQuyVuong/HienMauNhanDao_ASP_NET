// App.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OtpVerificationScreen from './src/screens/OtpVerificationScreen';

// Tạo màn hình Home tạm thời để kiểm thử đăng nhập thành công
function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('email');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Chào mừng đến với VitalStream!</Text>
      <Text style={styles.desc}>Bạn đã đăng nhập thành công.</Text>
      <Button title="Đăng xuất" onPress={handleLogout} color="#b7102a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#b7102a', marginBottom: 8 },
  desc: { fontSize: 16, color: '#666', marginBottom: 24 }
});

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#b7102a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Đăng ký tài khoản' }}
        />
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerificationScreen}
          options={{ title: 'Xác thực mã OTP' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Trang chủ VitalStream' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
