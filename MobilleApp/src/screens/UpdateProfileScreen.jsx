// src/screens/UpdateProfileScreen.jsx
// Màn hình Cập nhật Hồ sơ Tình nguyện viên — TP. Đà Nẵng
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
import AnimatedInput from "../components/AnimatedInput";

export default function UpdateProfileScreen({ navigation }) {
  // ─── 1. QUẢN LÝ TRẠNG THÁI (STATE FORM) ──────────────
  const [hoTen, setHoTen] = useState("");
  const [cccd, setCccd] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [gioiTinh, setGioiTinh] = useState("Nam");
  const [nhomMau, setNhomMau] = useState("O");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ─── 2. HÀM NẠP HỒ SƠ HIỆN TẠI TỪ BACKEND C# ─────────
  const fetchCurrentProfile = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.TNV.ME);
      const data = res.data?.data;
      if (data) {
        setHoTen(data.hoTen || "");
        setCccd(data.cccd || "");
        setNgaySinh(data.ngaySinh || "");
        setSoDienThoai(data.soDienThoai || "");
        setDiaChi(data.diaChi || "");
        setGioiTinh(data.gioiTinh || "Nam");
        setNhomMau(data.nhomMau || "O");
      }
    } catch (e) {
      console.warn("Lỗi đọc hồ sơ hiện tại:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  // ─── 3. HÀM GỬI CẬP NHẬT HỒ SƠ LÊN BACKEND C# ────────
  const handleSaveProfile = async () => {
    if (!hoTen.trim()) {
      setErrorMsg("Vui lòng nhập Họ và tên");
      return;
    }
    if (!cccd.trim()) {
      setErrorMsg("Vui lòng nhập số CCCD/CMND");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await api.put(ENDPOINTS.TNV.ME, {
        hoTen: hoTen.trim(),
        cccd: cccd.trim(),
        ngaySinh: ngaySinh.trim(),
        soDienThoai: soDienThoai.trim(),
        diaChi: diaChi.trim(),
        gioiTinh: gioiTinh,
        nhomMau: nhomMau,
      });

      if (response.data?.success || response.status === 200) {
        if (Platform.OS === 'web') {
          alert("🎉 Đã lưu cập nhật thông tin hồ sơ!");
          navigation.goBack();
        } else {
          Alert.alert("🎉 Thành công", "Đã lưu cập nhật thông tin hồ sơ!", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        setErrorMsg(response.data?.message || "Cập nhật hồ sơ thất bại.");
      }
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.Message ||
        "Lỗi kết nối đến server. Vui lòng thử lại.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang nạp thông tin hồ sơ...</Text>
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
          <View>
            <Text style={styles.headerTitle}>Cập nhật Hồ sơ</Text>
            <Text style={styles.headerSub}>Thông tin Tình nguyện viên Đà Nẵng</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formCard}>
          {/* Ô nhập Họ và tên */}
          <AnimatedInput
            label="Họ và tên"
            value={hoTen}
            onChangeText={(txt) => {
              setHoTen(txt);
              setErrorMsg("");
            }}
            iconName="person"
          />

          {/* Ô nhập CCCD */}
          <AnimatedInput
            label="Số CCCD / CMND"
            value={cccd}
            onChangeText={(txt) => {
              setCccd(txt);
              setErrorMsg("");
            }}
            iconName="card"
            keyboardType="number-pad"
          />

          {/* Ô nhập Ngày sinh */}
          <AnimatedInput
            label="Ngày sinh (YYYY-MM-DD)"
            value={ngaySinh}
            onChangeText={setNgaySinh}
            iconName="calendar"
          />

          {/* Ô nhập Số điện thoại */}
          <AnimatedInput
            label="Số điện thoại"
            value={soDienThoai}
            onChangeText={setSoDienThoai}
            iconName="call"
            keyboardType="phone-pad"
          />

          {/* Ô nhập Địa chỉ */}
          <AnimatedInput
            label="Địa chỉ thường trú"
            value={diaChi}
            onChangeText={setDiaChi}
            iconName="location"
          />

          {/* Chọn Giới tính */}
          <Text style={styles.inputLabel}>Giới tính</Text>
          <View style={styles.selectRow}>
            {["Nam", "Nữ"].map((g) => (
              <Pressable
                key={g}
                onPress={() => setGioiTinh(g)}
                style={[
                  styles.selectBtn,
                  gioiTinh === g && styles.selectBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.selectText,
                    gioiTinh === g && styles.selectTextActive,
                  ]}
                >
                  {g === "Nam" ? "👨 Nam" : "👩 Nữ"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Chọn Nhóm máu */}
          <Text style={styles.inputLabel}>Nhóm máu</Text>
          <View style={styles.bloodGrid}>
            {["O", "A", "B", "AB"].map((m) => (
              <Pressable
                key={m}
                onPress={() => setNhomMau(m)}
                style={[
                  styles.bloodBtn,
                  nhomMau === m && styles.bloodBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.bloodText,
                    nhomMau === m && styles.bloodTextActive,
                  ]}
                >
                  🩸 Nhóm {m}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Khung thông báo lỗi */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {errorMsg}</Text>
            </View>
          ) : null}

          {/* Nút Nộp Cập Nhật */}
          <Pressable
            onPress={handleSaveProfile}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitWrap,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <LinearGradient
              colors={["#e62e43", "#c01b30"]}
              style={styles.submitGradient}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>LƯU THÔNG TIN HỒ SƠ</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ─── 4. STYLES ─────────────────────────────────────────
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
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  scrollContent: { padding: 16 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: { fontSize: 13, fontWeight: "700", color: "#444", marginTop: 12, marginBottom: 8 },
  
  // Select Giới tính
  selectRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  selectBtn: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  selectBtnActive: { borderColor: "#e62e43", backgroundColor: "#fef3f4" },
  selectText: { fontSize: 14, fontWeight: "700", color: "#64748b" },
  selectTextActive: { color: "#e62e43" },

  // Grid Nhóm máu
  bloodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  bloodBtn: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  bloodBtnActive: { borderColor: "#e62e43", backgroundColor: "#fef3f4" },
  bloodText: { fontSize: 13.5, fontWeight: "700", color: "#64748b" },
  bloodTextActive: { color: "#e62e43" },

  // Thùy thông báo lỗi
  errorBox: {
    backgroundColor: "#ffeef0",
    borderColor: "#fdbdc3",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#e62e43", fontSize: 13, fontWeight: "600" },

  // Nút Submit
  submitWrap: { borderRadius: 25, overflow: "hidden", marginTop: 10 },
  submitGradient: { paddingVertical: 16, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "900", letterSpacing: 0.5 },
});
