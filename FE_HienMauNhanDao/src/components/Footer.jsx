import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* === Cột 1: Logo & Slogan === */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">🩸</div>
            <div className="footer-logo-text">
              <h3>HỆ THỐNG HIẾN MÁU</h3>
              <span>TP. Đà Nẵng</span>
            </div>
          </div>
          <p className="footer-slogan">
            Chung tay vì cộng đồng, mang đến hy vọng sống cho mọi người. Mỗi
            giọt máu cho đi là một cuộc đời ở lại.
          </p>
        </div>

        {/* === Cột 2: Liên hệ === */}
        <div className="footer-section">
          <h4>Liên Hệ</h4>
          <ul className="footer-contact-list">
            <li>
              <span className="icon">📍</span>
              123 Lê Lợi, Hải Châu, ĐN
            </li>
            <li>
              <span className="icon">📞</span>
              1900 1234
            </li>
            <li>
              <span className="icon">📧</span>
              hotro@hienmaudn.vn
            </li>
          </ul>
        </div>

        {/* === Cột 3: Liên kết nhanh === */}
        <div className="footer-section">
          <h4>Liên Kết Nhanh</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/about">Giới thiệu</Link>
            </li>
            <li>
              <Link to="/chiendich">Chiến dịch hiến máu</Link>
            </li>
            <li>
              <Link to="/faq">Hỏi đáp (FAQ)</Link>
            </li>
          </ul>
        </div>

        {/* === Cột 4: Đăng ký nhận tin === */}
        <div className="footer-section footer-newsletter">
          <h4>Đăng Ký Nhận Tin</h4>
          <p>Nhận thông báo về các chiến dịch hiến máu khẩn cấp.</p>
          <div className="footer-newsletter-form">
            <input type="email" placeholder="Email của bạn" />
            <button>Gửi</button>
          </div>
        </div>
      </div>

      {/* === Bản quyền === */}
      <div className="footer-bottom">
        <p>
          © 2026 Hệ Thống Hiến Máu Nhân Đạo TP. Đà Nẵng. All Rights Reserved.
        </p>
        <div className="footer-bottom-links">
          <Link to="#">Điều khoản sử dụng</Link>
          <Link to="#">Chính sách bảo mật</Link>
        </div>
      </div>
    </footer>
  );
}
