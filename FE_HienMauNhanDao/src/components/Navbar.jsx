import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  //Lấy email ra để chào hỏi
  const email = localStorage.getItem("email");

  //Hàm đăng xuất sẽ chuyển sang ở Navbar

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/*cột 1 : logo*/}
      <div className="navbar-logo">
        <Link to="/dashboard">🩸 Hiến Máu Nhân Đạo</Link>
      </div>

      {/*cột 2 :Các menu chính */}
      <ul className="nabar-menu">
        <li>
          <Link to="/dashboard">Trang chủ</Link>
        </li>
        <li>
          <Link to="/dashboard">Chiến dịch</Link>
        </li>
        <li>
          <Link to="/dashboard">Đơn đăng ký</Link>
        </li>
      </ul>
      {/*cột 3 : tên người dùng và nút đăng xuất */}
      <div className="navbar-user">
        <span className="user-email">Xin chào, {email}</span>
        <button onClick={handleLogout} className="btn-logout">
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
