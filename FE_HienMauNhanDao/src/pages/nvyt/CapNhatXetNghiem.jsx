import React from "react";
import Navbar from "../../components/Navbar";

export default function CapNhatXetNghiem() {
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Cập nhật xét nghiệm</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "5px" }}>Cập nhật kết quả xét nghiệm cho tình nguyện viên</p>
        </div>
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "60px", color: "#cbd5e1", marginBottom: "16px" }}>biotech</span>
          <p style={{ color: "#475569", fontWeight: "bold", fontSize: "16px", margin: "0 0 8px 0" }}>Tính năng đang được phát triển</p>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Cập nhật kết quả xét nghiệm phía NVYT sẽ có trong phiên bản tiếp theo.</p>
        </div>
      </div>
    </div>
  );
}
