// src/screens/DonationHistoryScreen.jsx
// Màn hình Lịch sử Hiến máu & Giấy chứng nhận — TP. Đà Nẵng
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

// Helper: format ngày dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

export default function DonationHistoryScreen({ navigation }) {
  // ─── 1. QUẢN LÝ TRẠNG THÁI (STATE) ───────────────────
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── 2. HÀM TẢI LỊCH SỬ HIẾN MÁU TỪ BACKEND C# ───────
  const fetchDonationHistory = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.DON_DANG_KY.GET_ALL);
      const data = res.data?.data || res.data || [];
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Lỗi tải lịch sử hiến máu:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDonationHistory();
  }, [fetchDonationHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDonationHistory();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang tải lịch sử hiến máu...</Text>
      </View>
    );
  }

  // Lọc danh sách các lần hiến máu đã hoàn thành
  const completedList = historyList.filter(
    (item) => item.trangThai === "DaHoanThanh",
  );
  // Tính tổng thể tích máu đã đóng góp (ml)
  const totalVolume = completedList.reduce(
    (sum, item) => sum + (item.theTich || 350),
    0,
  );

  return (
    <View style={styles.root}>
      <Text style={{ margin: 20 }}>
        Đã tải {historyList.length} lần đăng ký (trong đó {completedList.length}{" "}
        lần hiến thành công, tổng {totalVolume} ml máu).
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
