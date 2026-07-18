import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/AboutPage.css";

export default function AboutPage() {
  return (
    <div className="about-main">
      {/* NAVBAR */}
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="about-hero">
        <img
          alt="Medical Laboratory"
          className="about-hero-img"
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1500"
        />
        <div className="about-hero-overlay"></div>
        <div className="about-hero-container">
          <div className="about-hero-content">
            <div className="hero-tag">
              <span className="hero-tag-dot"></span>
              Kiến tạo giá trị nhân văn từ 2026
            </div>
            <h2 className="hero-heading">
              Khát Vọng
              <br />
              <span className="hero-heading-gradient">
                Vì Một Việt Nam Khỏe Mạnh
              </span>
            </h2>
            <p className="hero-desc">
              Hệ thống Quản lý Hiến máu Đà Nẵng không chỉ là một công cụ công
              nghệ, mà là cầu nối của lòng nhân ái, mang lại hy vọng sống cho
              hàng ngàn bệnh nhân mỗi ngày.
            </p>
            <Link to="/register" className="hero-btn">
              ❤️ Đăng ký hiến máu ngay
            </Link>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY & VISION */}
      <section className="about-vision">
        <div className="vision-images">
          <img
            alt="Laboratory Research"
            className="vision-img-1"
            src="https://honghunghospital.com.vn/wp-content/uploads/2020/08/6.-L%C3%AA-Nguy%C3%AAn-Kha-scaled.jpg"
          />
          <img
            alt="Medical Doctors"
            className="vision-img-2"
            src="https://honghunghospital.com.vn/wp-content/uploads/2022/01/80.-L%C3%AA-Th%E1%BB%8B-Ph%C6%B0%E1%BB%A3ng-Ngoan-scaled.jpg"
          />
          <div className="vision-quote">
            <div className="quote-stars">⭐⭐⭐⭐⭐</div>
            <p className="quote-text">
              "Chúng tôi cam kết mang lại quy trình hiến máu an toàn và chuyên
              nghiệp nhất cho mỗi tình nguyện viên."
            </p>
            <p className="quote-author">— TS. Nguyễn Văn A</p>
          </div>
        </div>

        <div className="vision-info">
          <div className="section-subtitle">
            <div className="subtitle-line"></div>
            Hành trình của chúng tôi
          </div>
          <h3 className="vision-heading">
            Kiến tạo hệ sinh thái
            <br />
            <span className="text-red">y tế số hiện đại</span>
          </h3>
          <p className="vision-desc">
            Khởi nguồn từ mong muốn tối ưu hóa nguồn lực máu quý giá của thành
            phố, chúng tôi xây dựng một nền tảng kết nối trực tiếp, minh bạch và
            tức thời giữa người hiến, bệnh viện và các tổ chức điều phối.
          </p>

          <div className="vision-features">
            <div className="feature-item">
              <div className="feature-icon-box">🛡️</div>
              <div className="feature-text">
                <h4>Tiêu chuẩn Quốc tế</h4>
                <p>
                  Áp dụng quy trình kỹ thuật nghiêm ngặt trong thu nhận, bảo
                  quản và sàng lọc máu.
                </p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-box">🌐</div>
              <div className="feature-text">
                <h4>Mạng lưới Rộng khắp</h4>
                <p>
                  Kết nối trực tiếp các bệnh viện tuyến đầu và các điểm lấy máu
                  di động tại Đà Nẵng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TIMELINE SECTION */}
      <section className="about-timeline-section">
        <div className="timeline-header">
          <span>Hành trình phát triển</span>
          <h3>Các Cột Mốc Đáng Nhớ</h3>
          <p>
            Nhìn lại những chặng đường phát triển nâng cao sức khỏe cộng đồng
          </p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>

          <div className="timeline-item">
            <div className="timeline-content-box">
              <div className="timeline-date">2026.01</div>
              <h4 className="timeline-title">Khởi Động Dự Án</h4>
              <p className="timeline-desc">
                Phát triển hệ thống lõi phục vụ kết nối dữ liệu người hiến máu.
              </p>
            </div>
            <div className="timeline-node"></div>
            <div className="timeline-content-box"></div>
          </div>

          <div className="timeline-item">
            <div className="timeline-content-box"></div>
            <div className="timeline-node"></div>
            <div className="timeline-content-box">
              <div className="timeline-date">2026.04</div>
              <h4 className="timeline-title">Phân Hệ Xét Nghiệm & Nhập Kho</h4>
              <p className="timeline-desc">
                Hoàn thiện quy trình kiểm duyệt chất lượng túi máu y tế.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-content-box">
              <div className="timeline-date">2026.07</div>
              <h4 className="timeline-title">Tích Hợp Xác Thực OTP & GCN</h4>
              <p className="timeline-desc">
                Tăng cường an toàn tài khoản và hỗ trợ chứng nhận hiến máu điện
                tử.
              </p>
            </div>
            <div className="timeline-node"></div>
            <div className="timeline-content-box"></div>
          </div>
        </div>
      </section>

      {/* 4. TEAM SECTION */}
      <section className="about-team-section">
        <div className="team-header">
          <div className="team-header-text">
            <span>Đồng hành cùng bạn</span>
            <h3>Đội Ngũ Chuyên Gia</h3>
            <p>Các bác sĩ huyết học và kỹ sư phát triển giàu kinh nghiệm</p>
          </div>
        </div>

        <div className="team-grid">
          {/* Bác sĩ 1 */}
          <div className="team-card">
            <div className="team-img-wrapper">
              <img
                className="team-img"
                src="https://honghunghospital.com.vn/wp-content/uploads/2022/02/85.-L%C3%AA-Ph%E1%BA%A1m-Qu%E1%BB%B3nh-Trang-scaled.jpg"
                alt="BS. Quỳnh Trang"
              />
              <div className="team-hover-overlay">
                <div className="team-social-links">
                  <a href="#" className="team-social-link">
                    📞
                  </a>
                  <a href="#" className="team-social-link">
                    ✉️
                  </a>
                </div>
              </div>
            </div>
            <h4 className="team-name">BS. Lê Phạm Quỳnh Trang</h4>
            <span className="team-role">Giám đốc Y khoa</span>
          </div>

          {/* Bác sĩ 2 */}
          <div className="team-card">
            <div className="team-img-wrapper">
              <img
                className="team-img"
                src="https://honghunghospital.com.vn/wp-content/uploads/2023/08/BS-Tr%C3%A2n.jpg"
                alt="BS. Trân"
              />
              <div className="team-hover-overlay">
                <div className="team-social-links">
                  <a href="#" className="team-social-link">
                    📞
                  </a>
                  <a href="#" className="team-social-link">
                    ✉️
                  </a>
                </div>
              </div>
            </div>
            <h4 className="team-name">BS. Minh Trân</h4>
            <span className="team-role">Trưởng Khoa Huyết Học</span>
          </div>

          {/* Bác sĩ 3 */}
          <div className="team-card">
            <div className="team-img-wrapper">
              <img
                className="team-img"
                src="https://honghunghospital.com.vn/wp-content/uploads/2023/10/BS-Tr%E1%BA%A7n-Ph%C3%BA-Th%E1%BB%8Bnh-Khoa-C%E1%BA%A5p-c%E1%BB%A9u.jpg"
                alt="BS. Phú Thịnh"
              />
              <div className="team-hover-overlay">
                <div className="team-social-links">
                  <a href="#" className="team-social-link">
                    📞
                  </a>
                  <a href="#" className="team-social-link">
                    ✉️
                  </a>
                </div>
              </div>
            </div>
            <h4 className="team-name">BS. Trần Phú Thịnh</h4>
            <span className="team-role">Phụ Trách Sàng Lọc</span>
          </div>

          {/* Bác sĩ 4 */}
          <div className="team-card">
            <div className="team-img-wrapper">
              <img
                className="team-img"
                src="https://honghunghospital.com.vn/wp-content/uploads/2024/03/BS-Nguy%E1%BB%85n-Th%C3%A0nh-T%C3%A0i.jpg"
                alt="BS. Thành Tài"
              />
              <div className="team-hover-overlay">
                <div className="team-social-links">
                  <a href="#" className="team-social-link">
                    📞
                  </a>
                  <a href="#" className="team-social-link">
                    ✉️
                  </a>
                </div>
              </div>
            </div>
            <h4 className="team-name">BS. Nguyễn Thành Tài</h4>
            <span className="team-role">Chuyên gia Điều phối</span>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="about-faq-section">
        <div className="faq-container">
          <div className="faq-info">
            <div className="section-subtitle">
              <div className="subtitle-line"></div>
              Hỏi đáp phổ biến
            </div>
            <h3 className="vision-heading">Giải Đáp Thắc Mắc</h3>
            <p className="vision-desc">
              Một số câu hỏi thường gặp nhất từ phía các Tình nguyện viên về quy
              trình hiến máu và chính sách liên quan.
            </p>
            <div className="faq-contact-card">
              <div className="faq-contact-header">
                <div className="faq-contact-icon">📞</div>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    Hỗ trợ trực tiếp
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                    Điện thoại hỗ trợ 24/7
                  </p>
                </div>
              </div>
              <h5 className="faq-contact-phone">1900 1234</h5>
              <button className="faq-contact-btn">Gửi yêu cầu hỗ trợ</button>
            </div>
          </div>

          <div className="faq-list">
            <details className="faq-item">
              <summary>
                Tôi có được biết đơn vị máu của mình đi đâu không?
                <span className="faq-icon-arrow">▼</span>
              </summary>
              <div className="faq-answer">
                Hệ thống của chúng tôi cung cấp thông báo khi đơn vị máu của bạn
                đã vượt qua bài xét nghiệm virus sàng lọc lâm sàng và được xuất
                kho bàn giao tới bệnh viện để điều trị.
              </div>
            </details>

            <details className="faq-item">
              <summary>
                Hiến máu có ảnh hưởng đến sức khỏe lâu dài không?
                <span className="faq-icon-arrow">▼</span>
              </summary>
              <div className="faq-answer">
                Không. Quy trình lấy máu đã được nghiên cứu khoa học đảm bảo an
                toàn. Lượng máu hiến đi sẽ nhanh chóng được cơ thể tái tạo sản
                sinh tế bào hồng cầu mới tốt hơn.
              </div>
            </details>

            <details className="faq-item">
              <summary>
                Khoảng cách giữa các lần hiến máu là bao lâu?
                <span className="faq-icon-arrow">▼</span>
              </summary>
              <div className="faq-answer">
                Theo quy chuẩn Bộ Y Tế, khoảng cách giữa các lần hiến máu toàn
                phần tối thiểu là 12 tuần (khoảng 3 tháng).
              </div>
            </details>

            <details className="faq-item">
              <summary>
                Làm thế nào để nhận Giấy chứng nhận điện tử?
                <span className="faq-icon-arrow">▼</span>
              </summary>
              <div className="faq-answer">
                Sau khi ca hiến máu hoàn thành và được cập nhật trạng thái "Đã
                hoàn thành", hệ thống tự động đồng bộ Giấy chứng nhận vào menu
                "Lịch sử của tôi" để bạn xem và tải về.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* 6. PARTNERS LOGOS */}
      <section className="about-partners-section">
        <p>Đối tác đồng hành</p>
        <div className="partners-logos-container">
          <span className="partner-text">DA NANG HOSPITAL</span>
          <span className="partner-text">RED CROSS VN</span>
          <span className="partner-text">MINISTRY OF HEALTH</span>
          <span className="partner-text">TECH PARTNER X</span>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
