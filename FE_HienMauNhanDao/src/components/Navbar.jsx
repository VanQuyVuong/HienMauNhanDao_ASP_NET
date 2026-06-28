import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const role = localStorage.getItem("role"); // Lấy cái chức vụ đang cất trong kho
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
          {/* ĐÂY LÀ PHÉP THUẬT PHÂN QUYỀN: 
              Nếu Role là Nhân viên y tế (NVYT) hoặc Admin (AD) thì hiện nút "Quản lý Đơn".
              Ngược lại (Người dùng thường/TNV) thì hiện nút "Lịch sử của tôi" */}

          {role === "NVYT" || role === "AD" ? (
            <Link
              to="/admin-don"
              style={{
                color: "#d90429",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              <Link
                to="/admin-tao-cd"
                style={{
                  color: "#d90429",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                ➕ Tạo Chiến Dịch
              </Link>
              🛡️ Quản lý Đơn
            </Link>
          ) : (
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
        <span
          className="user-email"
          style={{ marginRight: "15px", color: "#6c757d" }}
        >
          Xin chào, {email}
        </span>
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
