// src/screens/RegisterDonateScreen.jsx
// Màn hình Đăng ký Hiến máu — TP. Đà Nẵng
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";

export default function RegisterDonateScreen({ navigation }) {
  // ─── 1. QUẢN LÝ TRẠNG THÁI (STATE) ───────────────────
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [theTich, setTheTich] = useState(350); // Mặc định 350ml
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [existingRegistration, setExistingRegistration] = useState(null);

  // ─── 2. HÀM TẢI DỮ LIỆU TỪ BACKEND C# ─────────────────
  const fetchData = useCallback(async () => {
    try {
      setErrorMsg("");

      // Gọi đồng thời: Lấy chiến dịch & Kiểm tra đơn đã đăng ký
      const [campRes, checkRes] = await Promise.allSettled([
        api.get(ENDPOINTS.CHIEN_DICH.GET_ALL),
        api.get(ENDPOINTS.DON_DANG_KY.CHECK),
      ]);

      if (campRes.status === "fulfilled") {
        const all = campRes.value.data?.data || campRes.value.data || [];
        const active = all.filter(
          (c) => c.trangThai === "DangDienRa" || c.trangThai === "ChuaBatDau",
        );
        setCampaigns(active);
        if (active.length > 0) {
          setSelectedCampaign(active[0].maChienDich);
        }
      }

      if (checkRes.status === "fulfilled" && checkRes.value.data?.data) {
        setExistingRegistration(checkRes.value.data.data);
      }
    } catch (e) {
      console.warn("Lỗi tải dữ liệu đăng ký hiến máu:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── 3. HÀM XỬ LÝ GỬI ĐƠN ĐĂNG KÝ HIẾN MÁU ────────────
  const handleRegister = async () => {
    if (!selectedCampaign) {
      setErrorMsg("Vui lòng chọn 1 chiến dịch hiến máu");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await api.post(ENDPOINTS.DON_DANG_KY.GET_ALL, {
        maChienDich: selectedCampaign,
        theTich: parseInt(theTich, 10),
      });

      if (response.data?.success || response.status === 200) {
        if (Platform.OS === 'web') {
          alert("🎉 Đăng ký thành công!\nĐơn đăng ký hiến máu của bạn đã được ghi nhận vào hệ thống.");
          fetchData();
        } else {
          Alert.alert(
            "🎉 Đăng ký thành công!",
            "Đơn đăng ký hiến máu của bạn đã được ghi nhận vào hệ thống.",
            [{ text: "Đã hiểu", onPress: () => fetchData() }],
          );
        }
      } else {
        setErrorMsg(
          response.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
        );
      }
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.Message ||
        (typeof e.response?.data === "string" ? e.response.data : null) ||
        "Lỗi kết nối đến server. Vui lòng kiểm tra lại.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>
          Đang tải danh sách chiến dịch hiến máu...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <Text style={styles.headerTitle}>Đăng ký Hiến máu</Text>
        <Text style={styles.headerSub}>
          Đồng hành cùng Hệ thống Hiến máu Nhân đạo TP. Đà Nẵng
        </Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* NẾU ĐÃ ĐĂNG KÝ THÀNH CÔNG RỒI */}
        {existingRegistration ? (
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Đã đăng ký hiến máu!</Text>
            <Text style={styles.successDesc}>
              Bạn hiện có 1 đơn đăng ký hiến máu đang chờ tiếp nhận.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoRow}>
                📍 Chiến dịch:{" "}
                <Text style={styles.boldText}>
                  {existingRegistration.chienDich?.tenChienDich ||
                    "Chiến dịch chung"}
                </Text>
              </Text>
              <Text style={styles.infoRow}>
                🩸 Thể tích đăng ký:{" "}
                <Text style={styles.boldText}>
                  {existingRegistration.theTich || 350} ml
                </Text>
              </Text>
              <Text style={styles.infoRow}>
                📋 Mã đơn:{" "}
                <Text style={styles.boldText}>
                  {existingRegistration.maDon}
                </Text>
              </Text>
            </View>
          </View>
        ) : (
          /* NẾU CHƯA ĐĂNG KÝ -> ĐƯỢC CHỌN VÀ ĐĂNG KÝ */
          <View>
            {/* 1. CHỌN CHIẾN DỊCH */}
            <Text style={styles.sectionTitle}>1. Chọn chiến dịch hiến máu</Text>
            {campaigns.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Hiện chưa có chiến dịch nào mở đăng ký.
                </Text>
              </View>
            ) : (
              campaigns.map((c) => {
                const isSelected = selectedCampaign === c.maChienDich;
                return (
                  <Pressable
                    key={c.maChienDich}
                    onPress={() => {
                      setSelectedCampaign(c.maChienDich);
                      setErrorMsg("");
                    }}
                    style={({ pressed }) => [
                      styles.campCard,
                      isSelected && styles.campCardSelected,
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <View style={styles.radioCircle}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.campBody}>
                      <Text
                        style={[
                          styles.campName,
                          isSelected && { color: "#e62e43" },
                        ]}
                      >
                        {c.tenChienDich}
                      </Text>
                      <Text style={styles.campSub}>
                        📍{" "}
                        {c.diaDiem?.tenDiaDiem ||
                          c.diaDiem?.diaChi ||
                          "TP. Đà Nẵng"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}

            {/* 2. CHỌN THỂ TÍCH MÁU */}
            <Text style={styles.sectionTitle}>
              2. Chọn thể tích máu đăng ký
            </Text>
            <View style={styles.volumeRow}>
              {[250, 350, 450].map((vol) => {
                const isSelected = theTich === vol;
                return (
                  <Pressable
                    key={vol}
                    onPress={() => setTheTich(vol)}
                    style={[
                      styles.volumeBtn,
                      isSelected && styles.volumeBtnSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.volumeNum,
                        isSelected && { color: "#e62e43" },
                      ]}
                    >
                      {vol}
                    </Text>
                    <Text
                      style={[
                        styles.volumeUnit,
                        isSelected && { color: "#e62e43" },
                      ]}
                    >
                      ml
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* THÔNG BÁO LỖI NẾU CÓ */}
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠ {errorMsg}</Text>
              </View>
            ) : null}

            {/* NÚT GỬI ĐĂNG KÝ */}
            <Pressable
              onPress={handleRegister}
              disabled={submitting || campaigns.length === 0}
              style={({ pressed }) => [
                styles.submitBtnWrap,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <LinearGradient
                colors={["#e62e43", "#c01b30"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    XÁC NHẬN ĐĂNG KÝ HIẾN MÁU
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        )}

        <View style={{ height: 30 }} />
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a2e",
    marginTop: 16,
    marginBottom: 12,
  },

  // Card chiến dịch chọn
  campCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#e8ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  campCardSelected: { borderColor: "#e62e43", backgroundColor: "#fef3f4" },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e62e43",
  },
  campBody: { flex: 1 },
  campName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  campSub: { fontSize: 12, color: "#777" },

  // Chọn thể tích
  volumeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  volumeBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e8ecef",
  },
  volumeBtnSelected: { borderColor: "#e62e43", backgroundColor: "#fef3f4" },
  volumeNum: { fontSize: 20, fontWeight: "900", color: "#1a1a2e" },
  volumeUnit: { fontSize: 12, color: "#888", fontWeight: "700" },

  // Thông báo lỗi
  errorContainer: {
    backgroundColor: "#ffeef0",
    borderColor: "#fdbdc3",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#e62e43", fontSize: 13, fontWeight: "600" },

  // Nút Submit
  submitBtnWrap: { borderRadius: 25, overflow: "hidden", marginTop: 8 },
  submitBtn: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // Thẻ đã đăng ký thành công
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#dcfce7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 10,
  },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#166534",
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
  },
  infoRow: { fontSize: 13.5, color: "#475569", marginBottom: 8 },
  boldText: { fontWeight: "800", color: "#0f172a" },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderStyle: "dashed",
  },
  emptyText: { color: "#aaa", fontSize: 13, textAlign: "center" },
});
