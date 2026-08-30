// src/screens/NewsDetailScreen.jsx
// Màn hình Chi tiết Tin tức & Sức khỏe — Đà Nẵng
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Helper: format ngày dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

export default function NewsDetailScreen({ route, navigation }) {
  const { newsItem } = route.params || {};

  if (!newsItem) {
    return (
      <View style={styles.root}>
        <Text style={{ margin: 20 }}>Không tìm thấy nội dung bài viết.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết Tin tức</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ảnh bài viết */}
        {newsItem.hinhAnh ? (
          <Image
            source={{ uri: newsItem.hinhAnh }}
            style={styles.bannerImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 48 }}>📰</Text>
          </View>
        )}

        {/* Thẻ thể loại & Ngày */}
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {newsItem.loaiTin === "KienThuc"
                ? "📖 Kiến thức sức khỏe"
                : newsItem.loaiTin === "SuKien"
                  ? "🎪 Sự kiện hiến máu"
                  : "📰 Tin tức chung"}
            </Text>
          </View>
          <Text style={styles.dateText}>
            🗓 {formatDate(newsItem.ngayDang)}
          </Text>
        </View>

        {/* Tiêu đề bài viết */}
        <Text style={styles.title}>{newsItem.tieuDe}</Text>

        {/* Đường gạch ngang phân cách */}
        <View style={styles.divider} />

        {/* Nội dung bài viết */}
        <Text style={styles.content}>
          {newsItem.noiDung ||
            "Nội dung chi tiết bài viết đang được cập nhật..."}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
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
  scrollContent: { padding: 20 },
  bannerImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#ffeef0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#ffeef0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { color: "#e62e43", fontSize: 12, fontWeight: "700" },
  dateText: { fontSize: 12, color: "#94a3b8" },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1a1a2e",
    lineHeight: 28,
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 16 },
  content: { fontSize: 15, color: "#334155", lineHeight: 24 },
});
