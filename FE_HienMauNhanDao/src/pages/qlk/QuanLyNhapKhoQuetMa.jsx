import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/QuanLyNhapKhoQuetMa.css";

export default function QuanLyNhapKhoQuetMa() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [scannedUnits, setScannedUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scanMsg, setScanMsg] = useState(null); // { type: 'success'|'error', text }

  // Danh sÃ¡ch tÃºi mÃ¡u hiá»‡n cÃ³ trong kho
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [searchKho, setSearchKho] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State cho modal sá»­a tÃºi mÃ¡u
  const [editUnit, setEditUnit] = useState(null);
  const [editForm, setEditForm] = useState({
    nhomMau: "",
    theTich: "",
    ngayHetHan: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Load danh sÃ¡ch tÃºi mÃ¡u trong kho
  const fetchInventory = async (page = 0, search = "") => {
    try {
      setInventoryLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7004/api/tuimau/blood-units?page=${page}&size=8&search=${search}&status=Nháº­p kho`,
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
      console.error("Lá»—i load kho:", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(0, "");
  }, []);

  // Xá»­ lÃ½ quÃ©t mÃ£ váº¡ch
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    if (scannedUnits.find((u) => u.maTuiMau === barcode.trim())) {
      setScanMsg({
        type: "error",
        text: `TÃºi mÃ¡u "${barcode.trim()}" Ä‘Ã£ cÃ³ trong danh sÃ¡ch chá» nháº­p.`,
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
          text: `âœ“ ThÃªm tÃºi mÃ¡u "${data.maTuiMau}" (${data.nhomMau}) vÃ o danh sÃ¡ch thÃ nh cÃ´ng!`,
        });
        setBarcode("");
      } else {
        setScanMsg({
          type: "error",
          text: `âœ— ${data.message || "MÃ£ váº¡ch khÃ´ng há»£p lá»‡ hoáº·c chÆ°a Ä‘Æ°á»£c xÃ©t nghiá»‡m."}`,
        });
      }
    } catch (error) {
      console.error(error);
      setScanMsg({ type: "error", text: `âœ— Lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.` });
    } finally {
      setLoading(false);
    }
  };

  const removeUnit = (maTuiMau) => {
    setScannedUnits(scannedUnits.filter((u) => u.maTuiMau !== maTuiMau));
  };

  // XÃ¡c nháº­n lÆ°u phiáº¿u nháº­p kho hÃ ng loáº¡t
  const handleImport = async () => {
    if (scannedUnits.length === 0) return;
    if (
      !window.confirm(`XÃ¡c nháº­n nháº­p kho ${scannedUnits.length} tÃºi mÃ¡u nÃ y?`)
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
            maNhanVien: "NV0001", // ID cá»§a nhÃ¢n viÃªn thá»§ kho Ä‘ang Ä‘Äƒng nháº­p
            maTuiMauList: scannedUnits.map((u) => u.maTuiMau),
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        alert("ðŸŽ‰ Nháº­p kho thÃ nh cÃ´ng!");
        setScannedUnits([]);
        fetchInventory(0, searchKho); // Táº£i láº¡i danh sÃ¡ch tÃºi mÃ¡u trong kho
      } else {
        alert("âŒ Nháº­p kho tháº¥t báº¡i: " + (data.message || "Lá»—i lÆ°u phiáº¿u."));
      }
    } catch (error) {
      console.error(error);
      alert("âŒ CÃ³ lá»—i xáº£y ra khi káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteInventory = async (maTuiMau) => {
    if (
      !window.confirm(
        `âš ï¸ Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a tÃºi mÃ¡u ${maTuiMau} khá»i kho khÃ´ng?`,
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
        alert("âœ… XÃ³a tÃºi mÃ¡u thÃ nh cÃ´ng!");
        fetchInventory(currentPage, searchKho);
      } else {
        alert("âŒ XÃ³a tháº¥t báº¡i: " + (data.message || "Lá»—i khÃ´ng thá»ƒ xÃ³a."));
      }
    } catch (error) {
      console.error("Lá»—i khi xÃ³a tÃºi mÃ¡u:", error);
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
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
        alert("ðŸŽ‰ Cáº­p nháº­t tÃºi mÃ¡u thÃ nh cÃ´ng!");
        setEditUnit(null);
        fetchInventory(currentPage, searchKho);
      } else {
        alert("âŒ Cáº­p nháº­t tháº¥t báº¡i: " + (data.message || "Lá»—i lÆ°u dá»¯ liá»‡u."));
      }
    } catch (error) {
      console.error(error);
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
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
          <h2 className="qlqm-title">QuÃ©t MÃ£ Váº¡ch & Quáº£n LÃ½ Nháº­p Kho</h2>
          <p className="qlqm-subtitle">
            QuÃ©t mÃ£ váº¡ch dÃ¡n trÃªn tÃºi mÃ¡u Ä‘á»ƒ lÃ m thá»§ tá»¥c nháº­p kho hoáº·c quáº£n lÃ½
            cÃ¡c tÃºi mÃ¡u hiá»‡n cÃ³.
          </p>
        </div>

        {/* Khu vá»±c QuÃ©t mÃ£ váº¡ch */}
        <div className="qlqm-scan-card">
          <form onSubmit={handleScan} className="qlqm-scan-form">
            <div className="form-group-scan">
              <label>QuÃ©t hoáº·c nháº­p mÃ£ váº¡ch tÃºi mÃ¡u (TMxxxxx)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value);
                  setScanMsg(null);
                }}
                placeholder="VÃ­ dá»¥: TM123456..."
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
              {loading ? "Äang quÃ©t..." : "ThÃªm vÃ o danh sÃ¡ch"}
            </button>
          </form>
        </div>

        {/* HÃ ng Ä‘á»£i tÃºi mÃ¡u chá» nháº­p kho */}
        {scannedUnits.length > 0 && (
          <div className="qlqm-queue-card">
            <div className="queue-header">
              <h3>Danh SÃ¡ch Chá» Nháº­p Kho ({scannedUnits.length})</h3>
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-confirm-import"
              >
                ðŸ’¾ {importing ? "Äang lÆ°u..." : "XÃ¡c nháº­n nháº­p kho hÃ ng loáº¡t"}
              </button>
            </div>
            <div className="table-responsive">
              <table className="qlqm-table">
                <thead>
                  <tr>
                    <th>MÃ£ tÃºi mÃ¡u</th>
                    <th>Chiáº¿n dá»‹ch</th>
                    <th>NhÃ³m mÃ¡u</th>
                    <th>Thá»ƒ tÃ­ch (ml)</th>
                    <th>NgÃ y thu nháº­n</th>
                    <th>NgÃ y háº¿t háº¡n</th>
                    <th>Tráº¡ng thÃ¡i HSD</th>
                    <th style={{ textAlign: "right" }}>XÃ³a</th>
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
                          className={`hsd-badge ${unit.tinhTrangHSD === "Háº¿t háº¡n" ? "danger" : unit.tinhTrangHSD === "Sáº¯p háº¿t háº¡n" ? "warning" : "success"}`}
                        >
                          {unit.tinhTrangHSD}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => removeUnit(unit.maTuiMau)}
                          className="btn-delete-item"
                        >
                          ðŸ—‘ï¸
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Báº£ng quáº£n lÃ½ tÃºi mÃ¡u hiá»‡n cÃ³ trong kho */}
        <div className="qlqm-inventory-card">
          <div className="inventory-header">
            <h3>ðŸ“¦ CÃ¡c tÃºi mÃ¡u hiá»‡n cÃ³ trong kho</h3>
            <div className="search-box">
              <input
                type="text"
                value={searchKho}
                onChange={(e) => setSearchKho(e.target.value)}
                placeholder="TÃ¬m mÃ£ tÃºi, nhÃ³m mÃ¡u..."
                className="input-search-kho"
              />
              <button
                onClick={() => fetchInventory(0, searchKho)}
                className="btn-search-kho"
              >
                TÃ¬m
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="qlqm-table">
              <thead>
                <tr>
                  <th>MÃ£ tÃºi mÃ¡u</th>
                  <th>Chiáº¿n dá»‹ch</th>
                  <th>NhÃ³m mÃ¡u</th>
                  <th>Thá»ƒ tÃ­ch (ml)</th>
                  <th>NgÃ y thu nháº­n</th>
                  <th>NgÃ y háº¿t háº¡n</th>
                  <th>Tráº¡ng thÃ¡i</th>
                  <th>Háº¡n sá»­ dá»¥ng</th>
                  <th style={{ textAlign: "right" }}>Thao tÃ¡c</th>
                </tr>
              </thead>
              <tbody>
                {inventoryLoading ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      Äang táº£i dá»¯ liá»‡u kho mÃ¡u...
                    </td>
                  </tr>
                ) : inventoryList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      KhÃ´ng cÃ³ tÃºi mÃ¡u nÃ o trong kho.
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
                          className={`hsd-badge ${unit.tinhTrangHSD === "Háº¿t háº¡n" ? "danger" : unit.tinhTrangHSD === "Sáº¯p háº¿t háº¡n" ? "warning" : "success"}`}
                        >
                          {unit.tinhTrangHSD}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="td-action-group">
                          <button
                            onClick={() => handleEditInventory(unit)}
                            className="btn-action edit"
                            title="Sá»­a tÃºi mÃ¡u"
                          >
                            âœï¸
                          </button>
                          <button
                            onClick={() => handleDeleteInventory(unit.maTuiMau)}
                            className="btn-action delete"
                            title="XÃ³a khá»i kho"
                          >
                            ðŸ—‘ï¸
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PhÃ¢n trang */}
          {totalPages > 1 && (
            <div className="pagination-row">
              <button
                onClick={() => fetchInventory(currentPage - 1, searchKho)}
                disabled={currentPage === 0}
                className="btn-page"
              >
                â† TrÆ°á»›c
              </button>
              <span className="page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => fetchInventory(currentPage + 1, searchKho)}
                disabled={currentPage >= totalPages - 1}
                className="btn-page"
              >
                Sau â†’
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal sá»­a thÃ´ng tin tÃºi mÃ¡u */}
      {editUnit && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Sá»­a ThÃ´ng Tin TÃºi MÃ¡u</h3>
              <button
                onClick={() => setEditUnit(null)}
                className="btn-close-modal"
              >
                âœ–
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>MÃ£ tÃºi mÃ¡u</label>
                <input
                  type="text"
                  disabled
                  value={editUnit.maTuiMau}
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>NhÃ³m mÃ¡u</label>
                <select
                  value={editForm.nhomMau}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nhomMau: e.target.value })
                  }
                >
                  <option value="">-- Chá»n nhÃ³m mÃ¡u --</option>
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
                <label>Thá»ƒ tÃ­ch (ml)</label>
                <select
                  value={editForm.theTich}
                  onChange={(e) =>
                    setEditForm({ ...editForm, theTich: e.target.value })
                  }
                >
                  <option value="">-- Chá»n thá»ƒ tÃ­ch --</option>
                  <option value="250">250 ml</option>
                  <option value="350">350 ml</option>
                  <option value="450">450 ml</option>
                </select>
              </div>

              <div className="form-group">
                <label>NgÃ y háº¿t háº¡n</label>
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
                  Há»§y bá»
                </button>
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={handleSaveEdit}
                  className="btn-submit-form"
                >
                  {editSaving ? "Äang lÆ°u..." : "LÆ°u thay Ä‘á»•i"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

