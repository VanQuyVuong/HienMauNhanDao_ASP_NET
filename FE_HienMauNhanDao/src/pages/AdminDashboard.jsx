import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tongNguoiDung: 0,
    tongTuiMau: 0,
    tongTheTichMau: 0,
    theoNhomMau: [],
    theoThang: [],
  });
  const [loading, setLoading] = useState(true);

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
        if (data.success) {
          setStats({
            tongNguoiDung: data.data.tongNguoiDung,
            tongTuiMau: data.data.tongTuiMau,
            tongTheTichMau: data.data.tongTheTichMau,
            theoNhomMau: data.data.theoNhomMau || [],
            theoThang: data.data.theoThang || [],
          });
        }
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="loading-screen">Đang tải dữ liệu báo cáo...</div>;

  // 1. Tính toán cho BIỂU ĐỒ CỘT SVG (Lượng máu thu hoạch theo tháng)
  const chartWidth = 550;
  const chartHeight = 220;
  const padding = 40;

  // Tìm tháng có thể tích máu thu hoạch lớn nhất để làm mốc tỷ lệ chiều cao (100% height)
  const maxVolume =
    stats.theoThang.length > 0
      ? Math.max(...stats.theoThang.map((t) => t.tongTheTich))
      : 1000;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="db-container">
        <h1 className="db-main-title">📊 Báo Cáo & Phân Tích Hệ Thống</h1>

        {/* 1. Các thẻ số liệu tổng quan (Stat Cards) */}
        <div className="db-stats-row">
          <div className="db-card-stat">
            <span className="db-card-icon">👥</span>
            <div>
              <h3>Tổng Tình Nguyện Viên</h3>
              <p className="db-number-bold">
                {stats.tongNguoiDung.toLocaleString()} người
              </p>
            </div>
          </div>

          <div className="db-card-stat">
            <span className="db-card-icon red">🩸</span>
            <div>
              <h3>Tổng Túi Máu Tồn Kho</h3>
              <p className="db-number-bold text-red">
                {stats.tongTuiMau.toLocaleString()} túi
              </p>
            </div>
          </div>

          <div className="db-card-stat">
            <span className="db-card-icon blue">🏥</span>
            <div>
              <h3>Thể Tích Máu Đang Lưu</h3>
              <p className="db-number-bold text-blue">
                {stats.tongTheTichMau.toLocaleString()} ml
              </p>
            </div>
          </div>
        </div>

        {/* 2. Phần Biểu đồ phân tích */}
        <div className="db-charts-grid">
          {/* Biểu đồ cột SVG: Thu hoạch theo tháng */}
          <div className="db-chart-card">
            <h3 className="db-chart-title">
              📈 Thể tích thu nhận theo tháng (ml)
            </h3>
            {stats.theoThang.length === 0 ? (
              <div className="no-data-text">
                Chưa có dữ liệu hiến máu 6 tháng qua
              </div>
            ) : (
              <div className="svg-wrapper">
                <svg
                  width="100%"
                  height={chartHeight + padding}
                  viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`}
                >
                  {/* Đường kẻ ngang làm mốc lưới nền (Grid lines) */}
                  <line
                    x1={padding}
                    y1={chartHeight / 2}
                    x2={chartWidth - 20}
                    y2={chartHeight / 2}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1={padding}
                    y1={chartHeight}
                    x2={chartWidth - 20}
                    y2={chartHeight}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />

                  {/* Vòng lặp vẽ các cột dữ liệu */}
                  {stats.theoThang.map((t, index) => {
                    // Khoảng cách x của mỗi cột
                    const barWidth = 35;
                    const spacing =
                      (chartWidth - padding - 40) / stats.theoThang.length;
                    const x =
                      padding + index * spacing + (spacing - barWidth) / 2;

                    // Tính chiều cao cột dựa trên tỷ lệ thể tích tháng đó với tháng lớn nhất
                    const percentHeight = t.tongTheTich / maxVolume;
                    const barHeight = percentHeight * (chartHeight - 30);
                    const y = chartHeight - barHeight;

                    return (
                      <g key={index} className="svg-bar-group">
                        {/* Tooltip ẩn hiện số liệu khi rê chuột vào cột */}
                        <title>{`Tháng ${t.thang}/${t.nam}: ${t.tongTheTich.toLocaleString()} ml`}</title>

                        {/* Cột chữ nhật đại diện dữ liệu */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="4"
                          fill="url(#barGradient)"
                          className="svg-bar-rect"
                        />

                        {/* Số hiển thị thể tích trên đầu cột */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          textAnchor="middle"
                          className="svg-bar-val"
                        >
                          {t.tongTheTich}
                        </text>

                        {/* Chữ hiển thị tên Tháng dưới chân cột */}
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight + 20}
                          textAnchor="middle"
                          className="svg-bar-label"
                        >
                          T{t.thang}
                        </text>
                      </g>
                    );
                  })}

                  {/* Định nghĩa Gradient chuyển màu cho cột cột vẽ đẹp mắt */}
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Biểu đồ thanh tiến trình so sánh tồn kho theo nhóm máu */}
          <div className="db-chart-card">
            <h3 className="db-chart-title">
              🧪 Trạng thái trữ lượng theo nhóm máu (Túi)
            </h3>
            <div className="db-blood-group-list">
              {stats.theoNhomMau.length === 0 ? (
                <div className="no-data-text">
                  Không tìm thấy dữ liệu trong kho
                </div>
              ) : (
                stats.theoNhomMau.map((item, idx) => {
                  // Giả lập ngưỡng an toàn của bệnh viện là 20 túi cho mỗi nhóm máu
                  const nguongAnToan = 20;
                  const percent = Math.min(
                    (item.soLuongTon / nguongAnToan) * 100,
                    100,
                  );

                  // Đổi tên nhãn hiển thị cho đẹp
                  const formatNhomMau = item.nhomMau
                    .replace("_positive", " (+)")
                    .replace("_negative", " (-)");

                  return (
                    <div key={idx} className="blood-progress-item">
                      <div className="blood-progress-info">
                        <span className="blood-name-badge">
                          {formatNhomMau}
                        </span>
                        <span className="blood-qty-text">
                          <strong>{item.soLuongTon}</strong> / {nguongAnToan}{" "}
                          túi (Ngưỡng an toàn)
                        </span>
                      </div>

                      {/* Thanh tiến trình biểu thị lượng máu hiện tại */}
                      <div className="blood-progress-bar-bg">
                        <div
                          className={`blood-progress-bar-fill ${percent < 30 ? "danger" : percent < 70 ? "warning" : "success"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
