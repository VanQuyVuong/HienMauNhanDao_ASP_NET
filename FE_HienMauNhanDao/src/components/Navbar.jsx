import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const role = localStorage.getItem("role"); // Lấy vai trò từ localStorage
  const email = localStorage.getItem("email"); // Lấy email người dùng đăng nhập
  const navigate = useNavigate();

  // === STATE CỦA HỆ THỐNG THÔNG BÁO ===
  const [thongBaoList, setThongBaoList] = useState([]);
  const [hienThiDropdown, setHienThiDropdown] = useState(false);
  const [soChuaDoc, setSoChuaDoc] = useState(0);

  // Tải danh sách đơn từ API C# để trích xuất thông báo
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Chỉ có TNV (không phải AD, NVYT, QLK, BS) mới nhận thông báo này
    if (role === "AD" || role === "NVYT" || role === "QLK" || role === "BS") return;

    const taiThongBao = async () => {
      try {
        const response = await fetch("https://localhost:7004/api/dondangky", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const json = await response.json();
          if (json.success && Array.isArray(json.data)) {
            // Lọc: Chỉ lấy các đơn đã có cập nhật kết quả (khác trạng thái ChoDuyet ban đầu)
            const thongBaoTuDon = json.data.filter(
              (don) => don.trangThai !== "ChoDuyet"
            );
            setThongBaoList(thongBaoTuDon);

            // Đọc mảng các mã đơn đã xem từ localStorage
            const daXemString = localStorage.getItem("donDaXem") || "[]";
            const daXemList = JSON.parse(daXemString);

            // Đếm số đơn có thông báo mới chưa xem
            const chuaDoc = thongBaoTuDon.filter(
              (don) => !daXemList.includes(don.maDon)
            ).length;
            setSoChuaDoc(chuaDoc);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    taiThongBao();
  }, [role]);

  // Click vào thông báo để chuyển trang
  const clickThongBao = (don) => {
    // Lưu mã đơn này vào danh sách đã xem
    const daXemString = localStorage.getItem("donDaXem") || "[]";
    const daXemList = JSON.parse(daXemString);
    if (!daXemList.includes(don.maDon)) {
      daXemList.push(don.maDon);
      localStorage.setItem("donDaXem", JSON.stringify(daXemList));
    }

    setSoChuaDoc((prev) => Math.max(0, prev - 1));
    setHienThiDropdown(false);

    // Chuyển hướng
    if (don.trangThai === "DaHoanThanh") {
      navigate(`/chung-nhan/${don.maDon}`);
    } else {
      navigate(`/xac-nhan-dang-ky/${don.maDon}`);
    }
  };

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
            to="/"
            style={{
              textDecoration: "none",
              color: "#2b2d42",
              fontWeight: "500",
            }}
          >
            🏠 Trang chủ
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
          {role === "AD" ||
          role === "NVYT" ||
          role === "QLK" ||
          role === "BS" ? (
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              {/* === MENU DÀNH CHO NHÂN VIÊN Y TẾ HOẶC ADMIN === */}
              {(role === "NVYT" || role === "AD") && (
                <>
                  <Link
                    to="/admin-ho-so-yte"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    📋 Hồ sơ y tế
                  </Link>
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
                  <Link
                    to="/admin-don"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    🛡️ Quản lý Đơn
                  </Link>
                  <Link
                    to="/admin-chung-nhan"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    🎖️ Cấp Chứng Nhận
                  </Link>
                  {/* Link mới: Quản lý Tình nguyện viên (Bài 30) */}
                  <Link
                    to="/admin-volunteers"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    🩸 Quản lý TNV
                  </Link>
                </>
              )}

              {/* === MENU DÀNH CHO THỦ KHO MÁU (QLK) HOẶC ADMIN === */}
              {(role === "QLK" || role === "AD") && (
                <>
                  <Link
                    to="/admin-kho-mau"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    🏥 Kho Máu
                  </Link>
                  <Link
                    to="/admin-han-dung"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    ⏳ Hạn Dùng
                  </Link>
                  <Link
                    to="/admin-nhap-kho"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    📥 Nhập kho
                  </Link>
                  {/* Link mới: Nhận yêu cầu nhập kho (Bài 31) */}
                  <Link
                    to="/qlk-nhan-yeu-cau"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    📦 Yêu cầu nhập
                  </Link>
                  {/* Link mới: Nhập kho theo chiến dịch (Bài 31) */}
                  <Link
                    to="/qlk-nhap-theo-chien-dich"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    📊 Nhập sự kiện
                  </Link>
                </>
              )}

              {/* === MENU DÀNH CHO BÁC SĨ HOẶC ADMIN === */}
              {(role === "BS" || role === "AD") && (
                <>
                  <Link
                    to="/admin-kham-sang-loc"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    🩺 Khám sàng lọc
                  </Link>
                  <Link
                    to="/admin-xet-nghiem"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    🧪 Xét nghiệm máu
                  </Link>
                </>
              )}

              {/* === MENU THỐNG KÊ VÀ TÀI KHOẢN CHỈ DÀNH CHO ADMIN === */}
              {role === "AD" && (
                <>
                  <Link
                    to="/admin-thong-ke"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    📊 Thống Kê
                  </Link>
                  {/* Link mới: Quản lý Người dùng (Bài 29) */}
                  <Link
                    to="/admin-users"
                    style={{
                      color: "#d90429",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    👥 Tài Khoản
                  </Link>
                </>
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
        {/* === Chuông thông báo === */}
        {email && role !== "AD" && role !== "NVYT" && role !== "QLK" && role !== "BS" && (
          <div className="notif-wrapper">
            <button
              onClick={() => setHienThiDropdown(!hienThiDropdown)}
              className="notif-bell-btn"
              title="Thông báo"
            >
              🔔
              {soChuaDoc > 0 && (
                <span className="notif-badge">{soChuaDoc}</span>
              )}
            </button>

            <div className={`notif-dropdown ${hienThiDropdown ? "show" : ""}`}>
              <div className="notif-header">Thông báo của bạn</div>
              <div className="notif-list">
                {thongBaoList.length === 0 ? (
                  <div className="notif-empty">Chưa có thông báo nào</div>
                ) : (
                  thongBaoList.map((don, index) => {
                    const daXemString = localStorage.getItem("donDaXem") || "[]";
                    const daXemList = JSON.parse(daXemString);
                    const chuaXem = !daXemList.includes(don.maDon);

                    return (
                      <button
                        key={index}
                        onClick={() => clickThongBao(don)}
                        className={`notif-item ${chuaXem ? "unread" : ""}`}
                      >
                        <div className="notif-item-title">Đơn {don.maDon}</div>
                        <div className="notif-item-desc">
                          Đơn đăng ký hiến máu của bạn đã chuyển sang trạng thái:{" "}
                          <strong>
                            {don.trangThai === "DaDuyet"
                              ? "Đã duyệt"
                              : don.trangThai === "DaHoanThanh"
                                ? "Đã hoàn thành"
                                : don.trangThai === "DaTuChoi"
                                  ? "Bị từ chối"
                                  : don.trangThai}
                          </strong>
                        </div>
                        <div className="notif-item-time">
                          {new Date(don.thoiGianDangKy).toLocaleDateString("vi-VN")}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

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
