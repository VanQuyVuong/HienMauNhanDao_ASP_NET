// src/screens/NewsScreen.jsx
// Màn hình Danh sách Tin tức & Sức khoẻ — TP. Đà Nẵng
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
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";

// Banner mặc định khi không có hình từ Backend
const DEFAULT_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=600&q=80";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

export default function NewsScreen({ navigation }) {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNews = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.TIN_TUC.GET_ALL);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      
      // Sắp xếp tin tức từ mới nhất đến cũ nhất
      list.sort((a, b) => new Date(b.ngayDang || 0) - new Date(a.ngayDang || 0));
      setNewsList(list);
    } catch (e) {
      console.warn("Lỗi nạp tin tức:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  // Lọc theo Danh mục & Từ khóa tìm kiếm
  const filteredNews = newsList.filter((item) => {
    const matchCat =
      selectedCategory === "ALL" ||
      item.loaiTin === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      item.tieuDe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.noiDung?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang tải tin tức y tế...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <Text style={styles.headerTitle}>Tin Tức & Sức Khoẻ</Text>
        <Text style={styles.headerSub}>Kiến thức hiến máu & Thông tin sự kiện Đà Nẵng</Text>

        {/* Thanh tìm kiếm */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Tìm kiếm bài viết, kiến thức hiến máu..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Text style={{ fontSize: 16, color: "#999" }}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      {/* Tabs Lọc Danh Mục */}
      <View style={styles.categoryRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "KienThuc", label: "📖 Kiến thức" },
            { id: "SuKien", label: "🎪 Sự kiện" },
            { id: "TinTuc", label: "📰 Tin tức" },
          ].map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Danh sách bài viết */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e62e43" />
        }
      >
        {filteredNews.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📰</Text>
            <Text style={styles.emptyText}>Chưa có bài viết nào phù hợp.</Text>
          </View>
        ) : (
          filteredNews.map((item, idx) => (
            <Pressable
              key={item.maTinTuc || idx}
              style={({ pressed, hovered }) => [
                styles.newsCard,
                pressed && { transform: [{ scale: 0.98 }] },
                Platform.OS === "web" && hovered && styles.newsCardHovered,
              ]}
              onPress={() => navigation.navigate("NewsDetail", { newsItem: item })}
            >
              <Image
                source={{
                  uri: item.hinhAnh && item.hinhAnh.startsWith("http")
                    ? item.hinhAnh
                    : DEFAULT_NEWS_IMAGE,
                }}
                style={styles.cardImage}
              />

              <View style={styles.cardBody}>
                <View style={styles.badgeRow}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>
                      {item.loaiTin === "KienThuc"
                        ? "📖 Kiến thức"
                        : item.loaiTin === "SuKien"
                          ? "🎪 Sự kiện"
                          : "📰 Tin tức"}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>🗓 {formatDate(item.ngayDang)}</Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.tieuDe}
                </Text>

                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.noiDung}
                </Text>

                <View style={styles.readMoreRow}>
                  <Text style={styles.readMoreText}>Đọc tiếp →</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2, marginBottom: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13.5, color: "#333", outlineStyle: "none" },
  
  categoryRow: { marginVertical: 12 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryChipActive: { backgroundColor: "#e62e43", borderColor: "#e62e43" },
  categoryChipText: { fontSize: 12.5, fontWeight: "700", color: "#64748b" },
  categoryChipTextActive: { color: "#fff" },

  scrollContent: { paddingHorizontal: 16 },
  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  newsCardHovered: { transform: [{ translateY: -3 }], shadowOpacity: 0.12 },
  cardImage: { width: "100%", height: 160, backgroundColor: "#fee" },
  cardBody: { padding: 16 },
  badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  categoryTag: { backgroundColor: "#ffeef0", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  categoryTagText: { fontSize: 11, fontWeight: "700", color: "#e62e43" },
  dateText: { fontSize: 11, color: "#94a3b8" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 6, lineHeight: 22 },
  cardDesc: { fontSize: 13, color: "#64748b", lineHeight: 18, marginBottom: 12 },
  readMoreRow: { alignItems: "flex-end" },
  readMoreText: { fontSize: 12.5, fontWeight: "800", color: "#e62e43" },
  emptyCard: { backgroundColor: "#fff", borderRadius: 16, padding: 30, alignItems: "center", marginTop: 20 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
});
