// src/screens/CampaignScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ENDPOINTS, getImageUrl } from "../constants/api";
import { chienDichService } from "../services/api";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=800&auto=format&fit=crop";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

const getStatusBadge = (trangThai) => {
  switch (trangThai) {
    case "DangDienRa":
      return { bg: "#dcfce7", text: "#166534", label: "Đang diễn ra", emoji: "🟢" };
    case "ChuaBatDau":
      return { bg: "#fef9c3", text: "#854d0e", label: "Sắp diễn ra", emoji: "🟡" };
    case "DaKetThuc":
      return { bg: "#f1f5f9", text: "#64748b", label: "Đã kết thúc", emoji: "⚪" };
    default:
      return { bg: "#e2e8f0", text: "#475569", label: trangThai || "Chưa xác định", emoji: "⚪" };
  }
};

export default function CampaignScreen({ navigation }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL"); // ALL, DANG_DIEN_RA, SAP_DIEN_RA, KHAN_CAP

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await chienDichService.getAll();
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      if (list.length > 0) {
        setCampaigns(list);
      } else {
        // Fallback sample data if API returns empty array
        setCampaigns([
          {
            maChienDich: 101,
            tenChienDich: "Giọt Hồng Sông Hàn 2026",
            mucDoUuTien: "KhanCap",
            trangThai: "DangDienRa",
            thoiGianBD: "2026-08-01T07:00:00",
            thoiGianKT: "2026-08-31T17:00:00",
            luongMauDaThu: 350000,
            soLuongDuKien: 500000,
            diaDiem: { tenDiaDiem: "Bệnh viện C Đà Nẵng — Hải Châu", diaChi: "122 Hải Phòng, Q. Hải Châu" }
          },
          {
            maChienDich: 102,
            tenChienDich: "Hành Trình Đỏ — Kết Nối Yêu Thương",
            mucDoUuTien: "BinhThuong",
            trangThai: "DangDienRa",
            thoiGianBD: "2026-08-15T07:30:00",
            thoiGianKT: "2026-09-15T16:30:00",
            luongMauDaThu: 180000,
            soLuongDuKien: 300000,
            diaDiem: { tenDiaDiem: "Đại học Bách Khoa Đà Nẵng", diaChi: "54 Nguyễn Lương Bằng, Q. Liên Chiểu" }
          },
          {
            maChienDich: 103,
            tenChienDich: "Ngày Hội Hiến Máu Tuổi Trẻ Thanh Khê",
            mucDoUuTien: "BinhThuong",
            trangThai: "ChuaBatDau",
            thoiGianBD: "2026-09-05T07:00:00",
            thoiGianKT: "2026-09-07T17:00:00",
            luongMauDaThu: 0,
            soLuongDuKien: 200000,
            diaDiem: { tenDiaDiem: "Trung tâm Văn hóa Q. Thanh Khê", diaChi: "Đà Nẵng" }
          }
        ]);
      }
    } catch (e) {
      console.log("Error loading campaigns:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  // Filter campaigns
  const filteredList = campaigns.filter((item) => {
    const titleMatch = item.tenChienDich?.toLowerCase().includes(searchText.toLowerCase());
    const locMatch = item.diaDiem?.tenDiaDiem?.toLowerCase().includes(searchText.toLowerCase());
    const matchesSearch = titleMatch || locMatch;

    if (!matchesSearch) return false;

    if (selectedFilter === "KHAN_CAP") return item.mucDoUuTien === "KhanCap";
    if (selectedFilter === "DANG_DIEN_RA") return item.trangThai === "DangDienRa";
    if (selectedFilter === "SAP_DIEN_RA") return item.trangThai === "ChuaBatDau";
    return true;
  });

  return (
    <View style={styles.root}>
      {/* Header Bar */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <Text style={styles.headerTitle}>Chiến Dịch Hiến Máu</Text>
        <Text style={styles.headerSubtitle}>TP. Đà Nẵng — Kết nối tấm lòng nhân ái</Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm tên chiến dịch, địa điểm..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
          {searchText ? (
            <Pressable onPress={() => setSearchText("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      {/* Filter Category Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "KHAN_CAP", label: "⚡ Cần gấp" },
            { id: "DANG_DIEN_RA", label: "🟢 Đang diễn ra" },
            { id: "SAP_DIEN_RA", label: "🟡 Sắp diễn ra" },
          ].map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedFilter(cat.id)}
              style={[
                styles.filterChip,
                selectedFilter === cat.id && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === cat.id && styles.filterTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#e62e43"]} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#e62e43" style={{ marginTop: 40 }} />
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Chưa tìm thấy chiến dịch phù hợp</Text>
          </View>
        ) : (
          filteredList.map((item, index) => {
            const badge = getStatusBadge(item.trangThai);
            const progress =
              item.soLuongDuKien > 0
                ? Math.min((item.luongMauDaThu || 0) / item.soLuongDuKien, 1)
                : 0;

            return (
              <View key={item.maChienDich || index} style={styles.card}>
                {/* Banner & Badges Header */}
                <View style={styles.cardHeader}>
                  <Image source={{ uri: (item.imageUrl || item.ImageUrl) ? getImageUrl(item.imageUrl || item.ImageUrl) : DEFAULT_BANNER }} style={styles.cardBanner} />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={styles.cardGradientOverlay} />
                  
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>
                        {badge.emoji} {badge.label}
                      </Text>
                    </View>

                    {item.mucDoUuTien === "KhanCap" && (
                      <View style={styles.urgentTag}>
                        <Text style={styles.urgentText}>⚡ Khẩn cấp</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <Text style={styles.campTitle}>{item.tenChienDich}</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText} numberOfLines={1}>
                      {item.diaDiem?.tenDiaDiem || item.diaDiem?.diaChi || "TP. Đà Nẵng"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📅</Text>
                    <Text style={styles.infoText}>
                      {formatDate(item.thoiGianBD)} — {formatDate(item.thoiGianKT)}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  {item.soLuongDuKien > 0 && (
                    <View style={styles.progressBox}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Tiến trình mục tiêu</Text>
                        <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => navigation.navigate("CampaignDetail", { campaignItem: item })}
                      style={styles.detailBtn}
                    >
                      <Text style={styles.detailBtnText}>Chi tiết ➔</Text>
                    </Pressable>

                    {item.trangThai !== "DaKetThuc" && (
                      <Pressable
                        onPress={() => navigation.navigate("DangKyHienMau", { campaignItem: item })}
                        style={styles.registerBtn}
                      >
                        <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.registerGradient}>
                          <Text style={styles.registerText}>Đăng ký ngay 🩸</Text>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 24 : 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4, marginBottom: 14 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a", outlineStyle: "none" },
  clearIcon: { fontSize: 16, color: "#94a3b8", padding: 4 },
  filterBar: { paddingVertical: 12, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  filterScroll: { paddingHorizontal: 16, gap: 10, flexDirection: "row" },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterChipActive: { backgroundColor: "#e62e43" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  filterTextActive: { color: "#ffffff", fontWeight: "700" },
  listContent: { padding: 16 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { fontSize: 15, color: "#64748b", fontWeight: "600" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#e62e43",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: { height: 130, position: "relative" },
  cardBanner: { width: "100%", height: "100%", resizeMode: "cover" },
  cardGradientOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  badgeRow: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  urgentTag: { backgroundColor: "#fee2e2", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  urgentText: { fontSize: 11, fontWeight: "800", color: "#e62e43" },
  cardBody: { padding: 16 },
  campTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 10, lineHeight: 24 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoIcon: { fontSize: 14, marginRight: 8 },
  infoText: { fontSize: 13, color: "#475569", flex: 1, fontWeight: "500" },
  progressBox: { marginTop: 10, marginBottom: 14, backgroundColor: "#f8fafc", padding: 10, borderRadius: 12 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  progressValue: { fontSize: 12, color: "#e62e43", fontWeight: "800" },
  progressTrack: { height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#e62e43", borderRadius: 4 },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  detailBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#f1f5f9" },
  detailBtnText: { fontSize: 13, fontWeight: "700", color: "#475569" },
  registerBtn: { borderRadius: 12, overflow: "hidden" },
  registerGradient: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  registerText: { fontSize: 13, fontWeight: "800", color: "#ffffff" },
});
