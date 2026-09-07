// src/screens/HomeScreen.jsx
// Trang chủ Mobile App — Hệ thống Hiến máu Nhân đạo TP. Đà Nẵng
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
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInRight, FadeInDown, ZoomIn } from 'react-native-reanimated';
import api from "../services/api";
import { ENDPOINTS, getImageUrl } from "../constants/api";
import NotificationModal from "../components/NotificationModal";

const DEFAULT_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=600&q=80";

// Helper: format ngày dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

// Helper: format nhóm máu đẹp
const formatNhomMau = (nhomMauRaw) => {
  if (!nhomMauRaw) return "--";
  const str = String(nhomMauRaw).trim();
  if (str === "B_positive" || str === "B_CO_RH") return "B+";
  if (str === "A_positive" || str === "A_CO_RH") return "A+";
  if (str === "O_positive" || str === "O_CO_RH") return "O+";
  if (str === "AB_positive" || str === "AB_CO_RH") return "AB+";
  if (str === "O_negative" || str === "O_KHONG_RH") return "O-";
  if (str === "A_negative" || str === "A_KHONG_RH") return "A-";
  if (str === "B_negative" || str === "B_KHONG_RH") return "B-";
  if (str === "AB_negative" || str === "AB_KHONG_RH") return "AB-";
  return str.replace("_positive", "+").replace("_negative", "-");
};

// Helper: nhãn và màu trạng thái
const getTrangThaiStyle = (trangThai) => {
  switch (trangThai) {
    case "DangDienRa":
      return { bg: "#dcfce7", text: "#166534", label: "Đang diễn ra" };
    case "ChuaBatDau":
      return { bg: "#fef9c3", text: "#854d0e", label: "Sắp diễn ra" };
    default:
      return { bg: "#f1f5f9", text: "#64748b", label: trangThai };
  }
};

