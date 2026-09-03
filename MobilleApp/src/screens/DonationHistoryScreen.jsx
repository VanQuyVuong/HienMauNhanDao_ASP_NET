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
      {/* Header */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Lịch sử & Chứng nhận</Text>
            <Text style={styles.headerSub}>
              Hành trình Hiến máu Nhân đạo Đà Nẵng
            </Text>
          </View>
        </View>
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
        {/* ── 1. THẺ TỔNG KẾT THÀNH TÍCH NHÂN ĐẠO ──────────── */}
        <LinearGradient
          colors={["#e62e43", "#b91c1c"]}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryBadge}>🏆 THÀNH TÍCH NHÂN ĐẠO</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryNum}>{completedList.length}</Text>
              <Text style={styles.summaryLabel}>Lần hiến máu</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryNum}>{totalVolume}</Text>
              <Text style={styles.summaryLabel}>ml Máu trao đi</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── 2. DANH SÁCH LỊCH SỬ & GIẤY CHỨNG NHẬN ─────── */}
        <Text style={styles.sectionTitle}>Danh sách Giấy chứng nhận</Text>

        {historyList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🩸</Text>
            <Text style={styles.emptyTitle}>Chưa có lịch sử hiến máu</Text>
            <Text style={styles.emptyDesc}>
              Bạn chưa có thông tin hiến máu. Hãy tham gia đăng ký chiến dịch
              hiến máu ngay hôm nay nhé!
            </Text>
          </View>
        ) : (
          historyList.map((item, index) => {
            const isDone = item.trangThai === "DaHoanThanh";
            return (
              <Pressable 
                key={item.maDon || index} 
                style={styles.certCard}
                onPress={() => navigation.navigate("RegistrationTicket", { maDon: item.maDon, registrationData: item })}
              >
                <View style={styles.certHeader}>
                  <View
                    style={[
                      styles.statusTag,
                      isDone ? styles.tagDone : styles.tagPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isDone ? styles.textDone : styles.textPending,
                      ]}
                    >
                      {isDone ? "🏆 ĐÃ HOÀN THÀNH" : (item.trangThai === "DaDangKy" || item.trangThai === 0 || item.trangThai === "ChoDuyet" || item.trangThai === 1 || item.trangThai === "DaDuyet" || item.trangThai === 2) ? "⏳ ĐANG XỬ LÝ" : "🚫 ĐÃ HỦY/TỪ CHỐI"}
                    </Text>
                  </View>
                  <Text style={styles.certCode}>Mã: {item.maDon}</Text>
                </View>

                <Text style={styles.certTitle}>
                  {item.chienDich?.tenChienDich ||
                    "Chiến dịch Hiến máu Nhân đạo"}
                </Text>

                <Text style={styles.certInfo}>
                  📍 Địa điểm:{" "}
                  {item.chienDich?.diaDiem?.tenDiaDiem || "TP. Đà Nẵng"}
                </Text>
                <Text style={styles.certInfo}>
                  📅 Ngày tham gia:{" "}
                  {formatDate(item.thoiGianDangKy || item.ngayDangKy)}
                </Text>

                <View style={styles.certFooter}>
                  <Text style={styles.volumeBadge}>
                    🩸 {item.theTich || 350} ml
                  </Text>
                  {isDone && (
                    <Text style={styles.certVerifyText}>
                      ✓ Chứng nhận điện tử hợp lệ
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ─── 3. STYLES ─────────────────────────────────────────
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  scrollContent: { padding: 16 },

  // Summary Card
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#e62e43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryCol: { flex: 1, alignItems: "center" },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  summaryNum: { fontSize: 28, fontWeight: "900", color: "#fff" },
  summaryLabel: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },

  // Certificate Card
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  certCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  certHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagDone: { backgroundColor: "#dcfce7" },
  tagPending: { backgroundColor: "#fef9c3" },
  statusText: { fontSize: 10, fontWeight: "800" },
  textDone: { color: "#166534" },
  textPending: { color: "#854d0e" },
  certCode: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  certTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 6,
    lineHeight: 21,
  },
  certInfo: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  certFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  volumeBadge: { fontSize: 13, fontWeight: "900", color: "#e62e43" },
  certVerifyText: { fontSize: 11, color: "#166534", fontWeight: "700" },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
});
