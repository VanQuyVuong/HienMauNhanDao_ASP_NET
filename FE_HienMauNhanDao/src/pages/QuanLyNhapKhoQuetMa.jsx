import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/QuanLyNhapKhoQuetMa.css";

export default function QuanLyNhapKhoQuetMa() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [scannedUnits, setScannedUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scanMsg, setScanMsg] = useState(null); // { type: 'success'|'error', text }

  // Danh sách túi máu hiện có trong kho
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [searchKho, setSearchKho] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State cho modal sửa túi máu
  const [editUnit, setEditUnit] = useState(null);
  const [editForm, setEditForm] = useState({
    nhomMau: "",
    theTich: "",
    ngayHetHan: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Load danh sách túi máu trong kho
  const fetchInventory = async (page = 0, search = "") => {
    try {
      setInventoryLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7004/api/tuimau/blood-units?page=${page}&size=8&search=${search}&status=Nhập kho`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const resJson = await response.json();
        setInventoryList(resJson.content || []);
        setTotalPages(resJson.totalPages || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Lỗi load kho:", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(0, "");
  }, []);

  // Xử lý quét mã vạch
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    if (scannedUnits.find((u) => u.maTuiMau === barcode.trim())) {
      setScanMsg({
        type: "error",
        text: `Túi máu "${barcode.trim()}" đã có trong danh sách chờ nhập.`,
      });
      setBarcode("");
      return;
    }
    try {
      setLoading(true);
      setScanMsg(null);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7004/api/tuimau/scan/${barcode.trim()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (response.ok) {
        setScannedUnits([...scannedUnits, data]);
        setScanMsg({
          type: "success",
          text: `✓ Thêm túi máu "${data.maTuiMau}" (${data.nhomMau}) vào danh sách thành công!`,
        });
        setBarcode("");
      } else {
        setScanMsg({
          type: "error",
          text: `✗ ${data.message || "Mã vạch không hợp lệ hoặc chưa được xét nghiệm."}`,
        });
      }
    } catch (error) {
      console.error(error);
      setScanMsg({ type: "error", text: `✗ Lỗi kết nối đến máy chủ.` });
    } finally {
      setLoading(false);
    }
  };

  const removeUnit = (maTuiMau) => {
    setScannedUnits(scannedUnits.filter((u) => u.maTuiMau !== maTuiMau));
  };

  // Xác nhận lưu phiếu nhập kho hàng loạt
  const handleImport = async () => {
    if (scannedUnits.length === 0) return;
    if (
      !window.confirm(`Xác nhận nhập kho ${scannedUnits.length} túi máu này?`)
    )
      return;

    try {
      setImporting(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://localhost:7004/api/phieunhapxuat/import",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            maNhanVien: "NV0001", // ID của nhân viên thủ kho đang đăng nhập
            maTuiMauList: scannedUnits.map((u) => u.maTuiMau),
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        alert("🎉 Nhập kho thành công!");
        setScannedUnits([]);
        fetchInventory(0, searchKho); // Tải lại danh sách túi máu trong kho
      } else {
        alert("❌ Nhập kho thất bại: " + (data.message || "Lỗi lưu phiếu."));
      }
    } catch (error) {
      console.error(error);
      alert("❌ Có lỗi xảy ra khi kết nối đến máy chủ.");
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteInventory = async (maTuiMau) => {
    if (
      !window.confirm(
        `⚠️ Bạn có chắc chắn muốn xóa túi máu ${maTuiMau} khỏi kho không?`,
      )
    ) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7004/api/tuimau/blood-units/${maTuiMau}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert("✅ Xóa túi máu thành công!");
        fetchInventory(currentPage, searchKho);
      } else {
        alert("❌ Xóa thất bại: " + (data.message || "Lỗi không thể xóa."));
      }
    } catch (error) {
      console.error("Lỗi khi xóa túi máu:", error);
      alert("❌ Lỗi kết nối đến máy chủ.");
    }
  };

  const handleEditInventory = (unit) => {
    setEditUnit(unit);
    setEditForm({
      nhomMau: unit.nhomMau || "",
      theTich: unit.theTich || "",
      ngayHetHan: unit.ngayHetHan ? unit.ngayHetHan.substring(0, 10) : "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editUnit) return;
    setEditSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://localhost:7004/api/tuimau/${editUnit.maTuiMau}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nhomMau: editForm.nhomMau,
            theTich: editForm.theTich ? parseInt(editForm.theTich) : null,
            ngayHetHan: editForm.ngayHetHan
              ? new Date(editForm.ngayHetHan).toISOString()
              : null,
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        alert("🎉 Cập nhật túi máu thành công!");
        setEditUnit(null);
        fetchInventory(currentPage, searchKho);
      } else {
        alert("❌ Cập nhật thất bại: " + (data.message || "Lỗi lưu dữ liệu."));
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi kết nối đến máy chủ.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="qlqm-wrapper">
      <Navbar />

      <main className="qlqm-container">
        {/* Header */}
        <div className="qlqm-header">
          <h2 className="qlqm-title">Quét Mã Vạch & Quản Lý Nhập Kho</h2>
          <p className="qlqm-subtitle">
            Quét mã vạch dán trên túi máu để làm thủ tục nhập kho hoặc quản lý
            các túi máu hiện có.
          </p>
        </div>

        {/* Khu vực Quét mã vạch */}
        <div className="qlqm-scan-card">
          <form onSubmit={handleScan} className="qlqm-scan-form">
            <div className="form-group-scan">
              <label>Quét hoặc nhập mã vạch túi máu (TMxxxxx)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value);
                  setScanMsg(null);
                }}
                placeholder="Ví dụ: TM123456..."
                autoFocus
                className={`input-scan ${scanMsg?.type === "error" ? "error" : scanMsg?.type === "success" ? "success" : ""}`}
              />
              {scanMsg && (
                <div
                  className={`scan-msg ${scanMsg.type === "error" ? "error" : "success"}`}
                >
                  {scanMsg.text}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit-scan"
            >
              {loading ? "Đang quét..." : "Thêm vào danh sách"}
            </button>
          </form>
        </div>

        {/* Hàng đợi túi máu chờ nhập kho */}
        {scannedUnits.length > 0 && (
          <div className="qlqm-queue-card">
            <div className="queue-header">
              <h3>Danh Sách Chờ Nhập Kho ({scannedUnits.length})</h3>
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-confirm-import"
              >
                💾 {importing ? "Đang lưu..." : "Xác nhận nhập kho hàng loạt"}
              </button>
            </div>
            <div className="table-responsive">
              <table className="qlqm-table">
                <thead>
                  <tr>
                    <th>Mã túi máu</th>
                    <th>Chiến dịch</th>
                    <th>Nhóm máu</th>
                    <th>Thể tích (ml)</th>
                    <th>Ngày thu nhận</th>
                    <th>Ngày hết hạn</th>
                    <th>Trạng thái HSD</th>
                    <th style={{ textAlign: "right" }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedUnits.map((unit) => (
                    <tr key={unit.maTuiMau}>
                      <td className="font-bold">{unit.maTuiMau}</td>
                      <td>{unit.maChienDich}</td>
                      <td>
                        <span className="badge-nhom-mau">{unit.nhomMau}</span>
                      </td>
                      <td>{unit.theTich} ml</td>
                      <td>
                        {new Date(unit.ngayThuNhan).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        {new Date(unit.ngayHetHan).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <span
                          className={`hsd-badge ${unit.tinhTrangHSD === "Hết hạn" ? "danger" : unit.tinhTrangHSD === "Sắp hết hạn" ? "warning" : "success"}`}
                        >
                          {unit.tinhTrangHSD}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => removeUnit(unit.maTuiMau)}
                          className="btn-delete-item"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bảng quản lý túi máu hiện có trong kho */}
        <div className="qlqm-inventory-card">
          <div className="inventory-header">
            <h3>📦 Các túi máu hiện có trong kho</h3>
            <div className="search-box">
              <input
                type="text"
                value={searchKho}
                onChange={(e) => setSearchKho(e.target.value)}
                placeholder="Tìm mã túi, nhóm máu..."
                className="input-search-kho"
              />
              <button
                onClick={() => fetchInventory(0, searchKho)}
                className="btn-search-kho"
              >
                Tìm
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="qlqm-table">
              <thead>
                <tr>
                  <th>Mã túi máu</th>
                  <th>Chiến dịch</th>
                  <th>Nhóm máu</th>
                  <th>Thể tích (ml)</th>
                  <th>Ngày thu nhận</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Hạn sử dụng</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {inventoryLoading ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Đang tải dữ liệu kho máu...
                    </td>
                  </tr>
                ) : inventoryList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Không có túi máu nào trong kho.
                    </td>
                  </tr>
                ) : (
                  inventoryList.map((unit) => (
                    <tr key={unit.maTuiMau}>
                      <td className="font-mono font-bold">{unit.maTuiMau}</td>
                      <td>{unit.maChienDich}</td>
                      <td>
                        <span className="badge-nhom-mau">{unit.nhomMau}</span>
                      </td>
                      <td>{unit.theTich} ml</td>
                      <td>
                        {new Date(unit.ngayThuNhan).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        {new Date(unit.ngayHetHan).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <span className="badge-status">{unit.trangThai}</span>
                      </td>
                      <td>
                        <span
                          className={`hsd-badge ${unit.tinhTrangHSD === "Hết hạn" ? "danger" : unit.tinhTrangHSD === "Sắp hết hạn" ? "warning" : "success"}`}
                        >
                          {unit.tinhTrangHSD}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="td-action-group">
                          <button
                            onClick={() => handleEditInventory(unit)}
                            className="btn-action edit"
                            title="Sửa túi máu"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteInventory(unit.maTuiMau)}
                            className="btn-action delete"
                            title="Xóa khỏi kho"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="pagination-row">
              <button
                onClick={() => fetchInventory(currentPage - 1, searchKho)}
                disabled={currentPage === 0}
                className="btn-page"
              >
                ← Trước
              </button>
              <span className="page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => fetchInventory(currentPage + 1, searchKho)}
                disabled={currentPage >= totalPages - 1}
                className="btn-page"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal sửa thông tin túi máu */}
      {editUnit && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Sửa Thông Tin Túi Máu</h3>
              <button
                onClick={() => setEditUnit(null)}
                className="btn-close-modal"
              >
                ✖
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Mã túi máu</label>
                <input
                  type="text"
                  disabled
                  value={editUnit.maTuiMau}
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Nhóm máu</label>
                <select
                  value={editForm.nhomMau}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nhomMau: e.target.value })
                  }
                >
                  <option value="">-- Chọn nhóm máu --</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (nm) => (
                      <option key={nm} value={nm}>
                        {nm}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Thể tích (ml)</label>
                <select
                  value={editForm.theTich}
                  onChange={(e) =>
                    setEditForm({ ...editForm, theTich: e.target.value })
                  }
                >
                  <option value="">-- Chọn thể tích --</option>
                  <option value="250">250 ml</option>
                  <option value="350">350 ml</option>
                  <option value="450">450 ml</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ngày hết hạn</label>
                <input
                  type="date"
                  value={editForm.ngayHetHan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ngayHetHan: e.target.value })
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setEditUnit(null)}
                  className="btn-cancel-form"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={handleSaveEdit}
                  className="btn-submit-form"
                >
                  {editSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
