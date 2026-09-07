// src/screens/CampaignDetailScreen.jsx
// Màn hình Chi tiết Chiến dịch Hiến máu — Đà Nẵng
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getImageUrl } from "../constants/api";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=800&auto=format&fit=crop";

// Helper: format ngày dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

// Helper: nhãn trạng thái
const getTrangThaiInfo = (trangThai) => {
  switch (trangThai) {
    case "DangDienRa":
      return { bg: "#dcfce7", text: "#166534", label: "Đang diễn ra", emoji: "🟢" };
    case "ChuaBatDau":
      return { bg: "#fef9c3", text: "#854d0e", label: "Sắp diễn ra", emoji: "🟡" };
    case "DaKetThuc":
      return { bg: "#f1f5f9", text: "#64748b", label: "Đã kết thúc", emoji: "⚪" };
    default:
      return { bg: "#f1f5f9", text: "#64748b", label: trangThai, emoji: "⚪" };
  }
};

export default function CampaignDetailScreen({ route, navigation }) {
  const { campaignItem } = route.params || {};

  if (!campaignItem) {
    return (
      <View style={styles.root}>
        <Text style={{ margin: 20 }}>Không tìm thấy thông tin chiến dịch.</Text>
      </View>
    );
  }

  const info = getTrangThaiInfo(campaignItem.trangThai);
  const progress =
    campaignItem.soLuongDuKien > 0
      ? Math.min((campaignItem.luongMauDaThu || 0) / campaignItem.soLuongDuKien, 1)
      : 0;

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết Chiến dịch</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card Thống tin chính */}
        <View style={styles.mainCard}>
          <Image 
            source={{ uri: campaignItem.hinhAnh ? getImageUrl(campaignItem.hinhAnh) : DEFAULT_BANNER }} 
            style={styles.heroImage} 
            resizeMode="cover"
          />
          
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: info.bg }]}>
              <Text style={[styles.badgeText, { color: info.text }]}>
                {info.emoji} {info.label}
              </Text>
            </View>

            {campaignItem.mucDoUuTien === "KhanCap" && (
              <View style={styles.urgentTag}>
                <Text style={styles.urgentTagText}>⚡ Khẩn cấp</Text>
              </View>
            )}
          </View>

          <Text style={styles.campTitle}>{campaignItem.tenChienDich}</Text>

          {/* Thanh tiến trình % máu */}
          {campaignItem.soLuongDuKien > 0 && (
            <View style={styles.progressBox}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Tiến trình thu nhận máu</Text>
                <Text style={styles.progressPercent}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressSub}>
                Đã thu được {campaignItem.luongMauDaThu || 0} ml / Mục tiêu {campaignItem.soLuongDuKien} ml
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Chi tiết Địa điểm & Thời gian */}
          <Text style={styles.sectionHeader}>Thông tin tổ chức</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Địa điểm tổ chức</Text>
              <Text style={styles.infoValue}>
                {campaignItem.diaDiem?.tenDiaDiem || campaignItem.diaDiem?.diaChi || "TP. Đà Nẵng"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Thời gian diễn ra</Text>
              <Text style={styles.infoValue}>
                {formatDate(campaignItem.thoiGianBD)} — {formatDate(campaignItem.thoiGianKT)}
              </Text>
            </View>
          </View>

          {campaignItem.nhomMauCanKhapCap && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🩸</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Nhóm máu cần gấp</Text>
                <Text style={[styles.infoValue, { color: "#e62e43" }]}>
                  Nhóm {campaignItem.nhomMauCanKhapCap}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Nút Đăng ký hiến máu */}
        {campaignItem.trangThai !== "DaKetThuc" && (
          <Pressable
            onPress={() => navigation.navigate("DangKyHienMau", { campaignId: campaignItem.maChienDich })}
            style={({ pressed }) => [
              styles.submitWrap,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <LinearGradient
              colors={["#e62e43", "#c01b30"]}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>ĐĂNG KÝ THAM GIA HIẾN MÁU NGAY</Text>
            </LinearGradient>
          </Pressable>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 20 : 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  scrollContent: { padding: 16 },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  heroImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: "#f1f5f9"
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  urgentTag: { backgroundColor: "#fde2e4", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  urgentTagText: { fontSize: 11, fontWeight: "700", color: "#e62e43" },
  campTitle: { fontSize: 20, fontWeight: "900", color: "#1a1a2e", lineHeight: 28, marginBottom: 16 },
  
  // Progress Box
  progressBox: { backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, marginBottom: 16 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressTitle: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  progressPercent: { fontSize: 13, fontWeight: "900", color: "#e62e43" },
  progressTrack: { height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: 8, backgroundColor: "#e62e43", borderRadius: 4 },
  progressSub: { fontSize: 11, color: "#94a3b8", textAlign: "right" },
  
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 14 },
  sectionHeader: { fontSize: 15, fontWeight: "800", color: "#1a1a2e", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoIcon: { fontSize: 22, marginRight: 12, width: 28, textAlign: "center" },
  infoTextGroup: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },

  // Submit Btn
  submitWrap: { borderRadius: 25, overflow: "hidden", marginTop: 8 },
  submitGradient: { paddingVertical: 16, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 0.5 },
});
