import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../css/MyDonations.css";

export default function AdminDonDangKy() {
  const [danhSach, setDanhSach] = useState([]);

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

  const handleDuyet = async (maDon, trangThaiMoi) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn chuyển sang trạng thái: ${trangThaiMoi}?`,
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
      fetchDanhSach();
    } else alert("❌ Lỗi: " + data.message);
  };

  // HÀM MỚI: Xử lý khi bấm nút "Xác nhận Lấy máu"
  const handleXacNhan = async (maDon) => {
    // Hiển thị cửa sổ nhỏ (prompt) để NVYT gõ số ml máu vào
    const theTich = window.prompt(
      "Nhập thể tích máu đã lấy (Ví dụ: 250, 350, hoặc 450):",
      "350",
    );
    if (!theTich) return; // NVYT bấm Cancel thì hủy

    // Bắt buộc NVYT phải gõ đúng 3 chuẩn này
    if (!["250", "350", "450"].includes(theTich)) {
      alert(
        "Thể tích máu không hợp lệ! Vui lòng nhập đúng số 250, 350 hoặc 450.",
      );
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://localhost:7004/api/dondangky/${maDon}/xac-nhan`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theTich: parseInt(theTich) }),
      },
    );

    const data = await response.json();
    if (data.success) {
      alert("🩸 " + data.message);
      fetchDanhSach(); // Tải lại bảng để thấy nó chuyển sang Đã Hoàn Thành
    } else alert("❌ Lỗi: " + data.message);
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
              <th>Thể tích</th>
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
                <td>
                  {don.tinhNguyenVien
                    ? don.tinhNguyenVien.hoTen
                    : "Chưa cập nhật"}
                </td>
                <td>{don.chienDich ? don.chienDich.tenChienDich : "N/A"}</td>

                {/* Hiển thị số ml máu nếu đã hiến xong */}
                <td>
                  {don.theTich ? (
                    <span style={{ color: "#e63946", fontWeight: "bold" }}>
                      {don.theTich} ml
                    </span>
                  ) : (
                    "---"
                  )}
                </td>

                <td>
                  <span
                    className={`status-badge ${don.trangThai === "ChoDuyet" ? "cho-duyet" : ""}`}
                  >
                    {don.trangThai === "ChoDuyet" ? "Chờ duyệt" : don.trangThai}
                  </span>
                </td>

                <td>
                  {/* Nếu đang Chờ duyệt thì hiện nút Duyệt / Từ chối */}
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
                        onClick={() => handleDuyet(don.maDon, "DaTuChoi")}
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

                  {/* NẾU ĐÃ DUYỆT RỒI THÌ HIỆN NÚT LẤY MÁU! */}
                  {don.trangThai === "DaDuyet" && (
                    <button
                      onClick={() => handleXacNhan(don.maDon)}
                      style={{
                        background: "#d90429",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      🩸 Xác nhận Lấy máu
                    </button>
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
