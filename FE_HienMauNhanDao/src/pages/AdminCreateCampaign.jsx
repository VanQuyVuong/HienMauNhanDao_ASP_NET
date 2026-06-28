import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/AdminCreateCampaign.css";

export default function AdminCreateCampaign() {
  const navigate = useNavigate();
  const [diaDiems, setDiaDiems] = useState([]);

  // Nơi chứa dữ liệu Admin gõ vào
  const [formData, setFormData] = useState({
    tenChienDich: "",
    thoiGianBD: "",
    thoiGianKT: "",
    soLuongDuKien: 0,
    maDiaDiem: "",
    imageUrl: "",
  });

  useEffect(() => {
    // Vừa vào trang là lấy danh sách Bệnh viện/Địa điểm ngay
    fetch("https://localhost:7004/api/diadiem")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDiaDiems(data.data);
          if (data.data.length > 0)
            setFormData((prev) => ({
              ...prev,
              maDiaDiem: data.data[0].maDiaDiem,
            })); // Chọn sẵn cái đầu tiên
        }
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://localhost:7004/api/chiendich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("🎉 " + data.message);
        navigate("/dashboard"); // Tạo xong tự động bay ra trang chủ để ngắm thành quả
      } else {
        alert("❌ Lỗi: " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối!");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="create-container">
        <h2 className="create-title">✨ Tạo Mới Chiến Dịch Hiến Máu</h2>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group full-width">
            <label>Tên chiến dịch</label>
            <input
              type="text"
              name="tenChienDich"
              value={formData.tenChienDich}
              onChange={handleChange}
              required
              placeholder="Ví dụ: Giọt máu hồng Đà Nẵng 2026..."
            />
          </div>

          <div className="form-group">
            <label>Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              name="thoiGianBD"
              value={formData.thoiGianBD}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Thời gian kết thúc</label>
            <input
              type="datetime-local"
              name="thoiGianKT"
              value={formData.thoiGianKT}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Địa điểm tổ chức</label>
            <select
              name="maDiaDiem"
              value={formData.maDiaDiem}
              onChange={handleChange}
              required
            >
              {diaDiems.map((dd) => (
                <option key={dd.maDiaDiem} value={dd.maDiaDiem}>
                  {dd.tenDiaDiem}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mục tiêu (Đơn vị máu)</label>
            <input
              type="number"
              name="soLuongDuKien"
              value={formData.soLuongDuKien}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group full-width">
            <label>Link hình ảnh bìa (URL)</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <button type="submit" className="btn-submit">
            🚀 Xuất bản Chiến dịch
          </button>
        </form>
      </div>
    </div>
  );
}
