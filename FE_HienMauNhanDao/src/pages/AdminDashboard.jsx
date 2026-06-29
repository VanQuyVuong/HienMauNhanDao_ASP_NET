import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  // Chuẩn bị 2 cái rổ để chứa dữ liệu
  const [stats, setStats] = useState({
    tongNguoiDung: 0,
    tongTheTichMau: 0,
  });

  // Dùng "Thuật phân thân" (useEffect + Async) để nhờ Shipper đi lấy số liệu
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://localhost:7004/api/thongke/tong-quan",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();

        // Nếu lấy thành công, đổ số liệu vào 2 cái rổ
        if (data.success) {
          setStats({
            tongNguoiDung: data.data.tongNguoiDung,
            tongTheTichMau: data.data.tongTheTichMau,
          });
        }
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="dashboard-container">
        <h2 className="dashboard-title">📊 Tổng Quan Hệ Thống</h2>

        <div className="stats-grid">
          {/* Cục gạch số 1 */}
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Tổng Tình Nguyện Viên</h3>
              {/* Đã cắm API, thay dấu 3 chấm bằng số liệu thật trong rổ */}
              <p className="stat-number">{stats.tongNguoiDung}</p>
            </div>
          </div>

          {/* Cục gạch số 2 */}
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "#ffe5e5", color: "#e63946" }}
            >
              🩸
            </div>
            <div className="stat-info">
              <h3>Tổng Thể Tích Máu (ml)</h3>
              {/* Đã cắm API, thay dấu 3 chấm bằng số liệu thật trong rổ */}
              <p className="stat-number" style={{ color: "#e63946" }}>
                {stats.tongTheTichMau.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
