import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../css/MyDonations.css";

export default function AdminDonDangKy() {
  const [danhSach, setDanhSach] = useState([]);

  // Hàm gọi API lấy TẤT CẢ đơn (Chỉ NVYT mới gọi được thành công)
  const fetchDanhSach = () => {
    const token = localStorage.getItem("token");
    fetch("https://localhost:7004/api/dondangky/tat-ca", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDanhSach(data.data);
      });
  };

  useEffect(() => {
    fetchDanhSach();
  }, []);

  // Hàm xử lý khi Nhân viên y tế bấm nút Duyệt hoặc Từ chối
  const handleDuyet = async (maDon, trangThaiMoi) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn chuyển đơn này sang trạng thái: ${trangThaiMoi === "DaDuyet" ? "Phê duyệt" : "Từ chối"}?`,
      )
    )
      return;

    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://localhost:7004/api/dondangky/${maDon}/duyet`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trangThaiMoi: trangThaiMoi }),
      },
    );

    const data = await response.json();
    if (data.success) {
      alert("✅ " + data.message);
      fetchDanhSach(); // Gọi lại API tải lại danh sách mới
    } else {
      alert("❌ Lỗi: " + data.message);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="history-container" style={{ maxWidth: "1200px" }}>
        <h2 className="history-title">
          🛡️ Quản lý Đơn đăng ký (Dành cho NVYT)
        </h2>

        <table className="history-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Người nộp</th>
              <th>Chiến Dịch</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {danhSach.map((don, index) => (
              <tr key={index}>
                <td>
                  <strong>{don.maDon}</strong>
                </td>
                {/* Lôi tên người nộp ra hiển thị nhờ lệnh Include bên C# */}
                <td>
                  {don.tinhNguyenVien
                    ? don.tinhNguyenVien.hoTen
                    : "Chưa cập nhật"}
                </td>
                <td>{don.chienDich ? don.chienDich.tenChienDich : "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${don.trangThai === "ChoDuyet" ? "cho-duyet" : ""}`}
                  >
                    {don.trangThai === "ChoDuyet" ? "Chờ duyệt" : don.trangThai}
                  </span>
                </td>
                <td>
                  {/* Nếu đơn đang Chờ duyệt thì mới hiện 2 nút bấm lên */}
                  {don.trangThai === "ChoDuyet" && (
                    <>
                      <button
                        onClick={() => handleDuyet(don.maDon, "DaDuyet")}
                        style={{
                          background: "#2a9d8f",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          marginRight: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleDuyet(don.maDon, "TuChoi")}
                        style={{
                          background: "#e76f51",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
