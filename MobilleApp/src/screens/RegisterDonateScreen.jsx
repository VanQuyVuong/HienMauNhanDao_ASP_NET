// src/screens/RegisterDonateScreen.jsx
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
  TextInput,
  Modal,
  Switch
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { ENDPOINTS } from "../constants/api";

export default function RegisterDonateScreen({ route, navigation }) {
  const preselectedCampaignId = route?.params?.campaignId;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [existingRegistration, setExistingRegistration] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Step 1
  const [phuongXaList, setPhuongXaList] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [formData, setFormData] = useState({
    hoVaTen: "", soCCCD: "", ngaySinh: "", gioiTinh: "Nam",
    soDienThoai: "", diaChi: "", maPhuongXa: "", nhomMau: "O"
  });

  // Step 2
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(preselectedCampaignId || null);
  const [theTich, setTheTich] = useState(350);

  // Step 3
  const [health, setHealth] = useState({
    khangSinh: false,
    truyenNhiem: false,
    dauHong: false,
    coThai: false,
  });
  const [moTaKhac, setMoTaKhac] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setErrorMsg("");
      
      const [pxRes, campRes, tnvRes] = await Promise.allSettled([
        api.get(ENDPOINTS.PHUONG_XA.GET_ALL),
        api.get(ENDPOINTS.CHIEN_DICH.GET_ALL),
        api.get(ENDPOINTS.TNV.ME)
      ]);
      
      if (pxRes.status === "fulfilled") {
        setPhuongXaList(pxRes.value.data?.data || pxRes.value.data || []);
      }
      
      let defaultCamp = null;
      if (campRes.status === "fulfilled") {
        const all = campRes.value.data?.data || campRes.value.data || [];
        const active = all.filter(c => c.trangThai === "DangDienRa" || c.trangThai === "ChuaBatDau");
        setCampaigns(active);
        if (preselectedCampaignId) defaultCamp = preselectedCampaignId;
        else if (active.length > 0) defaultCamp = active[0].maChienDich;
        
        setSelectedCampaign(defaultCamp);
      }
      
      let maTNV = null;
      if (tnvRes.status === "fulfilled" && tnvRes.value.data) {
        const tnv = tnvRes.value.data;
        maTNV = tnv.maTNV;
        let formattedDate = "";
        if (tnv.ngaySinh) {
          const d = new Date(tnv.ngaySinh);
          formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        }

        setFormData({
          hoVaTen: tnv.hoTen || tnv.HoTen || "",
          soCCCD: tnv.cccd || tnv.Cccd || "",
          ngaySinh: formattedDate,
          gioiTinh: (tnv.gioiTinh === "Nu" || tnv.gioiTinh === "Nữ") ? "Nữ" : "Nam",
          soDienThoai: tnv.soDienThoai || tnv.SoDienThoai || "",
          diaChi: tnv.diaChi || tnv.DiaChi || "",
          maPhuongXa: tnv.maPhuongXa || tnv.MaPhuongXa || "",
          nhomMau: tnv.nhomMau || "O"
        });
      }
      
      if (maTNV) {
        try {
           const historyRes = await api.get(ENDPOINTS.DON_DANG_KY.GET_ALL);
           const historyList = historyRes.data?.data;
           if (Array.isArray(historyList)) {
             // 3 = DaHuy, 4 = DaTuChoi, 5 = DaHoanThanh, 0 = DaDangKy, 1 = ChoDuyet, 2 = DaDuyet
             const activeReg = historyList.find(d => 
               d.trangThai === "DaDangKy" || d.trangThai === "ChoDuyet" || d.trangThai === "DaDuyet" || 
               d.trangThai === 0 || d.trangThai === 1 || d.trangThai === 2
             );
             if (activeReg) {
               setExistingRegistration(activeReg);
             }
           }
        } catch (e) {
           // ignore
        }
      }
      
    } catch (e) {
      console.warn("Lỗi tải dữ liệu đăng ký:", e.message);
    } finally {
      setLoading(false);
    }
  }, [preselectedCampaignId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextStep = async () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.hoVaTen || !formData.soCCCD || formData.soCCCD.length !== 12 || !formData.ngaySinh || !formData.soDienThoai || !formData.diaChi || !formData.maPhuongXa) {
        setErrorMsg("Vui lòng điền đầy đủ và chính xác thông tin (CCCD 12 số).");
        return;
      }
      // Update User Info
      try {
        setSubmitting(true);
        
        let parsedDate = formData.ngaySinh;
        if (parsedDate.includes('/')) {
            const parts = parsedDate.split('/');
            if (parts.length === 3) {
                parsedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        const tnvData = {
          hoTen: formData.hoVaTen,
          cccd: formData.soCCCD,
          ngaySinh: parsedDate,
          soDienThoai: formData.soDienThoai,
          diaChi: formData.diaChi,
          gioiTinh: formData.gioiTinh === "Nữ" ? "Nu" : "Nam",
          maPhuongXa: formData.maPhuongXa,
          nhomMau: formData.nhomMau || "O"
        };
        
        await api.put(ENDPOINTS.TNV.ME, tnvData);
        setStep(2);
      } catch (error) {
        setErrorMsg(error.response?.data?.message || "Lỗi cập nhật thông tin cá nhân");
      } finally {
        setSubmitting(false);
      }
    } else if (step === 2) {
      if (!selectedCampaign) {
        setErrorMsg("Vui lòng chọn chiến dịch");
        return;
      }
      setStep(3);
    }
  };

  const handleRegister = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      // Create Don Dang Ky
      const donRes = await api.post(ENDPOINTS.DON_DANG_KY.GET_ALL, {
        maChienDich: selectedCampaign,
        theTich: theTich,
      });

      const maDon = donRes.data?.maDon || donRes.data?.data?.maDon;
      if (!maDon) throw new Error("Không tạo được mã đơn đăng ký");

      // Create HoSoSucKhoe
      await api.post(ENDPOINTS.HOSO_SUCKHOE.CREATE, {
        maDon: maDon,
        khangSinh: health.khangSinh,
        truyenNhiem: health.truyenNhiem,
        dauHong: health.dauHong,
        coThai: health.coThai,
        moTaKhac: moTaKhac || null
      });

      setShowSuccessModal(true);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || e.message || "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e62e43" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.header}>
        <View style={styles.headerRow}>
          {navigation.canGoBack() && (
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
          )}
          <View>
            <Text style={styles.headerTitle}>Đăng ký Hiến máu</Text>
            <Text style={styles.headerSub}>Đồng hành cùng TP. Đà Nẵng</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {existingRegistration ? (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
                <Text style={styles.ticketEmoji}>🩸</Text>
                <Text style={styles.ticketTitle}>ĐƠN ĐĂNG KÝ HIẾN MÁU</Text>
                <View style={styles.ticketStatus}><Text style={styles.ticketStatusText}>Đang chờ tiếp nhận</Text></View>
            </View>
            <View style={styles.ticketBody}>
                <Text style={styles.ticketLabel}>Mã đơn</Text>
                <Text style={styles.ticketValue}>{existingRegistration.maDon || existingRegistration.MaDon}</Text>
                
                <Text style={styles.ticketLabel}>Chiến dịch</Text>
                <Text style={styles.ticketValue}>{existingRegistration.chienDich?.tenChienDich || existingRegistration.ChienDich?.TenChienDich || "Hiến máu tình nguyện"}</Text>
                
                <Text style={styles.ticketLabel}>Thể tích đăng ký</Text>
                <Text style={styles.ticketValue}>{existingRegistration.theTich || existingRegistration.TheTich} ml</Text>
                
                <Text style={styles.ticketLabel}>Thời gian đăng ký</Text>
                <Text style={styles.ticketValue}>
                  {existingRegistration.thoiGianDangKy || existingRegistration.ThoiGianDangKy ? new Date(existingRegistration.thoiGianDangKy || existingRegistration.ThoiGianDangKy).toLocaleString('vi-VN') : "---"}
                </Text>
            </View>
            <View style={styles.ticketFooter}>
                <Text style={styles.ticketFooterText}>Vui lòng đưa mã đơn này cho nhân viên y tế tại quầy tiếp nhận để làm thủ tục hiến máu. Xin cảm ơn!</Text>
            </View>
          </View>
        ) : (
          <View>
            {/* Thanh tiến trình */}
            <View style={styles.progressBar}>
              <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]}><Text style={styles.progressText}>1</Text></View>
              <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
              <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]}><Text style={styles.progressText}>2</Text></View>
              <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
              <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]}><Text style={styles.progressText}>3</Text></View>
            </View>
            <Text style={styles.stepTitle}>
              {step === 1 ? "1. Thông tin cá nhân" : step === 2 ? "2. Chiến dịch & Thể tích" : "3. Khai báo y tế"}
            </Text>

            {/* BƯỚC 1: THÔNG TIN CÁ NHÂN */}
            {step === 1 && (
              <View style={styles.formCard}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput style={styles.input} value={formData.hoVaTen} onChangeText={(t) => setFormData({...formData, hoVaTen: t})} placeholder="Nhập họ và tên" />

                <Text style={styles.label}>Số CCCD</Text>
                <TextInput style={styles.input} value={formData.soCCCD} onChangeText={(t) => setFormData({...formData, soCCCD: t})} placeholder="Nhập 12 số CCCD" keyboardType="numeric" maxLength={12} />

                <Text style={styles.label}>Ngày sinh (DD/MM/YYYY)</Text>
                <TextInput style={styles.input} value={formData.ngaySinh} onChangeText={(t) => setFormData({...formData, ngaySinh: t})} placeholder="VD: 31/12/1990" />

                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderRow}>
                  {["Nam", "Nữ"].map(g => (
                    <Pressable key={g} style={[styles.genderBtn, formData.gioiTinh === g && styles.genderBtnActive]} onPress={() => setFormData({...formData, gioiTinh: g})}>
                      <Text style={[styles.genderText, formData.gioiTinh === g && styles.genderTextActive]}>{g}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput style={styles.input} value={formData.soDienThoai} onChangeText={(t) => setFormData({...formData, soDienThoai: t})} placeholder="Nhập số điện thoại" keyboardType="phone-pad" />

                <Text style={styles.label}>Địa chỉ</Text>
                <TextInput style={styles.input} value={formData.diaChi} onChangeText={(t) => setFormData({...formData, diaChi: t})} placeholder="Số nhà, tên đường" />

                <Text style={styles.label}>Phường/Xã</Text>
                <Pressable style={styles.pickerBtn} onPress={() => setShowPicker(true)}>
                  <Text style={{color: formData.maPhuongXa ? "#000" : "#999"}}>
                    {formData.maPhuongXa ? phuongXaList.find(p => p.maPhuongXa === formData.maPhuongXa)?.tenPhuongXa : "Chọn phường xã"}
                  </Text>
                </Pressable>
                
                {/* Modal Chọn Phường Xã */}
                <Modal visible={showPicker} transparent animationType="slide">
                  <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Chọn Phường/Xã</Text>
                      <ScrollView>
                        {phuongXaList.map(p => (
                          <Pressable key={p.maPhuongXa} style={styles.modalItem} onPress={() => { setFormData({...formData, maPhuongXa: p.maPhuongXa}); setShowPicker(false); }}>
                            <Text>{p.tenPhuongXa} - {p.quanHuyen?.tenQuanHuyen}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                      <Pressable style={styles.closeBtn} onPress={() => setShowPicker(false)}><Text style={{color:"#fff", fontWeight: "bold"}}>Đóng</Text></Pressable>
                    </View>
                  </View>
                </Modal>
              </View>
            )}

            {/* BƯỚC 2: CHIẾN DỊCH & THỂ TÍCH */}
            {step === 2 && (
              <View>
                {!preselectedCampaignId && campaigns.map((c) => {
                  const isSelected = selectedCampaign === c.maChienDich;
                  return (
                    <Pressable key={c.maChienDich} onPress={() => setSelectedCampaign(c.maChienDich)} style={[styles.campCard, isSelected && styles.campCardSelected]}>
                      <View style={styles.radioCircle}>{isSelected && <View style={styles.radioInner} />}</View>
                      <View style={styles.campBody}>
                        <Text style={[styles.campName, isSelected && { color: "#e62e43" }]}>{c.tenChienDich}</Text>
                        <Text style={styles.campSub}>📍 {c.diaDiem?.tenDiaDiem || "TP. Đà Nẵng"}</Text>
                      </View>
                    </Pressable>
                  );
                })}
                {preselectedCampaignId && (
                  <View style={[styles.campCard, styles.campCardSelected, { marginTop: 0 }]}>
                    <View style={styles.campBody}>
                      <Text style={styles.campSub}>Chiến dịch đã chọn:</Text>
                      <Text style={[styles.campName, { color: "#e62e43", marginTop: 4 }]}>
                        {campaigns.find(c => c.maChienDich === preselectedCampaignId)?.tenChienDich || "Đang tải..."}
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={styles.sectionTitle}>Chọn thể tích máu</Text>
                <View style={styles.volumeRow}>
                  {[250, 350, 450].map((vol) => {
                    const isSelected = theTich === vol;
                    return (
                      <Pressable key={vol} onPress={() => setTheTich(vol)} style={[styles.volumeBtn, isSelected && styles.volumeBtnSelected]}>
                        <Text style={[styles.volumeNum, isSelected && { color: "#e62e43" }]}>{vol}</Text>
                        <Text style={[styles.volumeUnit, isSelected && { color: "#e62e43" }]}>ml</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* BƯỚC 3: KHAI BÁO Y TẾ */}
            {step === 3 && (
              <View style={styles.formCard}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Bạn có đang dùng thuốc kháng sinh không?</Text>
                  <Switch value={health.khangSinh} onValueChange={(v) => setHealth({...health, khangSinh: v})} trackColor={{ true: "#e62e43", false: "#e2e8f0" }} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Bạn có mắc các bệnh truyền nhiễm không?</Text>
                  <Switch value={health.truyenNhiem} onValueChange={(v) => setHealth({...health, truyenNhiem: v})} trackColor={{ true: "#e62e43", false: "#e2e8f0" }} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Bạn có đang bị đau họng, sốt không?</Text>
                  <Switch value={health.dauHong} onValueChange={(v) => setHealth({...health, dauHong: v})} trackColor={{ true: "#e62e43", false: "#e2e8f0" }} />
                </View>
                {formData.gioiTinh === "Nữ" && (
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Bạn có đang mang thai hoặc cho con bú?</Text>
                    <Switch value={health.coThai} onValueChange={(v) => setHealth({...health, coThai: v})} trackColor={{ true: "#e62e43", false: "#e2e8f0" }} />
                  </View>
                )}
                
                <Text style={styles.label}>Mô tả triệu chứng khác (nếu có)</Text>
                <TextInput style={styles.inputArea} value={moTaKhac} onChangeText={setMoTaKhac} placeholder="Ghi chú thêm..." multiline numberOfLines={3} />
              </View>
            )}

            {/* THÔNG BÁO LỖI NẾU CÓ */}
            {errorMsg ? (
              <View style={styles.errorContainer}><Text style={styles.errorText}>⚠ {errorMsg}</Text></View>
            ) : null}

            {/* NÚT ĐIỀU HƯỚNG */}
            <View style={styles.navRow}>
              {step > 1 && (
                <Pressable onPress={() => setStep(step - 1)} style={styles.backStepBtn}>
                  <Text style={styles.backStepText}>Quay lại</Text>
                </Pressable>
              )}
              
              <Pressable
                onPress={step === 3 ? handleRegister : nextStep}
                disabled={submitting}
                style={[styles.nextStepBtn, step === 1 && {flex: 1}]}
              >
                <LinearGradient colors={["#e62e43", "#c01b30"]} style={styles.submitBtn}>
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{step === 3 ? "XÁC NHẬN" : "TIẾP TỤC"}</Text>}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successModalIconWrap}>
              <Text style={styles.successModalIcon}>🎉</Text>
            </View>
            <Text style={styles.successModalTitle}>Đăng ký thành công!</Text>
            <Text style={styles.successModalText}>
              Đơn đăng ký hiến máu của bạn đã được ghi nhận. Cảm ơn bạn đã chung tay cùng cộng đồng!
            </Text>
            <Pressable
              style={styles.successModalBtn}
              onPress={() => {
                setShowSuccessModal(false);
                fetchData();
                setStep(1);
              }}
            >
              <Text style={styles.successModalBtnText}>Đã hiểu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },
  header: {
    paddingTop: Platform.OS === "ios" ? 54 : Platform.OS === "web" ? 20 : 40,
    paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  backText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  scrollContent: { padding: 16 },
  
  progressBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  progressDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  progressDotActive: { backgroundColor: "#e62e43" },
  progressText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  progressLine: { height: 3, flex: 1, backgroundColor: "#e2e8f0", marginHorizontal: 4 },
  progressLineActive: { backgroundColor: "#e62e43" },
  
  stepTitle: { fontSize: 18, fontWeight: "800", color: "#1a1a2e", marginBottom: 16, textAlign: "center" },
  
  formCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 2, shadowColor:"#000", shadowOpacity: 0.05, shadowRadius: 5 },
  label: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#f8fafc" },
  inputArea: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#f8fafc", minHeight: 80, textAlignVertical: 'top' },
  
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" },
  genderBtnActive: { borderColor: "#e62e43", backgroundColor: "#fef2f2" },
  genderText: { fontWeight: "600", color: "#64748b" },
  genderTextActive: { color: "#e62e43" },
  
  pickerBtn: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 14, backgroundColor: "#f8fafc" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20, maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  closeBtn: { marginTop: 16, padding: 14, backgroundColor: "#e62e43", borderRadius: 10, alignItems: "center" },
  
  campCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: "#e8ecef" },
  campCardSelected: { borderColor: "#e62e43", backgroundColor: "#fef3f4" },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#ccc", justifyContent: "center", alignItems: "center", marginRight: 12 },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#e62e43" },
  campBody: { flex: 1 },
  campName: { fontSize: 15, fontWeight: "800", color: "#1a1a2e", marginBottom: 4 },
  campSub: { fontSize: 12, color: "#777" },
  
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1a1a2e", marginTop: 16, marginBottom: 12 },
  volumeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  volumeBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#e8ecef" },
  volumeBtnSelected: { borderColor: "#e62e43", backgroundColor: "#fef3f4" },
  volumeNum: { fontSize: 20, fontWeight: "900", color: "#1a1a2e" },
  volumeUnit: { fontSize: 12, color: "#888", fontWeight: "700" },
  
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  switchLabel: { flex: 1, fontSize: 14, color: "#334155", paddingRight: 10, lineHeight: 20 },
  
  navRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  backStepBtn: { flex: 1, paddingVertical: 16, borderRadius: 25, backgroundColor: "#e2e8f0", alignItems: "center" },
  backStepText: { color: "#475569", fontWeight: "bold", fontSize: 15 },
  nextStepBtn: { flex: 2, borderRadius: 25, overflow: "hidden" },
  submitBtn: { paddingVertical: 16, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  
  errorContainer: { backgroundColor: "#ffeef0", borderColor: "#fdbdc3", borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 16 },
  errorText: { color: "#ef4444", fontSize: 13, marginLeft: 6, fontWeight: "500" },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successModalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  successModalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successModalIcon: {
    fontSize: 40,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#166534",
    marginBottom: 12,
    textAlign: "center",
  },
  successModalText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  successModalBtn: {
    backgroundColor: "#e62e43",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 100,
    width: "100%",
    alignItems: "center",
  },
  successModalBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  ticketCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", marginHorizontal: 0, marginTop: 10, elevation: 5, shadowColor: "#000", shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.1, shadowRadius: 15, borderWidth: 1, borderColor: "#e5e7eb" },
  ticketHeader: { backgroundColor: "#fff1f2", padding: 24, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#ffe4e6", borderStyle: "dashed" },
  ticketEmoji: { fontSize: 40, marginBottom: 12 },
  ticketTitle: { fontSize: 18, fontWeight: "900", color: "#e62e43", marginBottom: 12 },
  ticketStatus: { backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  ticketStatusText: { color: "#166534", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  ticketBody: { padding: 24, backgroundColor: "#fff" },
  ticketLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", fontWeight: "700" },
  ticketValue: { fontSize: 16, color: "#111827", fontWeight: "800", marginBottom: 20 },
  ticketFooter: { backgroundColor: "#f9fafb", padding: 16, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  ticketFooterText: { fontSize: 13, color: "#6b7280", textAlign: "center", lineHeight: 20 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "flex-start",
  },
  infoIcon: { fontSize: 20, marginRight: 12 },
  infoText: { flex: 1, fontSize: 13, color: "#1e3a8a", lineHeight: 20 },
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
