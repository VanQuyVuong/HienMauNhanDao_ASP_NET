// src/components/NotificationModal.jsx
// Modal Thông Báo Hệ Thống Hiến Máu Nhân Đạo Đà Nẵng
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const INITIAL_NOTIFS = [
  {
    id: "1",
    type: "URGENT",
    title: "⚡ Kêu gọi hiến máu khẩn cấp!",
    desc: "Bệnh viện C Đà Nẵng cần gấp 50 đơn vị máu Nhóm O và Nhóm B.",
    time: "10 phút trước",
    unread: true,
  },
  {
    id: "2",
    type: "CAMPAIGN",
    title: "📋 Chiến dịch mới phát động",
    desc: "Chiến dịch 'Hành Trình Đỏ 2026' đã mở đăng ký tại Công viên 29/3.",
    time: "2 giờ trước",
    unread: true,
  },
  {
    id: "3",
    type: "NEWS",
    title: "📖 Tin tức sức khoẻ mới",
    desc: "Đã cập nhật bài viết: '5 lưu ý dinh dưỡng quan trọng sau khi hiến máu'.",
    time: "Hôm qua",
    unread: false,
  },
  {
    id: "4",
    type: "SUCCESS",
    title: "🩸 Đơn đăng ký đã xác nhận",
    desc: "Đơn đăng ký tham gia hiến máu ngày 15/03 của bạn đã được tiếp nhận thành công.",
    time: "2 ngày trước",
    unread: false,
  },
];

export default function NotificationModal({ visible, onClose }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "URGENT":
        return "⚡";
      case "CAMPAIGN":
        return "📋";
      case "NEWS":
        return "📰";
      case "SUCCESS":
        return "🩸";
      default:
        return "🔔";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>Thông Báo Hệ Thống</Text>
                <Text style={styles.headerSub}>Cập nhật chiến dịch & tin tức mới nhất</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
          </LinearGradient>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <Text style={styles.unreadCount}>
              {notifications.filter((n) => n.unread).length} chưa đọc
            </Text>
            <Pressable onPress={handleMarkAllRead}>
              <Text style={styles.markReadText}>Đánh dấu đã đọc tất cả</Text>
            </Pressable>
          </View>

          {/* Scroll List */}
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.notifCard,
                  item.unread && styles.notifCardUnread,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Text style={{ fontSize: 18 }}>{getNotifIcon(item.type)}</Text>
                </View>

                <View style={styles.notifContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    {item.unread && <View style={styles.dotUnread} />}
                  </View>

                  <Text style={styles.notifDesc}>{item.desc}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              </View>
            ))}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    overflow: "hidden",
  },
  header: { padding: 20, paddingTop: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  unreadCount: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  markReadText: { fontSize: 12, fontWeight: "700", color: "#e62e43" },
  scrollList: { padding: 16 },
  notifCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  notifCardUnread: { backgroundColor: "#fef3f4", borderColor: "#fdbdc3" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notifContent: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notifTitle: { fontSize: 13.5, fontWeight: "800", color: "#1e293b", flex: 1 },
  dotUnread: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#e62e43" },
  notifDesc: { fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 16 },
  notifTime: { fontSize: 10.5, color: "#94a3b8", marginTop: 6 },
});
