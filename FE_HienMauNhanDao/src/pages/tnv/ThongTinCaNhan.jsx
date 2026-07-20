import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/AdminCreateCampaign.css"; // Tái sử dụng CSS form hoặc css riêng

export default function ThongTinCaNhan() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [phuongXaList, setPhuongXaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    hoTen: "",
    cccd: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    soDienThoai: "",
    diaChi: "",
    maPhuongXa: "",
    dungTichMau: "350",
  });

  useEffect(() => {
    // 1. Tải chiến dịch đã chọn từ localStorage
    const campaignStr = localStorage.getItem("selectedCampaign");
    if (!campaignStr) {
      alert("Vui lòng chọn chiến dịch hiến máu trước!");
      navigate("/dashboard");
      return;
    }
    setSelectedCampaign(JSON.parse(campaignStr));

    // 2. Tải danh sách phường xã
    const taiPhuongXa = async () => {
      try {
        const response = await fetch("https://localhost:7004/api/phuongxa");
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && Array.isArray(resJson.data)) {
            setPhuongXaList(resJson.data);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách phường/xã:", err);
      }
    };
    taiPhuongXa();

    // 3. Tải thông tin TNV đã lưu để điền sẵn vào form
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("https://localhost:7004/api/tinhnguyenvien/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            setFormData((prev) => ({
              ...prev,
              hoTen: resJson.data.hoTen || "",
              cccd: resJson.data.cccd || "",
              ngaySinh: resJson.data.ngaySinh ? resJson.data.ngaySinh.split("T")[0] : "",
              soDienThoai: resJson.data.soDienThoai || "",
              diaChi: resJson.data.diaChi || "",
              gioiTinh: resJson.data.gioiTinh === 1 ? "Nữ" : "Nam",
              maPhuongXa: resJson.data.maPhuongXa || "",
            }));
          }
        }
      } catch (err) {
        console.error("Lỗi lấy profile:", err);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.hoTen.trim()) { setError("Vui lòng nhập họ và tên"); return false; }
    if (!formData.cccd.trim()) { setError("Vui lòng nhập số CCCD"); return false; }
    if (formData.cccd.trim().length !== 12) { setError("CCCD phải đúng 12 số"); return false; }
    if (!formData.ngaySinh) { setError("Vui lòng chọn ngày sinh"); return false; }
    if (!formData.soDienThoai.trim()) { setError("Vui lòng nhập số điện thoại"); return false; }
    if (formData.soDienThoai.trim().length !== 10) { setError("Số điện thoại phải đúng 10 số"); return false; }
    if (!formData.diaChi.trim()) { setError("Vui lòng nhập địa chỉ"); return false; }
    if (!formData.maPhuongXa) { setError("Vui lòng chọn Phường/Xã"); return false; }
    setError("");
    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Bước 1: Lưu / Cập nhật hồ sơ TNV
      const profileRes = await fetch("https://localhost:7004/api/tinhnguyenvien/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hoTen: formData.hoTen,
          cccd: formData.cccd,
          ngaySinh: formData.ngaySinh,
          soDienThoai: formData.soDienThoai,
          diaChi: formData.diaChi,
          gioiTinh: formData.gioiTinh === "Nữ" ? 1 : 0,
          maPhuongXa: parseInt(formData.maPhuongXa, 10),
        }),
      });

      if (!profileRes.ok) {
        throw new Error("Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.");
      }

      // Bước 2: Tạo đơn đăng ký hiến máu với Thể tích đã chọn
      const donRes = await fetch("https://localhost:7004/api/dondangky", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maChienDich: selectedCampaign.maChienDich,
          theTich: parseInt(formData.dungTichMau, 10),
        }),
      });

      const donData = await donRes.json();
      if (!donRes.ok) {
        throw new Error(donData.message || "Lỗi đăng ký hiến máu.");
      }

      // Bước 3: Điều hướng tới trang khai báo y tế kèm mã đơn
      navigate(`/khai-bao-y-te/${donData.maDon}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCampaign) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Đang tải...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="acc-container" style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        {/* Progress bar */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px", borderBottom: "2px solid #e2e8f0", paddingBottom: "15px" }}>
          <div style={{ color: "#d90429", fontWeight: "bold", borderBottom: "3px solid #d90429", paddingBottom: "15px", marginBottom: "-18px" }}>
            1. Điền thông tin & Thể tích
          </div>
          <div style={{ color: "#64748b" }}>
            2. Khai báo y tế
          </div>
        </div>

        <div className="acc-card">
          <div className="acc-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px" }}>
            <h2 className="acc-title" style={{ fontSize: "22px", color: "#1e293b" }}>ĐĂNG KÝ THÔNG TIN HIẾN MÁU</h2>
            <p className="acc-subtitle">Chiến dịch: <strong>{selectedCampaign.tenChienDich}</strong></p>
          </div>

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <form className="acc-form">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
              <div className="acc-form-group">
                <label className="acc-label">Họ và tên <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleInputChange}
                  className="acc-input"
                  type="text"
                  placeholder="Họ và tên đầy đủ"
                />
              </div>

              <div className="acc-form-group">
                <label className="acc-label">Số CCCD (12 số) <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  name="cccd"
                  value={formData.cccd}
                  onChange={handleInputChange}
                  className="acc-input"
                  type="text"
                  placeholder="Nhập số CCCD"
                  maxLength={12}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
              <div className="acc-form-group">
                <label className="acc-label">Ngày sinh <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  name="ngaySinh"
                  value={formData.ngaySinh}
                  onChange={handleInputChange}
                  className="acc-input"
                  type="date"
                />
              </div>

              <div className="acc-form-group">
                <label className="acc-label">Giới tính <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  name="gioiTinh"
                  value={formData.gioiTinh}
                  onChange={handleInputChange}
                  className="acc-input"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
              <div className="acc-form-group">
                <label className="acc-label">Số điện thoại (10 số) <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  name="soDienThoai"
                  value={formData.soDienThoai}
                  onChange={handleInputChange}
                  className="acc-input"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  maxLength={10}
                />
              </div>

              <div className="acc-form-group">
                <label className="acc-label">Phường/Xã <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  name="maPhuongXa"
                  value={formData.maPhuongXa}
                  onChange={handleInputChange}
                  className="acc-input"
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {phuongXaList.map((px) => (
                    <option key={px.maPhuongXa} value={px.maPhuongXa}>
                      {px.tenPhuongXa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="acc-form-group" style={{ marginBottom: "25px" }}>
              <label className="acc-label">Địa chỉ cụ thể <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                name="diaChi"
                value={formData.diaChi}
                onChange={handleInputChange}
                className="acc-input"
                type="text"
                placeholder="Số nhà, tên đường, tổ..."
              />
            </div>

            {/* Lựa chọn thể tích máu */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px", marginBottom: "30px" }}>
              <label className="acc-label" style={{ fontSize: "15px", marginBottom: "12px", fontWeight: "bold" }}>
                Dung tích máu dự kiến hiến <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                {[
                  { value: "250", label: "250 ml", desc: "Phù hợp từ 42kg - 45kg" },
                  { value: "350", label: "350 ml", desc: "Phù hợp trên 45kg" },
                  { value: "450", label: "450 ml", desc: "Phù hợp trên 50kg" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      border: formData.dungTichMau === opt.value ? "2px solid #d90429" : "1px solid #cbd5e1",
                      backgroundColor: formData.dungTichMau === opt.value ? "#fef2f2" : "white",
                      padding: "15px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name="dungTichMau"
                      value={opt.value}
                      checked={formData.dungTichMau === opt.value}
                      onChange={handleInputChange}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                      {opt.label}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748b", textAlign: "center" }}>
                      {opt.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="acc-btn-submit"
                style={{ width: "200px", height: "45px", backgroundColor: "#d90429", color: "white", fontSize: "15px", fontWeight: "bold" }}
              >
                {loading ? "Đang xử lý..." : "TIẾP THEO →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
