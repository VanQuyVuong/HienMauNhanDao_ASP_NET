import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/AdminKhoMau.css";

export default function AdminKhoMau() {
  const [danhSachKho, setDanhSachKho] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKhoMau = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("https://localhost:7004/api/khomau", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success) {
          setDanhSachKho(data.data);
        }
      } catch (error) {
        console.error("Lỗi tải kho máu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKhoMau();
  }, []);

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Đang tải dữ liệu kho máu...
      </div>
    );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="khomau-container">
        <h2 className="khomau-title">🏥 Hệ Thống Giám Sát Kho Máu</h2>

        <div className="khomau-grid">
          {danhSachKho.map((kho, index) => (
            // Bí thuật ở đây: Nếu tình trạng là CanKiet, nhét thêm class "alert" vào thẻ
            <div
              key={index}
              className={`kho-card ${kho.tinhTrang === "CanKiet" ? "alert" : ""}`}
            >
              <div className="kho-icon">🩸</div>
              <div className="kho-name">
                {kho.tenKho} (Nhóm {kho.nhomMauString})
              </div>

              <div className="kho-volume">
                Tồn kho: <strong>{kho.soLuongTon}</strong> ml
              </div>

              <div style={{ fontSize: "13px", color: "#8d99ae" }}>
                Ngưỡng an toàn: {kho.nguongAnToan} ml
              </div>

              {/* Hiện dòng chữ cảnh báo nếu bị gán cờ */}
              {kho.tinhTrang === "CanKiet" && (
                <div className="alert-text">⚠️ CẢNH BÁO CẠN KIỆT</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
