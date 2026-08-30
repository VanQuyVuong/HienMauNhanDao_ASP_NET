// src/screens/CampaignScreen.jsx
// Màn hình Danh sách Chiến dịch Hiến máu — TP. Đà Nẵng
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
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";

// ─── 1. HÀM HELPER HỖ TRỢ ──────────────────────────────
// Helper: format ngày dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

// Helper: nhãn và emoji trạng thái
const getTrangThaiInfo = (trangThai) => {
  switch (trangThai) {
    case "DangDienRa":
      return {
        bg: "#dcfce7",
        text: "#166534",
        label: "Đang diễn ra",
        emoji: "🟢",
      };
    case "ChuaBatDau":
      return {
        bg: "#fef9c3",
        text: "#854d0e",
        label: "Sắp diễn ra",
        emoji: "🟡",
      };
    case "DaKetThuc":
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        label: "Đã kết thúc",
        emoji: "⚪",
      };
    case "DaHuy":
      return { bg: "#fee2e2", text: "#991b1b", label: "Đã hủy", emoji: "🔴" };
    default:
      return { bg: "#f1f5f9", text: "#64748b", label: trangThai, emoji: "⚪" };
  }
};

export default function CampaignScreen({ navigation }) {
  // ─── 2. QUẢN LÝ TRẠNG THÁI (STATE) ───────────────────
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── 3. HÀM GỌI API TỪ BACKEND C# ────────────────────
  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.CHIEN_DICH.GET_ALL);
      const all = res.data?.data || res.data || [];
      setCampaigns(Array.isArray(all) ? all : []);
    } catch (e) {
      console.warn("Lỗi tải danh sách chiến dịch:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
  };

  // Màn hình chờ khi đang nạp dữ liệu
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang tải danh sách chiến dịch...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={{ margin: 20 }}>
        Đã kết nối API thành công! Tải được {campaigns.length} chiến dịch.
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
