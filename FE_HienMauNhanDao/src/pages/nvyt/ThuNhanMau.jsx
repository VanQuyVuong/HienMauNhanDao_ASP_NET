import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/ThuNhanMau.css";

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

  // Load danh sÃ¡ch tÃºi mÃ¡u cáº§n thu nháº­n
  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7004/api/tuimau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Lá»c cÃ¡c tÃºi mÃ¡u cÃ³ tráº¡ng thÃ¡i "Chá» xÃ©t nghiá»‡m" (tÆ°Æ¡ng á»©ng ChÆ°a xá»­ lÃ½)
        const pendingUnits = (data || []).filter(
          (t) => t.trangThai === "Chá» xÃ©t nghiá»‡m",
        );
        setList(pendingUnits);
      }
    } catch (error) {
      console.error("Lá»—i láº¥y danh sÃ¡ch tÃºi mÃ¡u:", error);
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
        alert("âœ… Cáº­p nháº­t thÃ´ng tin tÃºi mÃ¡u thÃ nh cÃ´ng!");
        setSelectedUnit(null);
        loadData();
      } else {
        alert(
          "âŒ Cáº­p nháº­t tháº¥t báº¡i: " + (resData.message || "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh."),
        );
      }
    } catch (error) {
      console.error(error);
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
    } finally {
      setSaving(false);
    }
  };

  // HÃ m in nhÃ£n dÃ¡n mÃ£ váº¡ch Barcode dÃ¡n lÃªn tÃºi mÃ¡u
  const handlePrintBarcode = (unit) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>In mÃ£ váº¡ch tÃºi mÃ¡u</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 20px; }
            .barcode-box { border: 2px dashed #000; padding: 15px; display: inline-block; border-radius: 8px; }
            .barcode { font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 10px 0; }
            .details { font-size: 12px; margin-top: 5px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="barcode-box">
            <div><strong>Há»† THá»NG HIáº¾N MÃU NHÃ‚N Äáº O ÄÃ€ Náº´NG</strong></div>
            <div class="barcode">|||| ||| ||||| | ||</div>
            <div><strong>${unit.maTuiMau}</strong></div>
            <div class="details">
              NhÃ³m mÃ¡u: ${unit.nhomMau} | Thá»ƒ tÃ­ch: ${unit.theTich} ml<br/>
              Chiáº¿n dá»‹ch: ${unit.tenChienDich}<br/>
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
            <h1 className="tnm-title">ðŸ’‰ Tiáº¿p Nháº­n & Thu Nháº­n TÃºi MÃ¡u</h1>
            <p className="tnm-subtitle">
              NVYT dÃ¡n mÃ£ váº¡ch, cáº¥u hÃ¬nh thá»ƒ tÃ­ch vÃ  nhiá»‡t Ä‘á»™ báº£o quáº£n tÃºi mÃ¡u.
            </p>
          </div>
        </div>

        {/* Search Row */}
        <div className="tnm-search-row">
          <input
            type="text"
            placeholder="ðŸ” TÃ¬m theo mÃ£ tÃºi mÃ¡u, tÃªn ngÆ°á»i hiáº¿n..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tnm-search-input"
          />
          <button onClick={loadData} className="btn-reload-tnm">
            ðŸ”„ Táº£i láº¡i
          </button>
        </div>

        {/* Báº£ng danh sÃ¡ch */}
        <div className="tnm-table-card shadow-sm">
          <div className="table-responsive">
            <table className="tnm-table">
              <thead>
                <tr>
                  <th>MÃ£ tÃºi mÃ¡u</th>
                  <th>NgÆ°á»i hiáº¿n</th>
                  <th>Chiáº¿n dá»‹ch</th>
                  <th>Thá»ƒ tÃ­ch (ml)</th>
                  <th>NhÃ³m mÃ¡u</th>
                  <th>NgÃ y thu nháº­n</th>
                  <th>Nhiá»‡t Ä‘á»™ VC</th>
                  <th style={{ textAlign: "right" }}>Thao tÃ¡c</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      Äang táº£i danh sÃ¡ch tÃºi mÃ¡u...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      KhÃ´ng cÃ³ tÃºi mÃ¡u nÃ o chá» thu nháº­n.
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
                          ? `${item.nhietDoVanChuyen} Â°C`
                          : "4.0 Â°C"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="tnm-actions">
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn-edit-tnm"
                          >
                            âš™ï¸ Cáº¥u hÃ¬nh
                          </button>
                          <button
                            onClick={() => handlePrintBarcode(item)}
                            className="btn-print-tnm"
                          >
                            ðŸ–¨ï¸ In mÃ£ váº¡ch
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

        {/* Modal Cáº¥u hÃ¬nh */}
        {selectedUnit && (
          <div className="modal-backdrop">
            <div className="modal-card animate-fadein">
              <div className="modal-header">
                <h3>Cáº¥u hÃ¬nh tÃºi mÃ¡u {selectedUnit.maTuiMau}</h3>
                <p>Cáº­p nháº­t thá»ƒ tÃ­ch vÃ  nhiá»‡t Ä‘á»™ báº£o quáº£n tÃºi mÃ¡u</p>
              </div>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label>NhÃ³m mÃ¡u xÃ¡c nháº­n</label>
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
                  <label>Thá»ƒ tÃ­ch tÃºi mÃ¡u (ml)</label>
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
                  <label>Nhiá»‡t Ä‘á»™ váº­n chuyá»ƒn (Â°C)</label>
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
                  Há»§y
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="btn-modal-submit"
                >
                  {saving ? "Äang lÆ°u..." : "LÆ°u thay Ä‘á»•i"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

