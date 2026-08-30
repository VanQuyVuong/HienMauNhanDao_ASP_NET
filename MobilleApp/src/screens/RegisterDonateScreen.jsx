// src/screens/RegisterDonateScreen.jsx
// Màn hình Đăng ký hiến máu (dạng Placeholder — phát triển chi tiết sau)
import React from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterDonateScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <Text style={styles.headerTitle}>Đăng ký Hiến máu</Text>
        <Text style={styles.headerSub}>
          Đăng ký tham gia chiến dịch hiến máu
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.emoji}>🩸</Text>
        <Text style={styles.title}>Tính năng đăng ký hiến máu</Text>
        <Text style={styles.desc}>
          Chức năng đăng ký lịch hiến máu di động sẽ được phát triển chi tiết ở
          các bước tiếp theo.
        </Text>
        <Pressable
          onPress={() => navigation.navigate("TrangChu")}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.btnText}>← Quay lại Trang chủ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: "#e62e43",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
