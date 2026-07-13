import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/XacNhanDangKy.css";

export default function XacNhanDangKy() {
  const navigate = useNavigate();
  const { maDon } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`https://localhost:7004/api/dondangky/${maDon}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const resJson = await response.json();
          setData(resJson.data);
        } else {
          alert("❌ Không thể lấy thông tin chi tiết đơn đăng ký!");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Lỗi fetch chi tiết đơn:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (maDon) {
      fetchData();
    } else {
      navigate("/dashboard");
    }
  }, [maDon, navigate]);

  const handleCancel = async () => {
    if (!window.confirm("Bạn có thực sự muốn hủy đơn đăng ký hiến máu này không?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://localhost:7004/api/dondangky/${data.maDon}/huy`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("✅ Đã hủy đơn đăng ký thành công.");
        setData((prev) => ({ ...prev, trangThai: 4 })); // 4 tương ứng với TrangThaiDonDangKy.DaHuy trong Enum mới
      } else {
        const resJson = await response.json();
        alert("❌ Hủy đơn thất bại: " + (resJson.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Lỗi hủy đơn:", error);
      alert("❌ Đã xảy ra lỗi kết nối đến máy chủ.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Đang tải chi tiết phiếu đăng ký...</div>
      </div>
    );
  }

  if (!data) return null;

  const tnv = data.tinhNguyenVien;
  const chienDich = data.chienDich;
  // TrangThaiDonDangKy: ChoDuyet = 0, DaDuyet = 1, DaTuChoi = 2, DaHoanThanh = 3, DaHuy = 4
  const isCancelled = data.trangThai === 4 || data.trangThai === "DaHuy";
  const isPendingOrApproved = data.trangThai === 0 || data.trangThai === 1 || data.trangThai === "ChoDuyet" || data.trangThai === "DaDuyet";

  return (
    <div className="xn-page-wrapper">
      <Navbar />

      <main className="xn-main-container">
        <div className="xn-card">
          {/* Header trạng thái */}
          <div className={`xn-header ${isCancelled ? "cancelled" : "success"}`}>
            <div className="xn-header-icon-circle">
              {isCancelled ? "❌" : "✓"}
            </div>
            <h3 className="xn-header-title">
              {isCancelled ? "ĐƠN ĐÃ HỦY" : "ĐƠN ĐĂNG KÝ"}
            </h3>
            <p className="xn-header-subtitle">Chi tiết phiếu đăng ký hiến máu</p>
          </div>

          <div className="xn-body">
            {/* Mã đăng ký */}
            <div className="xn-code-section">
              <p className="xn-code-label">Mã đăng ký của bạn</p>
              <p className={`xn-code-value ${isCancelled ? "line-through" : ""}`}>
                {data.maDon}
              </p>
            </div>

            {/* Hộp cảnh báo tips */}
            {!isCancelled && (
              <div className="xn-tip-box print-hidden">
                <span className="xn-tip-icon">💡</span>
                <p className="xn-tip-text">
                  Vui lòng chụp màn hình hoặc in phiếu này mang tới quầy tiếp đón tại điểm hiến máu để làm thủ tục nhanh nhất.
                </p>
              </div>
            )}

            {/* Thông tin chi tiết */}
            <div className="xn-info-card">
              <h4 className="xn-info-title">
                📋 Thông Tin Phiếu Đăng Ký
              </h4>

              <div className="xn-grid">
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Họ và tên</span>
                  <span className="xn-grid-value font-bold">{tnv?.hoTen || "N/A"}</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Số CCCD</span>
                  <span className="xn-grid-value">{tnv?.cccd || "N/A"}</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Ngày sinh</span>
                  <span className="xn-grid-value">
                    {tnv?.ngaySinh ? new Date(tnv.ngaySinh).toLocaleDateString("vi-VN") : "N/A"}
                  </span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Giới tính</span>
                  <span className="xn-grid-value">{tnv?.gioiTinh || "Nam"}</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Số điện thoại</span>
                  <span className="xn-grid-value">{tnv?.soDienThoai || "N/A"}</span>
                </div>
                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Địa chỉ cư trú</span>
                  <span className="xn-grid-value">{tnv?.diaChi || "Chưa cập nhật"}</span>
                </div>

                <div className="xn-divider"></div>

                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Chiến dịch hiến máu</span>
                  <span className="xn-grid-value font-bold text-red">
                    {chienDich?.tenChienDich || "N/A"}
                  </span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Dung tích hiến dự kiến</span>
                  <span className="xn-grid-value badge-volume">{data.theTich || 250} ml</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Thời gian bắt đầu</span>
                  <span className="xn-grid-value">
                    {chienDich?.thoiGianBD ? new Date(chienDich.thoiGianBD).toLocaleString("vi-VN") : "N/A"}
                  </span>
                </div>
                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Địa điểm hiến máu</span>
                  <span className="xn-grid-value">
                    {chienDich?.diaDiem ? chienDich.diaDiem.tenDiaDiem : "Chưa cập nhật"}
                  </span>
                </div>
                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Địa chỉ chi tiết</span>
                  <span className="xn-grid-value">
                    {chienDich?.diaDiem ? chienDich.diaDiem.diaChiChiTiet : "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>

            {/* Các nút bấm thao tác */}
            <div className="xn-btn-group print-hidden">
              {!isCancelled && (
                <button onClick={() => window.print()} className="xn-btn btn-print">
                  🖨 In Phiếu
                </button>
              )}

              {isPendingOrApproved && (
                <button onClick={handleCancel} className="xn-btn btn-cancel">
                  🛑 Hủy Đơn
                </button>
              )}

              <button onClick={() => navigate("/dashboard")} className="xn-btn btn-home">
                🏠 Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
