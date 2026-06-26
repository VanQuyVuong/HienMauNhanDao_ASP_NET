import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [khoBau, setKhoBau] = useState("Đang mở két sắt..."); // Chỗ để lưu dữ liệu mật

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  // useEffect giống như một người thợ: Nó sẽ TỰ ĐỘNG CHẠY ngay khi trang web vừa tải xong
  useEffect(() => {
    const fetchKhoBau = async () => {
      // 1. Móc túi lấy chìa khóa ra
      const token = localStorage.getItem("token");

      // Nếu không có chìa khóa thì đuổi về trang Login
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // 2. Đi tới két sắt của C#
        const response = await fetch(
          "https://localhost:7004/api/auth/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // ĐÂY LÀ ĐOẠN QUAN TRỌNG NHẤT: Đưa chìa khóa cho C# kiểm tra
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setKhoBau(data.thongDiep); // Lấy kho báu show ra màn hình
        } else {
          // Nếu chìa khóa giả hoặc hết hạn
          setKhoBau("Chìa khóa bị từ chối! Không thể xem dữ liệu mật.");
        }
      } catch (error) {
        setKhoBau("Không thể kết nối đến máy chủ.");
      }
    };

    fetchKhoBau();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div
        style={{
          padding: "50px",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#e63946" }}>Khu Vực Tuyệt Mật</h1>
        <p>
          Bạn đang đăng nhập với email: <strong>{email}</strong>
        </p>

        {/* Hiện kho báu ra đây */}
        <div
          style={{
            margin: "30px auto",
            padding: "20px",
            background: "#e3f2fd",
            border: "2px dashed #1976d2",
            borderRadius: "10px",
            maxWidth: "500px",
          }}
        >
          <h3 style={{ color: "#1565c0", margin: "0 0 10px 0" }}>
            Kết quả gọi API Bảo Mật:
          </h3>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#d32f2f" }}>
            {khoBau}
          </p>
        </div>
      </div>
    </div>
  );
}
