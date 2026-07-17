import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/HomePage.css";

export default function HomePage() {
  // === STATE: Lưu trữ dữ liệu thống kê từ API ===
  const [stats, setStats] = useState({
    tongTinhNguyenVien: 0,
    tongTuiMau: 0,
    tongChienDich: 0,
  });

  // === useEffect: Gọi API khi trang vừa load lần đầu ===
  // useEffect nhận 2 tham số:
  //   1. Hàm callback chứa logic cần chạy
  //   2. Mảng dependencies [] - mảng rỗng = chỉ chạy 1 lần duy nhất khi mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // fetch() gọi API Backend C# - không cần token vì đây là trang công khai
        const res = await fetch("https://localhost:7127/api/thongke/tong-quan");

        // res.ok = true nếu HTTP status 200-299
        if (res.ok) {
          const data = await res.json(); // Chuyển response thành object JavaScript
          setStats(data); // Cập nhật state => React tự động re-render
        }
      } catch (err) {
        // Nếu Backend chưa chạy hoặc lỗi mạng => bắt lỗi ở đây
        console.error("Lỗi khi lấy thống kê:", err);
      }
    };

    fetchStats(); // Gọi hàm async bên trong useEffect
  }, []);

  return (
    <div className="home-page">
      {/* === NAVBAR === */}
      <Navbar />

      {/* === SECTION 1: Hero Banner === */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">🩸 Hiến máu cứu người</span>
          <h1 className="hero-title">
            Mỗi Giọt Máu Cho Đi,
            <br />
            Một Cuộc Đời Ở Lại
          </h1>
          <p className="hero-subtitle">
            Hệ thống quản lý hiến máu nhân đạo TP. Đà Nẵng — Kết nối tình nguyện
            viên với các chiến dịch hiến máu, góp phần cứu sống hàng ngàn bệnh
            nhân mỗi năm.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero-primary">
              ✨ Đăng ký hiến máu
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Đăng nhập →
            </Link>
          </div>
        </div>
      </section>

      {/* === SECTION 2: Thống kê nổi bật === */}
      <section className="stats-section">
        <div className="stats-container">
          <h2 className="stats-title">Thành Tựu Của Chúng Ta</h2>
          <p className="stats-desc">
            Những con số biết nói về hành trình hiến máu nhân đạo tại Đà Nẵng
          </p>
          <div className="stats-grid">
            {/* Card 1: Tổng Tình nguyện viên */}
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">
                {stats.tongTinhNguyenVien?.toLocaleString() || 0}
              </div>
              <div className="stat-label">Tình nguyện viên</div>
            </div>

            {/* Card 2: Tổng Túi máu */}
            <div className="stat-card">
              <div className="stat-icon">🩸</div>
              <div className="stat-number">
                {stats.tongTuiMau?.toLocaleString() || 0}
              </div>
              <div className="stat-label">Túi máu đã thu nhận</div>
            </div>

            {/* Card 3: Số Chiến dịch */}
            <div className="stat-card">
              <div className="stat-icon">🏥</div>
              <div className="stat-number">
                {stats.tongChienDich?.toLocaleString() || 0}
              </div>
              <div className="stat-label">Chiến dịch hiến máu</div>
            </div>
          </div>
        </div>
      </section>

      {/* === SECTION 3: Quy trình hiến máu === */}
      <section className="process-section">
        <div className="process-container">
          <h2 className="process-title">Quy Trình Hiến Máu</h2>
          <p className="process-desc">
            Chỉ 4 bước đơn giản để trở thành người hùng cứu mạng
          </p>
          <div className="process-grid">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-icon">📝</div>
              <h3 className="step-title">Đăng ký</h3>
              <p className="step-desc">
                Tạo tài khoản và đăng ký tham gia chiến dịch hiến máu phù hợp.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-icon">📋</div>
              <h3 className="step-title">Khai báo y tế</h3>
              <p className="step-desc">
                Điền phiếu khai báo sức khỏe trực tuyến trước khi đến điểm hiến.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-icon">🩺</div>
              <h3 className="step-title">Khám sàng lọc</h3>
              <p className="step-desc">
                Bác sĩ kiểm tra chỉ số sinh tồn và xác nhận đủ điều kiện hiến.
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-icon">❤️</div>
              <h3 className="step-title">Hiến máu</h3>
              <p className="step-desc">
                Thực hiện hiến máu và nhận giấy chứng nhận hiến máu nhân đạo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}
