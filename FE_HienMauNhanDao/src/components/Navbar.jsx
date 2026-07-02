import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const role = localStorage.getItem("role"); // Lấy chức vụ đang cất trong kho
  const email = localStorage.getItem("email"); // Lấy email ra để chào hỏi
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Cột 1 : Logo */}
      <div className="navbar-logo">
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          🩸 Hiến Máu Nhân Đạo
        </Link>
      </div>

      {/* Cột 2 : Các menu chính */}
      <ul
        className="nabar-menu"
        style={{
          listStyle: "none",
          display: "flex",
          gap: "20px",
          margin: 0,
          padding: 0,
        }}
      >
        <li>
          <Link
            to="/dashboard"
            style={{
              textDecoration: "none",
              color: "#2b2d42",
              fontWeight: "500",
            }}
          >
            Trang chủ
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard"
            style={{
              textDecoration: "none",
              color: "#2b2d42",
              fontWeight: "500",
            }}
          >
            Chiến dịch
          </Link>
        </li>
                <li>
          {/* NẾU LÀ NHÂN VIÊN NỘI BỘ (AD, NVYT, QLK, BS) THÌ HIỆN CÁC MENU NÀY */}
          {role === "AD" || role === "NVYT" || role === "QLK" || role === "BS" ? (
            <div style={{ display: "flex", gap: "15px" }}>
              
              {/* Menu của Nhân viên y tế và Admin */}
              {(role === "NVYT" || role === "AD") && (
                <>
                  <Link to="/admin-ho-so-yte" style={{ color: "#d90429", fontWeight: "bold", textDecoration: "none" }}>📋 Hồ sơ y tế</Link>
                  <Link to="/admin-tao-cd" style={{ color: "#d90429", fontWeight: "bold", textDecoration: "none" }}>➕ Tạo Chiến Dịch</Link>
                  <Link to="/admin-don" style={{ color: "#d90429", fontWeight: "bold", textDecoration: "none" }}>🛡️ Quản lý Đơn</Link>
                  <Link to="/admin-chung-nhan" style={{ color: "#d90429", fontWeight: "bold", textDecoration: "none" }}>🎖️ Cấp Chứng Nhận</Link>
                </>
              )}

              {/* Menu của Thủ kho và Admin */}
              {(role === "QLK" || role === "AD") && (
                <>
                  <Link to="/admin-kho-mau" style={{ color: "#d90429", fontWeight: "bold", textDecoration: "none" }}>🏥 Kho Máu</Link>
                  <Link to="/admin-han-dung" style={{ color: "#d90429", fontWeight: "bold", textDecoration: "none" }}>⏳ Hạn Dùng</Link>
                </>
              )}

              {/* Menu Thống kê chung của Admin */}
              {role === "AD" && (
                <Link to="/admin-thong-ke" style={{ color: "#d90429", fontWeight: "bold", textDecoration: "none" }}>📊 Thống Kê</Link>
              )}

            </div>
          ) : (
            /* NẾU LÀ NGƯỜI DÙNG THƯỜNG THÌ HIỆN NÚT NÀY */
            <Link
              to="/lich-su"
              style={{
                textDecoration: "none",
                color: "#2b2d42",
                fontWeight: "500",
              }}
            >
              Lịch sử của tôi
            </Link>
          )}
        </li>
      </ul>

      {/* Cột 3 : Tên người dùng và nút đăng xuất */}
      <div className="navbar-user">
        <Link
          to="/profile"
          style={{
            marginRight: "15px",
            color: "#d90429",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          👤 Xin chào, {email}
        </Link>
        <button
          onClick={handleLogout}
          className="btn-logout"
          style={{
            padding: "8px 15px",
            backgroundColor: "#e9ecef",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#495057",
          }}
        >
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
