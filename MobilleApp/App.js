// App.js
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import các màn hình chúng ta đã thực hiện
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import OtpVerificationScreen from "./src/screens/OtpVerificationScreen";

// 1. Tạo màn hình Home tạm thời để kiểm thử sau khi đăng nhập thành công
function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    // Xoá token và email đã lưu để đăng xuất
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("email");

    // Quay lại màn hình Login và xoá Home khỏi stack điều hướng
    navigation.replace("Login");
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#b7102a",
    marginBottom: 8,
  },
  desc: { fontSize: 16, color: "#666", marginBottom: 24 },
});

// 2. Cấu hình Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login" // Màn hình mặc định hiện lên đầu tiên khi mở App
        screenOptions={{
          headerStyle: { backgroundColor: "#b7102a" }, // Màu đỏ chủ đạo của header bar
          headerTintColor: "#fff", // Màu chữ trắng trên header bar
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
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
          options={{ title: "Đăng ký tài khoản" }}
        />

        {/* Màn hình Xác thực OTP */}
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerificationScreen}
          options={{ title: "Xác thực mã OTP" }}
        />

        {/* Màn hình Trang chủ tạm thời */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Trang chủ VitalStream" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
