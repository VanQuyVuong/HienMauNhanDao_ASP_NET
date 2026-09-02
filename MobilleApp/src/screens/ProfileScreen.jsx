// src/screens/ProfileScreen.jsx
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

  const infoRows = profile
    ? [
        { label: "Họ và tên", value: profile.hoTen, icon: "👤" },
        { label: "Ngày sinh", value: profile.ngaySinh || "—", icon: "🎂" },
        { label: "Giới tính", value: profile.gioiTinh || "—", icon: "⚧" },
        { label: "CCCD / CMND", value: profile.cccd || "—", icon: "🪪" },
        { label: "Số điện thoại", value: profile.soDienThoai || "—", icon: "📱" },
        { label: "Nhóm máu", value: profile.nhomMau ? profile.nhomMau.replace('_positive', '+').replace('_negative', '-') : "—", icon: "🩸" },
        { label: "Địa chỉ", value: profile.diaChi || "—", icon: "📍" },
      ]
    : [];

  return (
    <View style={styles.root}>
      {/* Avatar & Header */}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e62e43" />
        }
      >
        {/* Quick Access Menu Cards */}
        <View style={styles.quickMenuRow}>
          <Pressable
            onPress={() => navigation.navigate("DonationHistory")}
            style={({ pressed }) => [styles.quickCard, pressed && { transform: [{ scale: 0.96 }] }]}
          >
            <LinearGradient colors={["#ef4444", "#dc2626"]} style={styles.quickCardGradient}>
              <Text style={styles.quickIcon}>📜</Text>
              <Text style={styles.quickTitle}>Lịch sử Hiến máu</Text>
              <Text style={styles.quickSub}>& Giấy chứng nhận 🏅</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("UpdateProfile")}
            style={({ pressed }) => [styles.quickCard, pressed && { transform: [{ scale: 0.96 }] }]}
          >
            <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.quickCardGradient}>
              <Text style={styles.quickIcon}>✏️</Text>
              <Text style={styles.quickTitle}>Cập nhật Hồ sơ</Text>
              <Text style={styles.quickSub}>Thông tin cá nhân 🪪</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Thông tin chi tiết */}
        {profile ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
              <Pressable
                onPress={() => navigation.navigate("UpdateProfile")}
                style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.editBtnText}>Chỉnh sửa</Text>
              </Pressable>
            </View>

            {infoRows.map((row, i) => (
              <View key={i} style={[styles.row, i < infoRows.length - 1 && styles.rowBorder]}>
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
            <Text style={styles.emptyTitle}>Chưa có hồ sơ cá nhân</Text>
            <Text style={styles.emptyDesc}>
              Hãy cập nhật thông tin để đủ điều kiện đăng ký tham gia các chiến dịch hiến máu nhân đạo nhé!
            </Text>
            <Pressable
              onPress={() => navigation.navigate("UpdateProfile")}
              style={({ pressed }) => [styles.createProfileBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.createProfileBtnText}>+ Cập nhật hồ sơ ngay</Text>
            </Pressable>
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

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  loadingText: { marginTop: 12, color: "#64748b", fontSize: 14, fontWeight: "600" },
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 24 : 44,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontSize: 30, fontWeight: "900", color: "#ffffff" },
  headerName: { fontSize: 20, fontWeight: "900", color: "#ffffff", marginBottom: 2 },
  headerEmail: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
  scrollContent: { padding: 16 },
  quickMenuRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  quickCard: { flex: 1, borderRadius: 18, overflow: "hidden" },
  quickCardGradient: { padding: 16, borderRadius: 18 },
  quickIcon: { fontSize: 26, marginBottom: 6 },
  quickTitle: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
  quickSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#e62e43",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  editBtn: { backgroundColor: "#fee2e2", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  editBtnText: { fontSize: 12, fontWeight: "700", color: "#e62e43" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  rowIcon: { fontSize: 20, marginRight: 14 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  rowValue: { fontSize: 14, color: "#0f172a", fontWeight: "700", marginTop: 2 },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 20 },
  createProfileBtn: { backgroundColor: "#e62e43", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 16 },
  createProfileBtnText: { color: "#ffffff", fontWeight: "800", fontSize: 14 },
  logoutBtn: {
    backgroundColor: "#fee2e2",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutBtnHovered: { backgroundColor: "#fca5a5" },
  logoutText: { color: "#dc2626", fontWeight: "800", fontSize: 15 },
});
