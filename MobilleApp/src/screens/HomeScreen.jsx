// src/screens/HomeScreen.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";

export default function HomeScreen({ navigation }) {
  // 1. Quản lý trạng thái dữ liệu (State)
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState("");

  // 2. Hàm gọi API từ Backend C#
  const fetchHomeData = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) setEmail(storedEmail);

      // Gọi đồng thời 2 API lấy Chiến dịch & Thông tin cá nhân
      const [campRes, profileRes] = await Promise.allSettled([
        api.get(ENDPOINTS.CHIEN_DICH.GET_ALL),
        api.get(ENDPOINTS.TNV.ME),
      ]);

      if (campRes.status === "fulfilled") {
        const all = campRes.value.data?.data || campRes.value.data || [];
        setCampaigns(Array.isArray(all) ? all : []);
      }

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data?.data || null);
      }
    } catch (e) {
      console.warn("Lỗi tải dữ liệu Trang chủ:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  // Màn hình chờ khi đang nạp dữ liệu từ Backend
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang tải dữ liệu hệ thống...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={{ margin: 20, fontSize: 16 }}>
        Đã tải xong dữ liệu Trang chủ!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },
});
