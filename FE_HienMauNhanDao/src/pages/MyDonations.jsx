import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../css/MyDonations.css";

export default function MyDonations() {
  const [lichSu, setLichSu] = useState([]);

  useEffect(() => {
    // Lấy thẻ Token
    const token = localStorage.getItem("token");

    // Gọi API lấy lịch sử, kẹp thẻ vào
    fetch("https://localhost:7004/api/dondangky", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLichSu(data.data);
      })
      .catch((err) => console.error("Lỗi tải lịch sử:", err));
  }, []);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="history-container">
        <h2 className="history-title">🩸 Lịch sử đăng ký của tôi</h2>

        <table className="history-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Chiến Dịch</th>
              <th>Thời gian nộp</th>
              <th>Thể tích</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {lichSu.map((don, index) => (
              <tr key={index}>
                <td>
                  <strong>{don.maDon}</strong>
                </td>
                <td>
                  {don.chienDich ? don.chienDich.tenChienDich : "Đang cập nhật"}
                </td>
                <td>{new Date(don.thoiGianDangKy).toLocaleString("vi-VN")}</td>
                <td>{don.theTich} ml</td>
                <td>
                  <span
                    className={`status-badge ${don.trangThai === "ChoDuyet" ? "cho-duyet" : ""}`}
                  >
                    {don.trangThai === "ChoDuyet" ? "Chờ duyệt" : don.trangThai}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
