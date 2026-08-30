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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang tải danh sách chiến dịch...</Text>
      </View>
    );
  }

  // Phân nhóm chiến dịch theo trạng thái
  const active = campaigns.filter((c) => c.trangThai === "DangDienRa");
  const upcoming = campaigns.filter((c) => c.trangThai === "ChuaBatDau");
  const ended = campaigns.filter(
    (c) => c.trangThai === "DaKetThuc" || c.trangThai === "DaHuy",
  );

  // Vẽ 1 Card Chiến dịch
  const renderCampaign = (c) => {
    const info = getTrangThaiInfo(c.trangThai);
    const progress =
      c.soLuongDuKien > 0
        ? Math.min((c.luongMauDaThu || 0) / c.soLuongDuKien, 1)
        : 0;

    return (
      <Pressable
        key={c.maChienDich}
        style={({ pressed, hovered }) => [
          styles.card,
          pressed && { transform: [{ scale: 0.98 }] },
          Platform.OS === "web" && hovered && styles.cardHovered,
        ]}
      >
        <View style={styles.cardTop}>
          <View style={[styles.badge, { backgroundColor: info.bg }]}>
            <Text style={[styles.badgeText, { color: info.text }]}>
              {info.emoji} {info.label}
            </Text>
          </View>

          {c.mucDoUuTien === "KhanCap" && (
            <View style={styles.urgentTag}>
              <Text style={styles.urgentTagText}>⚡ Khẩn cấp</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle}>{c.tenChienDich}</Text>

        <Text style={styles.cardInfo}>
          📍 {c.diaDiem?.tenDiaDiem || c.diaDiem?.diaChi || "TP. Đà Nẵng"}
        </Text>

        <Text style={styles.cardInfo}>
          📅 {formatDate(c.thoiGianBD)} — {formatDate(c.thoiGianKT)}
        </Text>

        {/* Thanh tiến trình thu nhận máu */}
        {c.soLuongDuKien > 0 && (
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {c.luongMauDaThu || 0}/{c.soLuongDuKien} ml
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  // Vẽ 1 Nhóm chiến dịch có tiêu đề
  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.group}>
        <Text style={styles.groupTitle}>
          {title} ({items.length})
        </Text>
        {items.map(renderCampaign)}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <Text style={styles.headerTitle}>Chiến dịch Hiến máu</Text>
        <Text style={styles.headerSub}>
          Tổng cộng {campaigns.length} chiến dịch tại Đà Nẵng
        </Text>
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
        {renderGroup("🟢 Đang diễn ra", active)}
        {renderGroup("🟡 Sắp diễn ra", upcoming)}
        {renderGroup("⚪ Đã kết thúc / Đã hủy", ended)}

        {campaigns.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📋</Text>
            <Text style={styles.emptyText}>Chưa có chiến dịch nào.</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ─── 4. STYLES ─────────────────────────────────────────
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
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  scrollContent: { padding: 16 },
  group: { marginBottom: 20 },
  groupTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    ...Platform.select({
      web: {
        transitionProperty: "transform, box-shadow",
        transitionDuration: "200ms",
        cursor: "pointer",
      },
    }),
  },
  cardHovered: {
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.14,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  urgentTag: {
    backgroundColor: "#fde2e4",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  urgentTagText: { fontSize: 10, fontWeight: "700", color: "#e62e43" },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 6,
    lineHeight: 21,
  },
  cardInfo: { fontSize: 12, color: "#666", marginBottom: 3 },
  progressWrap: { marginTop: 8 },
  progressTrack: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: "#e62e43" },
  progressLabel: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 40,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderStyle: "dashed",
  },
  emptyText: { color: "#aaa", fontSize: 14 },
});