// Helper: màu mức độ ưu tiên
const getMucDoColor = (mucDo) => {
  switch (mucDo) {
    case "KhanCap":
      return "#e62e43";
    case "CaoBP":
      return "#f97316";
    default:
      return "#22c55e";
  }
};

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState("");
  const [notifVisible, setNotifVisible] = useState(false);

  const fetchHomeData = useCallback(async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) setEmail(storedEmail);

      const [campRes, profileRes, newsRes] = await Promise.allSettled([
        api.get(ENDPOINTS.CHIEN_DICH.GET_ALL),
        api.get(ENDPOINTS.TNV.ME),
        api.get(ENDPOINTS.TIN_TUC.GET_ALL),
      ]);

      if (campRes.status === "fulfilled") {
        const all = campRes.value.data?.data || campRes.value.data || [];
        setCampaigns(Array.isArray(all) ? all : []);
      }

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data?.data || null);
      }

      if (newsRes.status === "fulfilled") {
        const allNews = newsRes.value.data?.data || newsRes.value.data || [];
        setNews(Array.isArray(allNews) ? allNews : []);
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

  const activeCampaigns = campaigns.filter(
    (c) => c.trangThai === "DangDienRa" || c.trangThai === "ChuaBatDau"
  );
  const urgentCampaigns = campaigns.filter(
    (c) =>
      c.mucDoUuTien === "KhanCap" &&
      (c.trangThai === "DangDienRa" || c.trangThai === "ChuaBatDau"),
  );
  const displayName = profile?.hoTen || email?.split("@")[0] || "bạn";

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
      {/* Modal Thông báo */}
      <NotificationModal
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ef4444"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── HEADER MỚI (TỐI GIẢN) ──── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào, {displayName}! 👋</Text>
            <Text style={styles.headerSub}>Sẵn sàng trao đi giọt máu đào?</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setNotifVisible(true)}
          >
            <Image source={{ uri: "https://ui-avatars.com/api/?name=" + displayName + "&background=fee2e2&color=e62e43" }} style={styles.avatarImg} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        {/* ── THẺ THÀNH TÍCH (HERO CARD) ──── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroWrapper}>
          <LinearGradient colors={["#ff4d4f", "#e62e43"]} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.heroCard}>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatValue}>{activeCampaigns.length}</Text>
              <Text style={styles.heroStatLabel}>Chiến dịch{"\n"}đang mở</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatValue}>{formatNhomMau(profile?.nhomMau)}</Text>
              <Text style={styles.heroStatLabel}>Nhóm máu{"\n"}của bạn</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── THANH PHÍM TẮT TRUY CẬP NHANH ───── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.quickGrid}>
          {[
            { icon: "🩸", title: "Đăng ký\nhiến máu", bg: "#ffe4e6", nav: "DangKyHienMau" },
            { icon: "📜", title: "Lịch sử\nchứng nhận", bg: "#fef3c7", nav: "DonationHistory" },
            { icon: "📰", title: "Tin tức\nsức khỏe", bg: "#e0e7ff", nav: "TinTuc" },
            { icon: "📋", title: "Danh sách\nchiến dịch", bg: "#dcfce7", nav: "ChienDich" },
          ].map((item, idx) => (
            <Pressable
              key={idx}
              onPress={() => navigation.navigate(item.nav)}
              style={({ pressed }) => [styles.gridItem, pressed && { transform: [{ scale: 0.92 }] }]}
            >
              <View style={[styles.gridIconBox, { backgroundColor: item.bg }]}>
                <Text style={styles.gridIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.gridText}>{item.title}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* ── CHIẾN DỊCH ĐANG DIỄN RA ───── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chiến dịch nổi bật</Text>
            <Pressable onPress={() => navigation.navigate("ChienDich")}>
              <Text style={styles.seeAll}>Tất cả</Text>
            </Pressable>
          </View>

          {activeCampaigns.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>Hiện tại chưa có chiến dịch mới.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {activeCampaigns.slice(0, 5).map((c, idx) => {
                const ts = getTrangThaiStyle(c.trangThai);
                const progress = c.soLuongDuKien > 0 ? Math.min((c.luongMauDaThu || 0) / c.soLuongDuKien, 1) : 0;
                return (
                  <Animated.View key={c.maChienDich} entering={FadeInRight.delay(300 + idx * 100).springify()}>
                    <Pressable
                      style={({ pressed }) => [styles.campCard, pressed && { transform: [{ scale: 0.96 }] }]}
                      onPress={() => navigation.navigate("CampaignDetail", { campaignItem: c })}
                    >
                      <View style={styles.campImageWrapper}>
                        <Image 
                          source={{ uri: (c.imageUrl || c.ImageUrl) ? getImageUrl(c.imageUrl || c.ImageUrl) : DEFAULT_NEWS_IMAGE }} 
                          style={styles.campImage} 
                          resizeMode="cover" 
                        />
                        <View style={[styles.chip, { backgroundColor: ts.bg }]}>
                          <Text style={[styles.chipText, { color: ts.text }]}>{ts.label}</Text>
                        </View>
                      </View>
                      <View style={styles.campBody}>
                        <Text style={styles.campName} numberOfLines={2}>{c.tenChienDich}</Text>
                        <Text style={styles.campInfo}>📍 {c.diaDiem?.tenDiaDiem || "Đà Nẵng"}</Text>
                        <Text style={styles.campInfo}>📅 {formatDate(c.thoiGianBD)}</Text>
                        {c.soLuongDuKien > 0 && (
                          <View style={styles.progressWrap}>
                            <View style={styles.progressTrack}>
                              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                            </View>
                            <Text style={styles.progressLabel}>{c.luongMauDaThu || 0}/{c.soLuongDuKien} ml</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── TIN TỨC & SỨC KHỎE ───────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tin tức & Sức khoẻ</Text>
          </View>
          {news.slice(0, 3).map((item, idx) => (
            <Animated.View key={item.maTinTuc || idx} entering={FadeInDown.delay(400 + idx * 100).springify()}>
              <Pressable
                style={({ pressed }) => [styles.newsCard, pressed && { transform: [{ scale: 0.97 }] }]}
                onPress={() => navigation.navigate("NewsDetail", { newsItem: item })}
              >
                <Image source={{ uri: item.hinhAnh && item.hinhAnh.startsWith("http") ? item.hinhAnh : DEFAULT_NEWS_IMAGE }} style={styles.newsImage} />
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>{item.tieuDe}</Text>
                  <Text style={styles.newsDate}>🗓 {formatDate(item.ngayDang)}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { paddingBottom: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },
  
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: { fontSize: 20, fontWeight: "900", color: "#111827" },
  headerSub: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  avatarBtn: { position: "relative" },
  avatarImg: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fee2e2" },
  notifDot: { position: "absolute", top: 0, right: 0, width: 12, height: 12, backgroundColor: "#ef4444", borderRadius: 6, borderWidth: 2, borderColor: "#f8f9fa" },

  heroWrapper: { paddingHorizontal: 20, marginBottom: 24 },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#e62e43",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
  heroStatBox: { flex: 1, alignItems: "center" },
  heroDivider: { width: 1, height: "80%", backgroundColor: "rgba(255,255,255,0.3)" },
  heroStatValue: { fontSize: 28, fontWeight: "900", color: "#fff", marginBottom: 4 },
  heroStatLabel: { fontSize: 12, color: "rgba(255,255,255,0.95)", textAlign: "center", fontWeight: "600", lineHeight: 16 },

  quickGrid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 32 },
  gridItem: { alignItems: "center", width: "23%" },
  gridIconBox: { width: 56, height: 56, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  gridIcon: { fontSize: 24 },
  gridText: { fontSize: 11, fontWeight: "600", color: "#374151", textAlign: "center", lineHeight: 16 },

  section: { paddingHorizontal: 20, marginBottom: 32 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  seeAll: { fontSize: 13, fontWeight: "700", color: "#ef4444" },
  horizontalScroll: { marginHorizontal: -20, paddingHorizontal: 20 },

  campCard: { 
    width: 260,
    backgroundColor: "#ffffff", 
    borderRadius: 24, 
    marginRight: 16, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  campImageWrapper: { width: "100%", height: 100, position: "relative" },
  campImage: { width: "100%", height: "100%" },
  chip: { position: "absolute", top: 12, left: 12, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  campBody: { paddingHorizontal: 16, paddingTop: 14 },
  campName: { fontSize: 15, fontWeight: "800", color: "#111827", marginBottom: 6, lineHeight: 22 },
  campInfo: { fontSize: 12, fontWeight: "500", color: "#6b7280", marginBottom: 4 },
  progressWrap: { marginTop: 12 },
  progressTrack: { height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: "#ef4444" },
  progressLabel: { fontSize: 11, fontWeight: "700", color: "#9ca3af", marginTop: 6, textAlign: "right" },

  newsCard: { 
    backgroundColor: "#ffffff", 
    borderRadius: 20, 
    padding: 12, 
    marginBottom: 12, 
    flexDirection: "row", 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  newsImage: { width: 80, height: 80, borderRadius: 14, backgroundColor: "#f3f4f6" },
  newsContent: { flex: 1, marginLeft: 16, justifyContent: "center" },
  newsTitle: { fontSize: 14, fontWeight: "700", color: "#111827", lineHeight: 20, marginBottom: 8 },
  newsDate: { fontSize: 12, color: "#9ca3af", fontWeight: "500" },

  emptyCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center" },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: "#9ca3af", fontSize: 13 },
});
