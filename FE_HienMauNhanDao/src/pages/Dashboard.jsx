import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  //  (localStorage) lấy thông tin lúc nãy vừa cất vào
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    // Khi đăng xuất: Vứt hết chìa khóa đi và đuổi ra ngoài trang Login
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      style={{ padding: "50px", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1 style={{ color: "#e63946" }}>Chào mừng đến với Hệ Thống Hiến Máu</h1>
      <p>
        Bạn đang đăng nhập với email: <strong>{email}</strong>
      </p>
      <p>
        Mã vai trò của bạn là: <strong>{role || "Chưa được cấp quyền"}</strong>
      </p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          background: "#333",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          border: "none",
        }}
      >
        Đăng Xuất
      </button>
    </div>
  );
}
