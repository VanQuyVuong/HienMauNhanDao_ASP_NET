import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/AdminCreateCampaign.css";

export default function UserProfile() {
  const [formData, setFormData] = useState({
    hoTen: "",
    cccd: "",
    ngaySinh: "",
    soDienThoai: "",
    diaChi: "",
    gioiTinh: "Nam",
    nhomMau: "A",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://localhost:7004/api/tinhnguyenvien/me",
          {
            // Lưu ý: Dùng dấu huyền ` (backtick) để nhét biến token vào chuỗi
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();

        if (data.success && data.data) {
          setFormData({
            hoTen: data.data.hoTen || "",
            cccd: data.data.cccd || "",
            ngaySinh: data.data.ngaySinh
              ? data.data.ngaySinh.split("T")[0]
              : "",
            soDienThoai: data.data.soDienThoai || "",
            diaChi: data.data.diaChi || "",
            gioiTinh:
              data.data.gioiTinh === 1
                ? "Nu"
                : data.data.gioiTinh === 2
                  ? "Khac"
                  : "Nam",
            nhomMau:
              data.data.nhomMau === 1
                ? "B"
                : data.data.nhomMau === 2
                  ? "AB"
                  : data.data.nhomMau === 3
                    ? "O"
                    : "A",
          });
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://localhost:7004/api/tinhnguyenvien/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();
      if (response.ok) alert("🎉 " + data.message);
      else alert("❌ Lỗi: " + data.message);
    } catch (error) {
      alert("❌ Lỗi kết nối!");
    }
  };

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="create-container">
        <h2 className="create-title">👤 Cập nhật Hồ Sơ Cá Nhân</h2>
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group full-width">
            <label>Họ và Tên (Đúng như trên CCCD)</label>
            <input
              type="text"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              required
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>
          <div className="form-group">
            <label>Số CCCD</label>
            <input
              type="text"
              name="cccd"
              value={formData.cccd}
              onChange={handleChange}
              required
              maxLength="12"
            />
          </div>
          <div className="form-group">
            <label>Ngày Sinh</label>
            <input
              type="date"
              name="ngaySinh"
              value={formData.ngaySinh}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Giới Tính</label>
            <select
              name="gioiTinh"
              value={formData.gioiTinh}
              onChange={handleChange}
            >
              <option value="Nam">Nam</option>
              <option value="Nu">Nữ</option>
              <option value="Khac">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nhóm Máu</label>
            <select
              name="nhomMau"
              value={formData.nhomMau}
              onChange={handleChange}
            >
              <option value="A">Nhóm A</option>
              <option value="B">Nhóm B</option>
              <option value="AB">Nhóm AB</option>
              <option value="O">Nhóm O</option>
            </select>
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleChange}
              required
              maxLength="10"
            />
          </div>
          <div className="form-group full-width">
            <label>Địa chỉ liên hệ</label>
            <input
              type="text"
              name="diaChi"
              value={formData.diaChi}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-submit">
            💾 Lưu hồ sơ
          </button>
        </form>
      </div>
    </div>
  );
}
