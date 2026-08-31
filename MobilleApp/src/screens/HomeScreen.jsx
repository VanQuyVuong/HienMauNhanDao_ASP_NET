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
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";
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

  const activeCampaigns = campaigns.filter((c) => c.trangThai === "DangDienRa");
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
            tintColor="#e62e43"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── HEADER ĐỎ & THẺ THỐNG KÊ ──── */}
        <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.greeting}>Xin chào, {displayName}! 👋</Text>
              <Text style={styles.headerSub}>
                Hệ thống Hiến máu Nhân đạo Đà Nẵng
              </Text>
            </View>

            {/* Nút Chuông Thông Báo */}
            <Pressable
              style={({ pressed }) => [
                styles.notifBtn,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => setNotifVisible(true)}
            >
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>2</Text>
              </View>
            </Pressable>
          </View>

          {/* 3 Thẻ thống kê kính mờ */}
          <View style={styles.quickRow}>
            <View style={styles.quickCard}>
              <Text style={styles.quickNum}>{activeCampaigns.length}</Text>
              <Text style={styles.quickLabel}>Chiến dịch{"\n"}đang mở</Text>
            </View>

            <View style={[styles.quickCard, styles.quickCardMid]}>
              <Text style={styles.quickNum}>
                {formatNhomMau(profile?.nhomMau)}
              </Text>
              <Text style={styles.quickLabel}>Nhóm{"\n"}máu của bạn</Text>
            </View>

          </View>
        </LinearGradient>

        {/* ── THANH PHÍM TẮT TRUY CẬP NHANH (QUICK ACTIONS) ───── */}
        <View style={styles.quickGrid}>
          <Pressable
            onPress={() => navigation.navigate("DangKyHienMau")}
            style={({ pressed }) => [styles.gridItem, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <View style={[styles.gridIconBox, { backgroundColor: "#fee2e2" }]}>
              <Text style={styles.gridIcon}>🩸</Text>
            </View>
            <Text style={styles.gridText}>Đăng ký{"\n"}hiến máu</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("DonationHistory")}
            style={({ pressed }) => [styles.gridItem, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <View style={[styles.gridIconBox, { backgroundColor: "#fef3c7" }]}>
              <Text style={styles.gridIcon}>📜</Text>
            </View>
            <Text style={styles.gridText}>Lịch sử &{"\n"}Chứng nhận</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("TinTuc")}
            style={({ pressed }) => [styles.gridItem, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <View style={[styles.gridIconBox, { backgroundColor: "#dbeafe" }]}>
              <Text style={styles.gridIcon}>📰</Text>
            </View>
            <Text style={styles.gridText}>Tin tức &{"\n"}Sức khỏe</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("ChienDich")}
            style={({ pressed }) => [styles.gridItem, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <View style={[styles.gridIconBox, { backgroundColor: "#dcfce7" }]}>
              <Text style={styles.gridIcon}>📋</Text>
            </View>
            <Text style={styles.gridText}>Danh sách{"\n"}chiến dịch</Text>
          </Pressable>
        </View>


        {/* ── BANNER CHIẾN DỊCH KHẨN CẤP ───────────── */}
        {urgentCampaigns.length > 0 && (
          <View style={styles.section}>
            <View style={styles.urgentBanner}>
              <View style={styles.urgentHeader}>
                <Text style={styles.urgentIcon}>⚡</Text>
                <Text style={styles.urgentTitle}>KHẨN CẤP</Text>
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentBadgeText}>
                    {urgentCampaigns.length} chiến dịch
                  </Text>
                </View>
              </View>

              <Text style={styles.urgentCampName}>
                {urgentCampaigns[0].tenChienDich}
              </Text>

              <Text style={styles.urgentDesc}>
                📍 {urgentCampaigns[0].diaDiem?.tenDiaDiem || "TP. Đà Nẵng"}
              </Text>

              {urgentCampaigns[0].nhomMauCanKhapCap && (
                <Text style={styles.urgentBloodType}>
                  🩸 Cần gấp nhóm máu: {urgentCampaigns[0].nhomMauCanKhapCap}
                </Text>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.urgentBtn,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => navigation.navigate("DangKyHienMau")}
              >
                <Text style={styles.urgentBtnText}>
                  Đăng ký hiến máu ngay →
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── CHIẾN DỊCH ĐANG DIỄN RA (CAROUSEL) ───── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chiến dịch đang diễn ra</Text>
            <Pressable onPress={() => navigation.navigate("ChienDich")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>

          {activeCampaigns.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>
                Hiện tại chưa có chiến dịch mới.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {activeCampaigns.slice(0, 5).map((c) => {
                const ts = getTrangThaiStyle(c.trangThai);
                const dotColor = getMucDoColor(c.mucDoUuTien);
                const progress =
                  c.soLuongDuKien > 0
                    ? Math.min((c.luongMauDaThu || 0) / c.soLuongDuKien, 1)
                    : 0;

                return (
                  <Pressable
                    key={c.maChienDich}
                    style={({ pressed }) => [
                      styles.campCard,
                      pressed && { transform: [{ scale: 0.97 }] },
                    ]}
                    onPress={() => navigation.navigate("CampaignDetail", { campaignItem: c })}
                  >
                    <View
                      style={[styles.campStripe, { backgroundColor: dotColor }]}
                    />

                    <View style={styles.campBody}>
                      <View style={[styles.chip, { backgroundColor: ts.bg }]}>
                        <Text style={[styles.chipText, { color: ts.text }]}>
                          {ts.label}
                        </Text>
                      </View>
                      <Text style={styles.campName} numberOfLines={2}>
                        {c.tenChienDich}
                      </Text>
                      <Text style={styles.campInfo}>
                        📍 {c.diaDiem?.tenDiaDiem || "Đà Nẵng"}
                      </Text>
                      <Text style={styles.campInfo}>
                        📅 {formatDate(c.thoiGianBD)} - {formatDate(c.thoiGianKT)}
                      </Text>

                      {c.soLuongDuKien > 0 && (
                        <View style={styles.progressWrap}>
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${progress * 100}%`,
                                  backgroundColor: dotColor,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressLabel}>
                            {c.luongMauDaThu || 0}/{c.soLuongDuKien} ml
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── TIN TỨC & SỨC KHỎE ───────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tin tức & Sức khoẻ</Text>
            <Pressable onPress={() => navigation.navigate("TinTuc")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>

          {news.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📰</Text>
              <Text style={styles.emptyText}>Chưa có tin tức mới.</Text>
            </View>
          ) : (
            news.slice(0, 3).map((item, idx) => (
              <Pressable
                key={item.maTinTuc || idx}
                style={({ pressed }) => [
                  styles.newsCard,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => navigation.navigate("NewsDetail", { newsItem: item })}
              >
                <View style={styles.newsContent}>
                  <View style={styles.newsCategoryBadge}>
                    <Text style={styles.newsCategoryText}>
                      {item.loaiTin === "KienThuc"
                        ? "📖 Kiến thức"
                        : item.loaiTin === "SuKien"
                          ? "🎪 Sự kiện"
                          : "📰 Tin tức"}
                    </Text>
                  </View>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.tieuDe}
                  </Text>
                  <Text style={styles.newsDate}>
                    🗓 {formatDate(item.ngayDang)}
                  </Text>
                </View>

                {/* Thumbnail hình ảnh có Fallback đẹp */}
                <Image
                  source={{
                    uri: item.hinhAnh && item.hinhAnh.startsWith("http")
                      ? item.hinhAnh
                      : DEFAULT_NEWS_IMAGE,
                  }}
                  style={styles.newsImage}
                />
              </Pressable>
            ))
          )}
        </View>

        {/* ── CẨM NANG HIẾN MÁU ────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cẩm nang hiến máu</Text>
          <View style={styles.tipsGrid}>
            {[
              { icon: "💧", title: "Uống nhiều nước", desc: "Uống 2-3 ly nước trước khi hiến máu" },
              { icon: "🍽", title: "Ăn no trước", desc: "Không nên nhịn ăn trước khi hiến máu" },
              { icon: "😴", title: "Ngủ đủ giấc", desc: "Đảm bảo ngủ đủ 7-8 tiếng tối hôm trước" },
              { icon: "🏃", title: "Không vận động mạnh", desc: "Tránh tập thể thao nặng trong 24h trước" },
            ].map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── SLOGAN CẢM ƠN ────────────────────────── */}
        <View style={styles.sloganSection}>
          <Text style={styles.sloganEmoji}>💖</Text>
          <Text style={styles.sloganText}>
            "Mỗi giọt máu cho đi, một cuộc đời ở lại.{"\n"}Cảm ơn bạn đã luôn đồng hành cùng chúng tôi."
          </Text>
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
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 20 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerInner: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifIcon: { fontSize: 18 },
  notifBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ff4d4f",
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  notifBadgeText: { color: "#fff", fontSize: 9.5, fontWeight: "900" },
  quickRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 16, padding: 14, gap: 8 },
  quickCard: { flex: 1, alignItems: "center" },
  quickCardMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  quickNum: { fontSize: 22, fontWeight: "900", color: "#fff" },
  quickLabel: { fontSize: 10, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 2, lineHeight: 13 },
  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  gridItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  gridIcon: { fontSize: 20 },
  gridText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    lineHeight: 14,
  },
  section: { marginTop: 20, paddingHorizontal: 16 },

  urgentBanner: { backgroundColor: "#e62e43", borderRadius: 20, padding: 20 },
  urgentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  urgentIcon: { fontSize: 18 },
  urgentTitle: { fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 1 },
  urgentBadge: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  urgentBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  urgentCampName: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 4 },
  urgentDesc: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 6 },
  urgentBloodType: { fontSize: 14, fontWeight: "800", color: "#fff", marginBottom: 14 },
  urgentBtn: { backgroundColor: "#fff", borderRadius: 25, paddingVertical: 10, paddingHorizontal: 20, alignSelf: "flex-start" },
  urgentBtnText: { color: "#e62e43", fontWeight: "900", fontSize: 13 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1a1a2e" },
  seeAll: { fontSize: 13, color: "#e62e43", fontWeight: "700" },
  horizontalScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  campCard: { width: 260, backgroundColor: "#fff", borderRadius: 18, marginRight: 14, overflow: "hidden", flexDirection: "row" },
  campStripe: { width: 5 },
  campBody: { flex: 1, padding: 14 },
  chip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 8 },
  chipText: { fontSize: 10, fontWeight: "700" },
  campName: { fontSize: 14, fontWeight: "800", color: "#1a1a2e", marginBottom: 6, lineHeight: 19 },
  campInfo: { fontSize: 12, color: "#666", marginBottom: 3 },
  progressWrap: { marginTop: 10 },
  progressTrack: { height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 10, color: "#888", marginTop: 4, textAlign: "right" },
  newsCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  newsContent: { flex: 1, marginRight: 12 },
  newsCategoryBadge: { backgroundColor: "#ffeef0", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 6 },
  newsCategoryText: { fontSize: 10, fontWeight: "700", color: "#e62e43" },
  newsTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e", lineHeight: 19, marginBottom: 4 },
  newsDate: { fontSize: 11, color: "#aaa" },
  newsImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#fee" },
  tipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  tipCard: { width: "48%", backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  tipIcon: { fontSize: 26, marginBottom: 6 },
  tipTitle: { fontSize: 13, fontWeight: "800", color: "#1a1a2e", marginBottom: 4 },
  tipDesc: { fontSize: 11, color: "#888", lineHeight: 15 },
  sloganSection: { marginTop: 24, marginHorizontal: 16, padding: 24, backgroundColor: "#fff", borderRadius: 18, alignItems: "center", borderWidth: 1, borderColor: "#fde2e4" },
  sloganEmoji: { fontSize: 30, marginBottom: 8 },
  sloganText: { fontSize: 13.5, fontStyle: "italic", color: "#888", textAlign: "center", lineHeight: 22 },
  emptyCard: { backgroundColor: "#fff", borderRadius: 14, padding: 20, alignItems: "center" },
  emptyEmoji: { fontSize: 28, marginBottom: 6 },
  emptyText: { color: "#aaa", fontSize: 13 },
});
