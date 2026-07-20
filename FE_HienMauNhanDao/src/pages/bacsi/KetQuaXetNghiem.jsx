import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/KetQuaXetNghiem.css";

export default function KetQuaXetNghiem() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quáº£n lÃ½ viá»‡c hiá»ƒn thá»‹ vÃ  nháº­p liá»‡u trong Ã´ sá»­a Ä‘á»•i káº¿t quáº£
  const [editXN, setEditXN] = useState(null);
  const [xnForm, setXnForm] = useState({
    nhomMau: "",
    soLanXetNghiem: "1",
    moTa: "",
    ketQua: "",
  });
  const [xnSaving, setXnSaving] = useState(false);

  // Lá»c ra cÃ¡c ca Ä‘ang chá» xÃ©t nghiá»‡m (chÆ°a cÃ³ káº¿t quáº£) Ä‘á»ƒ bÃ¡o Ä‘á»™ng
  const reTestRequests = list.filter(
    (xn) => xn.ketQua === null || xn.ketQua === undefined,
  );

  // HÃ m gá»i API láº¥y danh sÃ¡ch xÃ©t nghiá»‡m tá»« Backend C#
  const fetchList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://localhost:7004/api/ketquaxetnghiem/danh-sach",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lá»—i khi táº£i danh sÃ¡ch xÃ©t nghiá»‡m:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // HÃ m gá»­i káº¿t quáº£ cáº­p nháº­t lÃªn C# API
  const handleEditSave = async () => {
    if (!xnForm.ketQua)
      return alert("Vui lÃ²ng chá»n káº¿t quáº£ Äáº¡t hoáº·c KhÃ´ng Ä‘áº¡t!");
    if (!xnForm.nhomMau) return alert("Vui lÃ²ng chá»n nhÃ³m mÃ¡u xÃ¡c nháº­n!");

    setXnSaving(true);
    try {
      const token = localStorage.getItem("token");
      const maNV = localStorage.getItem("email") || "NV00001"; // Láº¥y email nhÃ¢n viÃªn Ä‘Äƒng nháº­p lÃ m mÃ£ NV táº¡m thá»i

      const payload = {
        maTuiMau: editXN.maTuiMau,
        nhomMau: xnForm.nhomMau,
        soLanXetNghiem: parseInt(xnForm.soLanXetNghiem),
        moTa: xnForm.moTa,
        ketQua: xnForm.ketQua === "true",
        maNhanVien: maNV,
      };

      const res = await fetch(
        "https://localhost:7004/api/ketquaxetnghiem/luu",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const resData = await res.json();
      if (res.ok) {
        alert("ÄÃ£ cáº­p nháº­t káº¿t quáº£ xÃ©t nghiá»‡m tÃºi mÃ¡u thÃ nh cÃ´ng!");
        setEditXN(null);
        fetchList(); // Táº£i láº¡i danh sÃ¡ch má»›i
      } else {
        alert(resData.message || "Lá»—i khi lÆ°u!");
      }
    } catch (err) {
      alert("Lá»—i káº¿t ná»‘i mÃ¡y chá»§!");
    } finally {
      setXnSaving(false);
    }
  };

  // HÃ m xÃ³a káº¿t quáº£ xÃ©t nghiá»‡m Ä‘á»ƒ thá»±c hiá»‡n láº¡i tá»« Ä‘áº§u
  const handleDeleteXetNghiem = async (xn) => {
    if (xn.maKQ.startsWith("CHUA_TEST_"))
      return alert("TÃºi mÃ¡u nÃ y chÆ°a cÃ³ káº¿t quáº£ xÃ©t nghiá»‡m thá»±c táº¿!");
    if (
      !window.confirm(
        `Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a káº¿t quáº£ xÃ©t nghiá»‡m ${xn.maKQ}? TÃºi mÃ¡u sáº½ Ä‘Æ°á»£c chuyá»ƒn vá» hÃ ng chá» xÃ©t nghiá»‡m láº¡i.`,
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://localhost:7004/api/ketquaxetnghiem/xoa/${xn.maKQ}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        alert("ÄÃ£ xÃ³a káº¿t quáº£ xÃ©t nghiá»‡m thÃ nh cÃ´ng.");
        fetchList();
      }
    } catch (e) {
      alert("Lá»—i káº¿t ná»‘i!");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="xn-container animate-fadein">
        <div className="xn-header">
          <h1 className="xn-title">ðŸ§ª Quáº£n lÃ½ Káº¿t quáº£ XÃ©t nghiá»‡m mÃ¡u</h1>
          <p className="xn-subtitle">
            BÃ¡c sÄ© cáº­p nháº­t káº¿t quáº£ xÃ©t nghiá»‡m virus truyá»n nhiá»…m (HIV, viÃªm gan
            B...) cho tÃºi mÃ¡u.
          </p>
        </div>

        {/* Banner cáº£nh bÃ¡o sá»‘ lÆ°á»£ng tÃºi mÃ¡u cáº§n xÃ©t nghiá»‡m kháº©n cáº¥p */}
        {reTestRequests.length > 0 && (
          <div className="xn-alert-banner">
            <div className="xn-alert-left">
              <div className="xn-alert-icon animate-bounce">ðŸš¨</div>
              <div>
                <h4 className="xn-alert-title">
                  YÃŠU Cáº¦U XÃ‰T NGHIá»†M MÃU KHáº¨N Cáº¤P
                </h4>
                <p className="xn-alert-desc">
                  Hiá»‡n Ä‘ang cÃ³ <strong>{reTestRequests.length} tÃºi mÃ¡u</strong>{" "}
                  má»›i thu hoáº¡ch chÆ°a Ä‘Æ°á»£c xÃ©t nghiá»‡m lÃ¢m sÃ ng. Vui lÃ²ng cáº­p nháº­t
                  sá»›m!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="xn-table-card">
          {loading ? (
            <div className="xn-loading">
              Äang táº£i danh sÃ¡ch xÃ©t nghiá»‡m kho mÃ¡u...
            </div>
          ) : list.length === 0 ? (
            <div className="xn-empty">
              ChÆ°a cÃ³ tÃºi mÃ¡u nÃ o chá» hoáº·c Ä‘Ã£ xÃ©t nghiá»‡m.
            </div>
          ) : (
            <div className="xn-table-wrapper">
              <table className="xn-table">
                <thead>
                  <tr>
                    <th>MÃ£ XN</th>
                    <th>MÃ£ tÃºi mÃ¡u</th>
                    <th>NgÆ°á»i hiáº¿n mÃ¡u</th>
                    <th>Chiáº¿n dá»‹ch</th>
                    <th>NhÃ³m mÃ¡u</th>
                    <th>Sá»‘ láº§n test</th>
                    <th>Tráº¡ng thÃ¡i káº¿t quáº£</th>
                    <th>Ghi chÃº / MÃ´ táº£ bá»‡nh</th>
                    <th style={{ textAlign: "right" }}>Thao tÃ¡c</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((xn) => {
                    const isPending =
                      xn.ketQua === null || xn.ketQua === undefined;
                    return (
                      <tr
                        key={xn.maKQ}
                        className={isPending ? "row-pending-test" : ""}
                      >
                        <td className="font-mono">
                          <strong>
                            {xn.maKQ.startsWith("CHUA_TEST_")
                              ? "ChÆ°a cÃ³"
                              : xn.maKQ}
                          </strong>
                        </td>
                        <td className="font-mono text-primary">
                          <strong>{xn.maTuiMau}</strong>
                        </td>
                        <td>{xn.tenTinhNguyenVien}</td>
                        <td className="col-campaign">{xn.tenChienDich}</td>
                        <td>
                          {xn.nhomMau && xn.nhomMau !== "ChÆ°a rÃµ" ? (
                            <span className="badge-blood-type">
                              {xn.nhomMau}
                            </span>
                          ) : (
                            <span className="text-muted">ChÆ°a rÃµ</span>
                          )}
                        </td>
                        <td>{xn.soLanXetNghiem} láº§n</td>
                        <td>
                          {isPending ? (
                            <span className="tag-result pending">
                              ðŸ§ª Chá» xÃ©t nghiá»‡m
                            </span>
                          ) : xn.ketQua ? (
                            <span className="tag-result success">
                              âœ… Äáº¡t chuáº©n
                            </span>
                          ) : (
                            <span className="tag-result danger">
                              âŒ Nhiá»…m bá»‡nh (Há»§y)
                            </span>
                          )}
                        </td>
                        <td className="col-desc">
                          {xn.moTa || "ChÆ°a cÃ³ ghi chÃº"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="actions-cell">
                            <button
                              onClick={() => {
                                setEditXN(xn);
                                setXnForm({
                                  nhomMau:
                                    xn.nhomMau === "ChÆ°a rÃµ"
                                      ? "O+"
                                      : xn.nhomMau,
                                  soLanXetNghiem: String(xn.soLanXetNghiem),
                                  moTa:
                                    xn.moTa === "Chá» xÃ©t nghiá»‡m láº§n Ä‘áº§u"
                                      ? ""
                                      : xn.moTa,
                                  ketQua:
                                    xn.ketQua === true
                                      ? "true"
                                      : xn.ketQua === false
                                        ? "false"
                                        : "",
                                });
                              }}
                              className="btn-action-edit"
                              title="Cáº­p nháº­t káº¿t quáº£"
                            >
                              âœï¸
                            </button>
                            {!xn.maKQ.startsWith("CHUA_TEST_") && (
                              <button
                                onClick={() => handleDeleteXetNghiem(xn)}
                                className="btn-action-delete"
                                title="XÃ³a káº¿t quáº£"
                              >
                                ðŸ—‘ï¸
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal nháº­p / sá»­a Ä‘á»•i káº¿t quáº£ xÃ©t nghiá»‡m */}
        {editXN && (
          <div className="modal-backdrop" onClick={() => setEditXN(null)}>
            <div
              className="modal-card animate-fadein"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>ðŸ§ª Cáº­p nháº­t káº¿t quáº£ xÃ©t nghiá»‡m</h3>
                <p className="font-mono">TÃºi mÃ¡u: {editXN.maTuiMau}</p>
              </div>

              <div className="modal-body">
                <div className="modal-form-group">
                  <label>Káº¿t quáº£ kiá»ƒm tra virus truyá»n nhiá»…m</label>
                  <div className="modal-radio-row">
                    <label className="modal-radio-label">
                      <input
                        type="radio"
                        name="modalKq"
                        value="true"
                        checked={xnForm.ketQua === "true"}
                        onChange={(e) =>
                          setXnForm((p) => ({ ...p, ketQua: e.target.value }))
                        }
                      />
                      Äáº¡t chuáº©n (An toÃ n)
                    </label>
                    <label className="modal-radio-label">
                      <input
                        type="radio"
                        name="modalKq"
                        value="false"
                        checked={xnForm.ketQua === "false"}
                        onChange={(e) =>
                          setXnForm((p) => ({ ...p, ketQua: e.target.value }))
                        }
                      />
                      KhÃ´ng Ä‘áº¡t (Há»§y bá» tÃºi mÃ¡u)
                    </label>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label>NhÃ³m mÃ¡u xÃ¡c nháº­n</label>
                  <select
                    value={xnForm.nhomMau}
                    onChange={(e) =>
                      setXnForm((p) => ({ ...p, nhomMau: e.target.value }))
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

                <div className="modal-form-group">
                  <label>Sá»‘ láº§n xÃ©t nghiá»‡m kiá»ƒm chá»©ng</label>
                  <input
                    type="number"
                    min="1"
                    value={xnForm.soLanXetNghiem}
                    onChange={(e) =>
                      setXnForm((p) => ({
                        ...p,
                        soLanXetNghiem: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="modal-form-group">
                  <label>Ghi chÃº bá»‡nh lÃ½ (náº¿u cÃ³)</label>
                  <textarea
                    value={xnForm.moTa}
                    onChange={(e) =>
                      setXnForm((p) => ({ ...p, moTa: e.target.value }))
                    }
                    rows="3"
                    placeholder="Nháº­p ghi chÃº hoáº·c mÃ´ táº£ lÃ½ do khÃ´ng Ä‘áº¡t..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setEditXN(null)}
                  className="btn-modal-cancel"
                >
                  Há»§y
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={xnSaving}
                  className="btn-modal-submit"
                >
                  {xnSaving ? "Äang lÆ°u..." : "LÆ°u káº¿t quáº£"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

