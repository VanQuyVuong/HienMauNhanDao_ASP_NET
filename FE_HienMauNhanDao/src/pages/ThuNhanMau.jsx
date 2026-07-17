import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/ThuNhanMau.css";

export default function ThuNhanMau() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [editForm, setEditForm] = useState({
    nhomMau: "",
    theTich: 250,
    nhietDoVanChuyen: 4.0,
  });
  const [saving, setSaving] = useState(false);

  // Load danh sách túi máu cần thu nhận
  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7004/api/tuimau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Lọc các túi máu có trạng thái "Chờ xét nghiệm" (tương ứng Chưa xử lý)
        const pendingUnits = (data || []).filter(
          (t) => t.trangThai === "Chờ xét nghiệm",
        );
        setList(pendingUnits);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách túi máu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (unit) => {
    setSelectedUnit(unit);
    setEditForm({
      nhomMau: unit.nhomMau,
      theTich: unit.theTich || 250,
      nhietDoVanChuyen: unit.nhietDoVanChuyen || 4.0,
    });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7004/api/tuimau/${selectedUnit.maTuiMau}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nhomMau: editForm.nhomMau,
            theTich: editForm.theTich,
            nhietDoVanChuyen: editForm.nhietDoVanChuyen,
          }),
        },
      );
      const resData = await response.json();
      if (response.ok && resData.success) {
        alert("✅ Cập nhật thông tin túi máu thành công!");
        setSelectedUnit(null);
        loadData();
      } else {
        alert(
          "❌ Cập nhật thất bại: " + (resData.message || "Lỗi không xác định."),
        );
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  // Hàm in nhãn dán mã vạch Barcode dán lên túi máu
  const handlePrintBarcode = (unit) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>In mã vạch túi máu</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 20px; }
            .barcode-box { border: 2px dashed #000; padding: 15px; display: inline-block; border-radius: 8px; }
            .barcode { font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 10px 0; }
            .details { font-size: 12px; margin-top: 5px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="barcode-box">
            <div><strong>HỆ THỐNG HIẾN MÁU NHÂN ĐẠO ĐÀ NẴNG</strong></div>
            <div class="barcode">|||| ||| ||||| | ||</div>
            <div><strong>${unit.maTuiMau}</strong></div>
            <div class="details">
              Nhóm máu: ${unit.nhomMau} | Thể tích: ${unit.theTich} ml<br/>
              Chiến dịch: ${unit.tenChienDich}<br/>
              TNV: ${unit.tenTinhNguyenVien}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filtered = list.filter(
    (t) =>
      t.maTuiMau.toLowerCase().includes(search.toLowerCase()) ||
      t.tenTinhNguyenVien.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="tnm-wrapper">
      <Navbar />

      <main className="tnm-container">
        {/* Header */}
        <div className="tnm-header-row">
          <div>
            <h1 className="tnm-title">💉 Tiếp Nhận & Thu Nhận Túi Máu</h1>
            <p className="tnm-subtitle">
              NVYT dán mã vạch, cấu hình thể tích và nhiệt độ bảo quản túi máu.
            </p>
          </div>
        </div>

        {/* Search Row */}
        <div className="tnm-search-row">
          <input
            type="text"
            placeholder="🔍 Tìm theo mã túi máu, tên người hiến..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tnm-search-input"
          />
          <button onClick={loadData} className="btn-reload-tnm">
            🔄 Tải lại
          </button>
        </div>

        {/* Bảng danh sách */}
        <div className="tnm-table-card shadow-sm">
          <div className="table-responsive">
            <table className="tnm-table">
              <thead>
                <tr>
                  <th>Mã túi máu</th>
                  <th>Người hiến</th>
                  <th>Chiến dịch</th>
                  <th>Thể tích (ml)</th>
                  <th>Nhóm máu</th>
                  <th>Ngày thu nhận</th>
                  <th>Nhiệt độ VC</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      Đang tải danh sách túi máu...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      Không có túi máu nào chờ thu nhận.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.maTuiMau}>
                      <td className="font-mono font-bold">{item.maTuiMau}</td>
                      <td>{item.tenTinhNguyenVien}</td>
                      <td>{item.tenChienDich}</td>
                      <td>{item.theTich} ml</td>
                      <td>
                        <span className="nhom-mau-badge">{item.nhomMau}</span>
                      </td>
                      <td>
                        {new Date(item.thoiGianLayMau).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>
                      <td className="font-bold">
                        {item.nhietDoVanChuyen
                          ? `${item.nhietDoVanChuyen} °C`
                          : "4.0 °C"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="tnm-actions">
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn-edit-tnm"
                          >
                            ⚙️ Cấu hình
                          </button>
                          <button
                            onClick={() => handlePrintBarcode(item)}
                            className="btn-print-tnm"
                          >
                            🖨️ In mã vạch
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Cấu hình */}
        {selectedUnit && (
          <div className="modal-backdrop">
            <div className="modal-card animate-fadein">
              <div className="modal-header">
                <h3>Cấu hình túi máu {selectedUnit.maTuiMau}</h3>
                <p>Cập nhật thể tích và nhiệt độ bảo quản túi máu</p>
              </div>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label>Nhóm máu xác nhận</label>
                  <select
                    value={editForm.nhomMau}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, nhomMau: e.target.value }))
                    }
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Thể tích túi máu (ml)</label>
                  <select
                    value={editForm.theTich}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        theTich: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={250}>250 ml</option>
                    <option value={350}>350 ml</option>
                    <option value={450}>450 ml</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Nhiệt độ vận chuyển (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.nhietDoVanChuyen}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        nhietDoVanChuyen: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="btn-modal-cancel"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="btn-modal-submit"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
