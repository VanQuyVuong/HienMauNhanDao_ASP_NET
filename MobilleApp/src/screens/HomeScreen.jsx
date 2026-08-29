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

  // 3. Tính toán dữ liệu hiển thị
  const activeCampaigns = campaigns.filter((c) => c.trangThai === "DangDienRa");
  const displayName = profile?.hoTen || email?.split("@")[0] || "bạn";

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e62e43"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── HEADER ĐỎ & THỐNG KÊ NHANH ────────────────── */}
        <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.greeting}>Xin chào, {displayName}! 👋</Text>
              <Text style={styles.headerSub}>
                Hệ thống Hiến máu Nhân đạo Đà Nẵng
              </Text>
            </View>

            <Pressable
              style={({ hovered, pressed }) => [
                styles.notifBtn,
                pressed && { transform: [{ scale: 0.9 }] },
                Platform.OS === "web" &&
                  hovered && { backgroundColor: "rgba(255,255,255,0.25)" },
              ]}
            >
              <Text style={styles.notifIcon}>🔔</Text>
            </Pressable>
          </View>

          {/* 3 THẺ THỐNG KÊ KÍNH MỜ */}
          <View style={styles.quickRow}>
            <View style={styles.quickCard}>
              <Text style={styles.quickNum}>{activeCampaigns.length}</Text>
              <Text style={styles.quickLabel}>Chiến dịch{"\n"}đang mở</Text>
            </View>

            <View style={[styles.quickCard, styles.quickCardMid]}>
              <Text style={styles.quickNum}>
                {profile?.nhomMau || (profile ? "--" : "?")}
              </Text>
              <Text style={styles.quickLabel}>Nhóm{"\n"}máu của bạn</Text>
            </View>

            <View style={styles.quickCard}>
              <Text style={styles.quickNum}>{profile?.soLanHienMau ?? 0}</Text>
              <Text style={styles.quickLabel}>Lần hiến{"\n"}máu</Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { paddingBottom: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },

  // Header Style
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 20 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        transitionProperty: "background-color",
        transitionDuration: "150ms",
        cursor: "pointer",
      },
    }),
  },
  notifIcon: { fontSize: 18 },

  // Thẻ thống kê kính mờ bên trong Header
  quickRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  quickCard: { flex: 1, alignItems: "center" },
  quickCardMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  quickNum: { fontSize: 24, fontWeight: "900", color: "#fff" },
  quickLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 2,
    lineHeight: 13,
  },
});
