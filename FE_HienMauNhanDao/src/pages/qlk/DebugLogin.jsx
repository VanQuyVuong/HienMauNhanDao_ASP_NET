import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/AdminDashboard.css"; // Tải CSS chung để hiển thị đẹp

export default function DebugLogin() {
  const navigate = useNavigate();

  const handleBypass = () => {
    // Thiết lập các thông tin giả lập để vượt qua Guard
    localStorage.setItem("token", "debug-bypass-token-2026");
    localStorage.setItem("email", "tranminhhung.kho@bvdn.vn");
    localStorage.setItem("role", "QLK");
    localStorage.setItem("maNV", "NV00012");
    localStorage.setItem("userId", "TK00012");

    // Chuyển hướng ngay lập tức sang kho máu
    navigate("/admin-kho-mau", { replace: true });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", itemsAlign: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0", maxWidth: "400px", width: "100%", margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", backgroundColor: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "#d90429" }}>terminal</span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", marginBottom: "16px" }}>Debug Login Mode</h1>
        <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "14px", lineHeight: "1.6" }}>
          Bạn có thể vào thẳng hệ thống <b>Quản lý kho</b> bằng lối đi tắt được khôi phục bên dưới.
        </p>
        <button 
          onClick={handleBypass}
          style={{ width: "100%", padding: "14px", backgroundColor: "#d90429", color: "white", fontWeight: "bold", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px" }}
        >
          <span>Vào trang Kho ngay</span>
          <span className="material-symbols-outlined">rocket_launch</span>
        </button>
      </div>
    </div>
  );
}
