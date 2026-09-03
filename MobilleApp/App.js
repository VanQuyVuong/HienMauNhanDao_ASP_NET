// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Import Custom Liquid Bottom Tab Bar
import LiquidTabBar from "./src/components/LiquidTabBar";

// Import các màn hình Xác thực
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import OtpVerificationScreen from "./src/screens/OtpVerificationScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";

// Import 4 màn hình chính của Bottom Tab Bar
import HomeScreen from "./src/screens/HomeScreen";
import NewsScreen from "./src/screens/NewsScreen";
import CampaignScreen from "./src/screens/CampaignScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

// Import các màn hình Chi tiết & Phụ
import RegisterDonateScreen from "./src/screens/RegisterDonateScreen";
import UpdateProfileScreen from "./src/screens/UpdateProfileScreen";
import DonationHistoryScreen from "./src/screens/DonationHistoryScreen";
import NewsDetailScreen from "./src/screens/NewsDetailScreen";
import CampaignDetailScreen from "./src/screens/CampaignDetailScreen";
import RegistrationTicketScreen from "./src/screens/RegistrationTicketScreen";

// ─── 1. BOTTOM TAB NAVIGATOR VỚI LIQUID TAB BAR ──────────
const Tab = createBottomTabNavigator();

function MainApp() {
  return (
    <Tab.Navigator
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="TrangChu" component={HomeScreen} />
      <Tab.Screen name="TinTuc" component={NewsScreen} />
      <Tab.Screen name="ChienDich" component={CampaignScreen} />
      <Tab.Screen name="HoSo" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── 2. STACK NAVIGATOR GỐC ────────────────────────────
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Màn hình Xác thực */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Màn hình Chính (Chứa Liquid Bottom Tab Navigator 4 tabs) */}
        <Stack.Screen name="Home" component={MainApp} />

        {/* Màn hình Đăng ký Hiến máu */}
        <Stack.Screen name="DangKyHienMau" component={RegisterDonateScreen} />

        {/* Màn hình Chi tiết & Phụ */}
        <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
        <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
        <Stack.Screen name="RegistrationTicket" component={RegistrationTicketScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
