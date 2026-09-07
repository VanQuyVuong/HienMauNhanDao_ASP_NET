import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";

export default function RegistrationTicketScreen({ route, navigation }) {
  const { maDon, registrationData } = route.params || {};
  const [ticketData, setTicketData] = useState(registrationData || null);
  const [loading, setLoading] = useState(!registrationData);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!ticketData && maDon) {
      fetchTicket();
    }
  }, [maDon]);

  const fetchTicket = async () => {
    try {
      const historyRes = await api.get(ENDPOINTS.DON_DANG_KY.GET_ALL);
      const historyList = historyRes.data?.data;
      if (Array.isArray(historyList)) {
        const found = historyList.find((d) => d.maDon === maDon || d.MaDon === maDon);
        if (found) {
          setTicketData(found);
        } else {
          setErrorMsg("Không tìm thấy thông tin đơn đăng ký.");
        }
      }
    } catch (e) {
      setErrorMsg("Không thể tải thông tin đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Đang tải phiếu đăng ký...</Text>
      </View>
    );
  }

  if (errorMsg || !ticketData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg || "Lỗi không xác định."}</Text>
        <Pressable onPress={() => navigation.navigate("Home")} style={styles.backHomeBtn}>
          <Text style={styles.backHomeText}>Về Trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#059669", "#047857"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.navigate("Home")} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>ĐĂNG KÝ THÀNH CÔNG</Text>
            <Text style={styles.headerSub}>Chi tiết phiếu đăng ký hiến máu</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ticket Container */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketLabel}>MÃ ĐĂNG KÝ CỦA BẠN</Text>
            <Text style={styles.ticketCode}>{ticketData.maDon || ticketData.MaDon}</Text>
          </View>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>💡</Text>
            <Text style={styles.warningText}>Vui lòng chụp màn hình phiếu này và xuất trình tại quầy tiếp đón để được làm thủ tục nhanh nhất.</Text>
          </View>

          <View style={styles.ticketBody}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionIcon}>📄</Text>
              <Text style={styles.sectionText}>Thông Tin Đăng Ký</Text>
            </View>

            {/* In a real app we'd fetch the user's name/dob, but we just show campaign info and ID here since that's what's in DonDangKy */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Chiến dịch</Text>
                <Text style={styles.value}>{ticketData.chienDich?.tenChienDich || ticketData.ChienDich?.TenChienDich || "Hiến máu thường xuyên"}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Dung tích</Text>
                <Text style={styles.valueRed}>{ticketData.theTich || ticketData.TheTich} ml</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Trạng thái</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Đang chờ tiếp nhận</Text>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Thời gian đăng ký</Text>
                <Text style={styles.value}>
                  {(ticketData.thoiGianDangKy || ticketData.ThoiGianDangKy) 
                    ? new Date(ticketData.thoiGianDangKy || ticketData.ThoiGianDangKy).toLocaleString("vi-VN") 
                    : "---"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable style={styles.btnSecondary} onPress={() => navigation.navigate("DonationHistory")}>
            <Text style={styles.btnSecondaryText}>VỀ DANH SÁCH</Text>
          </Pressable>
          <Pressable style={styles.btnPrimary} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.btnPrimaryText}>VỀ TRANG CHỦ</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 15 },
  backText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "900", textTransform: "uppercase" },
  headerSub: { color: "#d1fae5", fontSize: 13, marginTop: 4 },
  scrollContent: { padding: 20 },
  
  ticketCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  ticketHeader: { padding: 24, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#f3f4f6", borderStyle: "dashed" },
  ticketLabel: { fontSize: 12, color: "#6b7280", fontWeight: "700", marginBottom: 8 },
  ticketCode: { fontSize: 32, fontWeight: "900", color: "#e62e43", letterSpacing: 2 },
  
  warningBox: { flexDirection: "row", backgroundColor: "#fef9c3", margin: 20, padding: 16, borderRadius: 12, alignItems: "flex-start" },
  warningIcon: { fontSize: 18, marginRight: 12 },
  warningText: { flex: 1, fontSize: 13, color: "#854d0e", lineHeight: 20 },
  
  ticketBody: { padding: 24, backgroundColor: "#f8fafc", borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  sectionTitle: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  sectionIcon: { fontSize: 18, marginRight: 8 },
  sectionText: { fontSize: 16, fontWeight: "800", color: "#e62e43" },
  
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  col: { flex: 1, paddingRight: 10 },
  label: { fontSize: 11, color: "#6b7280", fontWeight: "700", textTransform: "uppercase", marginBottom: 6 },
  value: { fontSize: 14, color: "#111827", fontWeight: "700" },
  valueRed: { fontSize: 14, color: "#e62e43", fontWeight: "800" },
  
  statusBadge: { backgroundColor: "#dcfce7", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#166534", fontSize: 12, fontWeight: "700" },
  
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  btnSecondary: { flex: 1, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#1e293b", padding: 16, borderRadius: 12, alignItems: "center", marginRight: 10 },
  btnSecondaryText: { color: "#1e293b", fontSize: 14, fontWeight: "800" },
  btnPrimary: { flex: 1, backgroundColor: "#1e293b", padding: 16, borderRadius: 12, alignItems: "center", marginLeft: 10 },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6b7280" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 16, color: "#e62e43", marginBottom: 20, textAlign: "center" },
  backHomeBtn: { backgroundColor: "#1e293b", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  backHomeText: { color: "#fff", fontWeight: "bold" },
});
