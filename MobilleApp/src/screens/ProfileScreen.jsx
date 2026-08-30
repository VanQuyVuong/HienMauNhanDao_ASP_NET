// src/screens/ProfileScreen.jsx
// Màn hình Hồ sơ cá nhân & Đăng xuất — Đà Nẵng
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm gọi API lấy hồ sơ Tình nguyện viên
  const fetchProfile = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) setEmail(storedEmail);

      const res = await api.get(ENDPOINTS.TNV.ME);
      setProfile(res.data?.data || null);
    } catch (e) {
      console.warn("Lỗi tải hồ sơ cá nhân:", e.message);
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  // Hàm xử lý Đăng xuất
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("email");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  // Danh sách các dòng thông tin cá nhân
  const infoRows = profile
    ? [
        { label: "Họ tên", value: profile.hoTen, icon: "👤" },
        { label: "Ngày sinh", value: profile.ngaySinh || "—", icon: "🎂" },
        { label: "Giới tính", value: profile.gioiTinh || "—", icon: "⚧" },
        { label: "CCCD", value: profile.cccd || "—", icon: "🪪" },
        {
          label: "Số điện thoại",
          value: profile.soDienThoai || "—",
          icon: "📱",
        },
        { label: "Nhóm máu", value: profile.nhomMau || "—", icon: "🩸" },
        { label: "Địa chỉ", value: profile.diaChi || "—", icon: "📍" },
      ]
    : [];

  return (
    <View style={styles.root}>
      {/* Header Avatar & Tên */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(profile?.hoTen || email || "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerName}>
          {profile?.hoTen || "Chưa cập nhật hồ sơ"}
        </Text>
        <Text style={styles.headerEmail}>{email}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e62e43"
          />
        }
      >
        {/* Danh sách thông tin cá nhân */}
        {profile ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            {infoRows.map((row, i) => (
              <View
                key={i}
                style={[
                  styles.row,
                  i < infoRows.length - 1 && styles.rowBorder,
                ]}
              >
                <Text style={styles.rowIcon}>{row.icon}</Text>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>📝</Text>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ</Text>
            <Text style={styles.emptyDesc}>
              Tài khoản chưa có thông tin hồ sơ. Bạn hãy cập nhật thông tin để
              bắt đầu đăng ký hiến máu nhé!
            </Text>
          </View>
        )}

        {/* Nút Đăng xuất */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed, hovered }) => [
            styles.logoutBtn,
            pressed && { transform: [{ scale: 0.96 }] },
            Platform.OS === "web" && hovered && styles.logoutBtnHovered,
          ]}
        >
          <Text style={styles.logoutText}>🚪 Đăng xuất tài khoản</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 20 : 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 28, fontWeight: "900", color: "#fff" },
  headerName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 2,
  },
  headerEmail: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  rowIcon: { fontSize: 18, marginRight: 12, width: 28, textAlign: "center" },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12, color: "#aaa", marginBottom: 2 },
  rowValue: { fontSize: 15, fontWeight: "600", color: "#1a1a2e" },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fde2e4",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
  logoutBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fde2e4",
    ...Platform.select({
      web: {
        transitionProperty: "transform, background-color, border-color",
        transitionDuration: "200ms",
        cursor: "pointer",
      },
    }),
  },
  logoutBtnHovered: {
    backgroundColor: "#ffeef0",
    borderColor: "#e62e43",
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#e62e43" },
});
