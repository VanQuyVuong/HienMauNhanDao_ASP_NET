import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/QuanLyHanDung.css";

const QuanLyHanDung = () => {
  const [viewMode, setViewMode] = useState("all"); // all, expired, near, safe
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    expiredCount: 0,
    nearExpiryCount: 0,
    safeCount: 0,
    hasCritical: false,
  });
  const [bloodUnits, setBloodUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Hàm gọi API lấy dữ liệu từ Backend C#
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1. Gọi API lấy số liệu thống kê
      const statsRes = await fetch(
        "https://localhost:7004/api/tuimau/thong-ke-han-dung",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const statsJson = await statsRes.json();

      // 2. Gọi API lấy danh sách túi máu chi tiết
      const listRes = await fetch(
        `https://localhost:7004/api/tuimau/danh-sach-han-dung?viewMode=${viewMode}&search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const listJson = await listRes.json();

      setStats(
        statsJson || {
          expiredCount: 0,
          nearExpiryCount: 0,
          safeCount: 0,
          hasCritical: false,
        },
      );
      setBloodUnits(Array.isArray(listJson) ? listJson : []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hạn dùng:", error);
      setStats({
        expiredCount: 0,
        nearExpiryCount: 0,
        safeCount: 0,
        hasCritical: false,
      });
      setBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi lọc
    fetchData();
  }, [viewMode, searchQuery]);

  // Tính toán phân trang
  const totalPages = Math.ceil(bloodUnits.length / pageSize);
  const paginatedUnits = bloodUnits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Chức năng Xuất báo cáo ra định dạng CSV (Mở được bằng Excel, không lỗi font Tiếng Việt nhờ UTF-8 BOM)
  const handleExportReport = () => {
    const headers = [
      "STT",
      "Mã túi máu",
      "Mã chiến dịch",
      "Nhóm máu",
      "Thể tích",
      "Ngày lấy mẫu",
      "Ngày hết hạn",
      "Trạng thái",
      "Số ngày còn lại",
    ];

    const rows = bloodUnits.map((u, i) => {
      const statusText =
        u.trangThaiHan === "SAFE"
          ? "An toàn"
          : u.trangThaiHan === "NEAR_EXPIRY"
            ? "Sắp hết hạn"
            : u.trangThaiHan === "WARNING_EXPIRED"
              ? "Tiêu hủy gấp"
              : u.trangThaiHan === "ARCHIVED_EXPIRED"
                ? "Lưu trữ"
                : "Quá hạn";

      return [
        i + 1,
        u.maTuiMau,
        u.maChienDich,
        u.nhomMau,
        `${u.theTich}ml`,
        new Date(u.thoiGianLayMau).toLocaleDateString("vi-VN"),
        new Date(u.ngayHetHan).toLocaleDateString("vi-VN"),
        statusText,
        u.soNgayConLai < 0
          ? `Quá hạn ${Math.abs(u.soNgayConLai)} ngày`
          : `${u.soNgayConLai} ngày`,
      ];
    });

    // Ký tự BOM "\uFEFF" ở đầu file giúp Excel hiểu đây là file mã hóa UTF-8 tiếng Việt có dấu
    let csvContent = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((val) => `"${val}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `BaoCao_HanDung_${viewMode}_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chức năng tiêu hủy hàng loạt túi máu quá hạn
  const handleDeleteExpired = async () => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn TIÊU HỦY tất cả ${stats.expiredCount} túi máu đã hết hạn không?`,
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://localhost:7004/api/tuimau/tieu-huy-hang-loat",
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          alert("Đã tiêu hủy thành công!");
          fetchData();
        } else {
          alert("Lỗi khi tiêu hủy!");
        }
      } catch (error) {
        alert("Lỗi kết nối!");
      }
    }
  };

  // Chức năng tiêu hủy 1 túi máu cụ thể
  const handleDeleteSingle = async (id) => {
    if (window.confirm(`Bạn có chắc muốn tiêu hủy túi máu ${id}?`)) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://localhost:7004/api/tuimau/tieu-huy-don-le/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          alert("Đã tiêu hủy túi máu thành công!");
          fetchData();
        } else {
          alert("Lỗi khi tiêu hủy!");
        }
      } catch (error) {
        alert("Lỗi kết nối!");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="hd-container">
        {/* Header trang */}
        <div className="hd-header">
          <h1 className="hd-title">⏳ Quản lý Hạn dùng & Tiêu hủy túi máu</h1>
          <p className="hd-subtitle">
            Theo dõi vòng đời và quản lý loại bỏ các đơn vị túi máu quá hạn sử
            dụng.
          </p>
        </div>

        {/* 3 Card thống kê chỉ số */}
        <div className="hd-stats-grid">
          <div
            onClick={() => setViewMode("expired")}
            className={`hd-stat-card border-red ${stats.hasCritical ? "animate-alert" : ""}`}
          >
            <div className="hd-stat-icon-wrap red">🚨</div>
            <div>
              <p className="hd-stat-label">Đã hết hạn</p>
              <h3 className="hd-stat-val text-red">{stats.expiredCount} túi</h3>
              {stats.hasCritical && (
                <p className="hd-alert-text">BÁO ĐỘNG: CẦN TIÊU HỦY GẤP!</p>
              )}
            </div>
          </div>

          <div
            onClick={() => setViewMode("near")}
            className="hd-stat-card border-orange"
          >
            <div className="hd-stat-icon-wrap orange">⚠️</div>
            <div>
              <p className="hd-stat-label">Sắp hết hạn (&lt; 30 ngày)</p>
              <h3 className="hd-stat-val text-orange">
                {stats.nearExpiryCount} túi
              </h3>
            </div>
          </div>

          <div
            onClick={() => setViewMode("safe")}
            className="hd-stat-card border-green"
          >
            <div className="hd-stat-icon-wrap green">✅</div>
            <div>
              <p className="hd-stat-label">An toàn</p>
              <h3 className="hd-stat-val text-green">{stats.safeCount} túi</h3>
            </div>
          </div>
        </div>

        {/* Thanh điều khiển lọc & tìm kiếm */}
        <div className="hd-control-row">
          <div className="hd-tabs">
            {["all", "safe", "near", "expired"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`hd-tab-btn ${viewMode === mode ? "active" : ""}`}
              >
                {mode === "all"
                  ? "Tổng quan"
                  : mode === "safe"
                    ? "An toàn"
                    : mode === "near"
                      ? "Sắp hết hạn"
                      : "Đã hết hạn"}
              </button>
            ))}
          </div>

          <div className="hd-actions">
            <button onClick={handleExportReport} className="btn-export">
              📥 Xuất Báo Cáo CSV
            </button>
            {viewMode === "expired" && stats.expiredCount > 0 && (
              <button onClick={handleDeleteExpired} className="btn-delete-all">
                🗑️ Tiêu hủy tất cả quá hạn
              </button>
            )}
          </div>
        </div>

        {/* Bảng hiển thị dữ liệu */}
        <div className="hd-table-card">
          <div className="hd-table-header">
            <h3 className="hd-table-title">
              {viewMode === "all" && "Danh sách tất cả túi máu lưu kho"}
              {viewMode === "expired" && "Danh sách túi máu ĐÃ HẾT HẠN"}
              {viewMode === "near" && "Danh sách túi máu SẮP HẾT HẠN"}
              {viewMode === "safe" && "Danh sách túi máu AN TOÀN"}
            </h3>
            <input
              type="text"
              placeholder="🔍 Nhập mã túi máu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hd-search-input"
            />
          </div>

          <div className="hd-table-responsive">
            <table className="hd-table">
              <thead>
                <tr>
                  <th>Mã túi máu</th>
                  <th>Chiến dịch</th>
                  <th>Nhóm máu</th>
                  <th>Thể tích</th>
                  <th>Ngày lấy mẫu</th>
                  <th>Hạn sử dụng</th>
                  <th>Trạng thái hạn</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="td-empty">
                      Đang tải dữ liệu kho máu...
                    </td>
                  </tr>
                ) : bloodUnits.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="td-empty">
                      Chưa có dữ liệu túi máu nào.
                    </td>
                  </tr>
                ) : (
                  paginatedUnits.map((unit) => (
                    <tr
                      key={unit.maTuiMau}
                      className={`row-expiry-${unit.trangThaiHan}`}
                    >
                      <td className="font-mono">
                        <strong>{unit.maTuiMau}</strong>
                      </td>
                      <td>{unit.maChienDich}</td>
                      <td>
                        <span className="badge-blood">{unit.nhomMau}</span>
                      </td>
                      <td>{unit.theTich} ml</td>
                      <td>
                        {new Date(unit.thoiGianLayMau).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>
                      <td>
                        {new Date(unit.ngayHetHan).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        {unit.trangThaiHan === "ARCHIVED_EXPIRED" && (
                          <span className="tag-status gray">Lưu trữ</span>
                        )}
                        {unit.trangThaiHan === "WARNING_EXPIRED" && (
                          <span className="tag-status red animate-pulse">
                            Hủy Gấp!
                          </span>
                        )}
                        {unit.trangThaiHan === "EXPIRED" && (
                          <span className="tag-status red">Quá hạn</span>
                        )}
                        {unit.trangThaiHan === "NEAR_EXPIRY" && (
                          <span className="tag-status orange">
                            Còn {unit.soNgayConLai} ngày
                          </span>
                        )}
                        {unit.trangThaiHan === "SAFE" && (
                          <span className="tag-status green">An toàn</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteSingle(unit.maTuiMau)}
                          className="btn-delete-single"
                          title="Tiêu hủy"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {!loading && bloodUnits.length > 0 && (
            <div className="hd-pagination">
              <span>
                Hiển thị {paginatedUnits.length} / {bloodUnits.length} túi
              </span>
              <div className="hd-page-buttons">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span className="hd-page-num">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuanLyHanDung;
