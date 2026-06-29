import React from "react";
import Navbar from "../components/Navbar";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="dashboard-container">
        <h2 className="dashboard-title">📊 Tổng Quan Hệ Thống</h2>

        <div className="stats-grid">
          {/* Cục gạch số 1: Đếm người */}
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Tổng Tình Nguyện Viên</h3>
              {/* Chưa cắm API, để dấu 3 chấm */}
              <p className="stat-number">...</p>
            </div>
          </div>

          {/* Cục gạch số 2: Đếm máu */}
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "#ffe5e5", color: "#e63946" }}
            >
              🩸
            </div>
            <div className="stat-info">
              <h3>Tổng Thể Tích Máu (ml)</h3>
              <p className="stat-number" style={{ color: "#e63946" }}>
                ...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
