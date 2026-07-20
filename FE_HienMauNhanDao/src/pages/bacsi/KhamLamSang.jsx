import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/KhamLamSang.css";

export default function KhamLamSang() {
  const location = useLocation();
  const [showList, setShowList] = useState(false); // false: Nháº­p liá»‡u, true: Lá»‹ch sá»­ danh sÃ¡ch
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);
  const [qrInput, setQrInput] = useState("");

  // Tá»± Ä‘á»™ng check-in náº¿u cÃ³ mÃ£ Ä‘Æ¡n Ä‘Æ°á»£c truyá»n tá»« danh sÃ¡ch chá» khÃ¡m
  useEffect(() => {
    const ma = location.state?.maDon;
    if (ma) {
      setQrInput(ma);
      checkInTuDong(ma);
    }
  }, [location.state?.maDon]);

  const checkInTuDong = async (maDonCanKham) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/khamlamsang/cho-kham", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        const found = list.find(d => d.maDon.toLowerCase() === maDonCanKham.trim().toLowerCase());
        if (found) {
          setIsCheckedIn(true);
          setDonorInfo(found);
        }
      }
    } catch (error) {
      console.error("Lá»—i check-in tá»± Ä‘á»™ng:", error);
    }
  };
  
  const [form, setForm] = useState({
    huyetAp: "120/80",
    nhipTim: "75",
    canNang: "60",
    nhietDo: "37.0",
    ketQua: "", // "dat" hoáº·c "khong_dat"
    lyDoTuChoi: ""
  });
  const [volumeSelect, setVolumeSelect] = useState("350");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [screeningList, setScreeningList] = useState([]);
  const [stats, setStats] = useState({ tongSo: 0, datYeuCau: 0, khongDat: 0 });

  // 1. Gá»i API láº¥y danh sÃ¡ch ca khÃ¡m & sá»‘ liá»‡u thá»‘ng kÃª tá»« Backend C#
  const fetchScreeningList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const listRes = await fetch("https://localhost:7004/api/khamlamsang/danh-sach", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listRes.json();

      const statsRes = await fetch("https://localhost:7004/api/khamlamsang/thong-ke", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      setScreeningList(Array.isArray(listData) ? listData : []);
      setStats(statsData || { tongSo: 0, datYeuCau: 0, khongDat: 0 });
    } catch (error) {
      console.error("Lá»—i khi táº£i dá»¯ liá»‡u khÃ¡m:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showList) fetchScreeningList();
  }, [showList]);

  // 2. Chá»©c nÄƒng Check-in mÃ£ Ä‘Æ¡n (TÃ¬m kiáº¿m trong hÃ ng chá» khÃ¡m)
  const handleCheckIn = async () => {
    if (!qrInput.trim()) return alert("Vui lÃ²ng nháº­p mÃ£ Ä‘Æ¡n Ä‘Äƒng kÃ½!");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/khamlamsang/cho-kham", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      const found = list.find(d => d.maDon.toLowerCase() === qrInput.trim().toLowerCase());

      if (found) {
        setIsCheckedIn(true);
        setDonorInfo(found);
        alert(`Check-in thÃ nh cÃ´ng: ${found.tenTinhNguyenVien}`);
      } else {
        alert("KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n Ä‘Äƒng kÃ½ nÃ y trong hÃ ng chá» khÃ¡m lÃ¢m sÃ ng!");
      }
    } catch (error) {
      alert("Lá»—i káº¿t ná»‘i mÃ¡y chá»§!");
    }
  };

  // 3. Chá»©c nÄƒng lÆ°u káº¿t quáº£ khÃ¡m lÃ¢m sÃ ng & tá»± Ä‘á»™ng táº¡o tÃºi mÃ¡u
  const handleSave = async () => {
    if (!isCheckedIn) return alert("Vui lÃ²ng Check-in mÃ£ Ä‘Æ¡n trÆ°á»›c khi khÃ¡m!");
    if (!form.ketQua) return alert("Vui lÃ²ng lá»±a chá»n káº¿t quáº£ sÃ ng lá»c (Äáº¡t/KhÃ´ng Ä‘áº¡t)!");
    if (form.ketQua === "khong_dat" && !form.lyDoTuChoi.trim()) {
      return alert("Vui lÃ²ng Ä‘iá»n lÃ½ do khÃ´ng Ä‘áº¡t yÃªu cáº§u sá»©c khá»e!");
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const maNV = localStorage.getItem("email"); // Láº¥y email hoáº·c tÃ i khoáº£n bÃ¡c sÄ© phá»¥ trÃ¡ch

      const payload = {
        maDon: donorInfo.maDon,
        maNhanVien: maNV || "NV00001",
        huyetAp: form.huyetAp,
        nhipTim: parseInt(form.nhipTim),
        canNang: parseFloat(form.canNang),
        nhietDo: parseFloat(form.nhietDo),
        ketQua: form.ketQua === "dat",
        lyDoTuChoi: form.ketQua === "dat" ? "" : form.lyDoTuChoi,
        theTichHien: parseInt(volumeSelect)
      };

      const res = await fetch("https://localhost:7004/api/khamlamsang/luu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (resData.success) {
        alert("LÆ°u káº¿t quáº£ khÃ¡m vÃ  thu nháº­n tÃºi mÃ¡u thÃ nh cÃ´ng!");
        setIsCheckedIn(false);
        setDonorInfo(null);
        setQrInput("");
        setForm({ huyetAp: "120/80", nhipTim: "75", canNang: "60", nhietDo: "37.0", ketQua: "", lyDoTuChoi: "" });
      } else {
        alert(resData.message);
      }
    } catch (error) {
      alert("Lá»—i khi gá»­i káº¿t quáº£ lÃªn há»‡ thá»‘ng!");
    } finally {
      setSaving(false);
    }
  };

  // 4. XÃ³a káº¿t quáº£ khÃ¡m cÅ© (Ä‘á»ƒ khÃ¡m láº¡i)
  const handleDelete = async (maKQ) => {
    if (!window.confirm("Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a káº¿t quáº£ khÃ¡m nÃ y? TÃºi mÃ¡u liÃªn quan (náº¿u cÃ³) cÅ©ng sáº½ bá»‹ xÃ³a.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://localhost:7004/api/khamlamsang/xoa/${maKQ}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("ÄÃ£ xÃ³a káº¿t quáº£ khÃ¡m thÃ nh cÃ´ng.");
        fetchScreeningList();
      }
    } catch (error) {
      alert("Lá»—i khi káº¿t ná»‘i!");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="kls-container">
        
        {/* TiÃªu Ä‘á» trang */}
        <div className="kls-header">
          <h1 className="kls-title">ðŸ©º KhÃ¡m sÃ ng lá»c & Thu nháº­n mÃ¡u</h1>
          <p className="kls-subtitle">Nháº­p cÃ¡c chá»‰ sá»‘ sá»©c khá»e sinh tá»“n vÃ  xá»­ lÃ½ thu hoáº¡ch tÃºi mÃ¡u.</p>
        </div>

        {/* Chuyá»ƒn Ä‘á»•i Tab Nháº­p liá»‡u / Xem lá»‹ch sá»­ */}
        <div className="kls-tab-bar">
          <button onClick={() => setShowList(false)} className={`kls-tab-btn ${!showList ? 'active' : ''}`}>
            ðŸ“ Nháº­p dá»¯ liá»‡u sÃ ng lá»c
          </button>
          <button onClick={() => setShowList(true)} className={`kls-tab-btn ${showList ? 'active' : ''}`}>
            ðŸ“‹ Lá»‹ch sá»­ khÃ¡m lÃ¢m sÃ ng
          </button>
        </div>

        {!showList ? (
          /* ================= KHá»I NHáº¬P LIá»†U ================= */
          <div className="kls-layout-grid">
            
            {/* Cá»™t 1: QuÃ©t Ä‘Æ¡n & thÃ´ng tin ngÆ°á»i hiáº¿n */}
            <div className="kls-card kls-card-left">
              <h2 className="kls-card-title">ðŸ” Check-in ÄÆ¡n Ä‘Äƒng kÃ½</h2>
              
              <div className="checkin-search-box">
                <input 
                  type="text" 
                  placeholder="Nháº­p mÃ£ Ä‘Æ¡n hiáº¿n mÃ¡u (VD: DON00001)..." 
                  value={qrInput}
                  onChange={e => setQrInput(e.target.value)}
                  className="checkin-input"
                />
                <button onClick={handleCheckIn} className="btn-checkin">Check-in</button>
              </div>

              {isCheckedIn && donorInfo ? (
                <div className="donor-info-details animate-fadein">
                  <h3 className="donor-info-title">ðŸ‘¤ ThÃ´ng tin ngÆ°á»i hiáº¿n mÃ¡u</h3>
                  <div className="info-row"><span>Há» & TÃªn:</span> <strong>{donorInfo.tenTinhNguyenVien}</strong></div>
                  <div className="info-row"><span>NgÃ y sinh:</span> <strong>{donorInfo.ngaySinh}</strong></div>
                  <div className="info-row"><span>Giá»›i tÃ­nh:</span> <strong>{donorInfo.gioiTinh}</strong></div>
                  <div className="info-row"><span>NhÃ³m mÃ¡u:</span> <strong className="blood-badge-text">{donorInfo.nhomMau}</strong></div>
                  <div className="info-row"><span>MÃ£ Ä‘Æ¡n:</span> <strong className="font-mono">{donorInfo.maDon}</strong></div>
                </div>
              ) : (
                <div className="checkin-placeholder">Vui lÃ²ng nháº­p mÃ£ Ä‘Æ¡n vÃ  báº¥m Check-in Ä‘á»ƒ báº¯t Ä‘áº§u khÃ¡m sÃ ng lá»c</div>
              )}
            </div>

            {/* Cá»™t 2: Form khÃ¡m lÃ¢m sÃ ng */}
            <div className="kls-card kls-card-right">
              <h2 className="kls-card-title">ðŸ“‹ Chá»‰ sá»‘ y táº¿ lÃ¢m sÃ ng</h2>
              
              <div className="kls-form-grid">
                <div className="form-group">
                  <label>Huyáº¿t Ã¡p (mmHg)</label>
                  <input 
                    type="text" 
                    value={form.huyetAp} 
                    onChange={e => setForm(p => ({ ...p, huyetAp: e.target.value }))}
                    placeholder="VD: 120/80" 
                  />
                  {form.huyetAp && form.huyetAp.includes("/") && (
                    (() => {
                      const sys = parseInt(form.huyetAp.split("/")[0]);
                      if (!isNaN(sys) && (sys > 140 || sys < 90)) {
                        return <span className="warning-note-text">âš ï¸ Huyáº¿t Ã¡p báº¥t thÆ°á»ng (90-140)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>

                <div className="form-group">
                  <label>Nhá»‹p tim (bpm)</label>
                  <input 
                    type="number" 
                    value={form.nhipTim} 
                    onChange={e => setForm(p => ({ ...p, nhipTim: e.target.value }))}
                  />
                  {form.nhipTim && (
                    (() => {
                      const hr = parseInt(form.nhipTim);
                      if (!isNaN(hr) && (hr > 100 || hr < 60)) {
                        return <span className="warning-note-text">âš ï¸ Nhá»‹p tim báº¥t thÆ°á»ng (60-100)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>

                <div className="form-group">
                  <label>CÃ¢n náº·ng (kg)</label>
                  <input 
                    type="number" 
                    value={form.canNang} 
                    onChange={e => setForm(p => ({ ...p, canNang: e.target.value }))}
                  />
                  {form.canNang && (
                    (() => {
                      const w = parseFloat(form.canNang);
                      if (!isNaN(w) && w < 45) {
                        return <span className="warning-note-text">âš ï¸ CÃ¢n náº·ng &lt; 45kg (Chá»‰ hiáº¿n 250ml)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>

                <div className="form-group">
                  <label>Nhiá»‡t Ä‘á»™ (Â°C)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={form.nhietDo} 
                    onChange={e => setForm(p => ({ ...p, nhietDo: e.target.value }))}
                  />
                  {form.nhietDo && (
                    (() => {
                      const t = parseFloat(form.nhietDo);
                      if (!isNaN(t) && (t > 37.8 || t < 36.0)) {
                        return <span className="warning-note-text">âš ï¸ ThÃ¢n nhiá»‡t báº¥t thÆ°á»ng (36-37.8)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>
              </div>

              {/* Lá»±a chá»n thá»ƒ tÃ­ch hiáº¿n */}
              <div className="form-group select-volume-group">
                <label>Thá»ƒ tÃ­ch mÃ¡u thu nháº­n (ml)</label>
                <select value={volumeSelect} onChange={e => setVolumeSelect(e.target.value)}>
                  <option value="250">250 ml (CÃ¢n náº·ng &ge; 45kg)</option>
                  <option value="350">350 ml (CÃ¢n náº·ng &ge; 50kg)</option>
                  <option value="450">450 ml (Thá»ƒ tráº¡ng tá»‘t)</option>
                </select>
              </div>

              {/* Lá»±a chá»n káº¿t quáº£ */}
              <div className="form-group result-radio-group">
                <label>Káº¿t quáº£ khÃ¡m sÃ ng lá»c</label>
                <div className="radio-row">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="ketQua" 
                      checked={form.ketQua === "dat"} 
                      onChange={() => setForm(p => ({ ...p, ketQua: "dat", lyDoTuChoi: "" }))} 
                    />
                    Äáº¡t yÃªu cáº§u hiáº¿n mÃ¡u
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="ketQua" 
                      checked={form.ketQua === "khong_dat"} 
                      onChange={() => setForm(p => ({ ...p, ketQua: "khong_dat" }))} 
                    />
                    KhÃ´ng Ä‘áº¡t yÃªu cáº§u
                  </label>
                </div>
              </div>

              {form.ketQua === "khong_dat" ? (
                <div className="form-group animate-fadein">
                  <label style={{ color: "#dc2626" }}>LÃ½ do tá»« chá»‘i (Báº¯t buá»™c)</label>
                  <textarea 
                    placeholder="MÃ´ táº£ lÃ½ do khÃ´ng Ä‘á»§ sá»©c khá»e..." 
                    value={form.lyDoTuChoi}
                    onChange={e => setForm(p => ({ ...p, lyDoTuChoi: e.target.value }))}
                    rows="3"
                  />
                </div>
              ) : null}

              <button onClick={handleSave} disabled={saving} className="btn-submit-kls">
                {saving ? "Äang lÆ°u..." : "ðŸ’¾ LÆ¯U Káº¾T QUáº¢ & SINH TÃšI MÃU"}
              </button>
            </div>

          </div>
        ) : (
          /* ================= KHá»I Lá»ŠCH Sá»¬ DANH SÃCH ================= */
          <div className="kls-history-layout">
            {/* HÃ ng 3 Card thá»‘ng kÃª sá»‘ liá»‡u khÃ¡m sÃ ng lá»c */}
            <div className="kls-stats-row">
              <div className="stat-box-kls gray">
                <span>Tá»•ng sá»‘ ca khÃ¡m</span>
                <strong>{stats.tongSo} ca</strong>
              </div>
              <div className="stat-box-kls green">
                <span>Äáº¡t yÃªu cáº§u</span>
                <strong>{stats.datYeuCau} ca</strong>
              </div>
              <div className="stat-box-kls red">
                <span>Bá»‹ tá»« chá»‘i</span>
                <strong>{stats.khongDat} ca</strong>
              </div>
            </div>

            {/* Báº£ng danh sÃ¡ch ca khÃ¡m */}
            <div className="kls-table-card">
              <div className="kls-table-wrapper">
                <table className="kls-table">
                  <thead>
                    <tr>
                      <th>MÃ£ khÃ¡m</th>
                      <th>MÃ£ Ä‘Æ¡n</th>
                      <th>TÃ¬nh nguyá»‡n viÃªn</th>
                      <th>Chiáº¿n dá»‹ch</th>
                      <th>Huyáº¿t Ã¡p</th>
                      <th>Nhá»‹p tim</th>
                      <th>CÃ¢n náº·ng</th>
                      <th>Káº¿t quáº£</th>
                      <th>MÃ´ táº£ / LÃ½ do tá»« chá»‘i</th>
                      <th style={{ textAlign: "right" }}>Thao tÃ¡c</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>Äang táº£i danh sÃ¡ch...</td></tr>
                    ) : screeningList.length === 0 ? (
                      <tr><td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>KhÃ´ng cÃ³ dá»¯ liá»‡u ca khÃ¡m sÃ ng lá»c nÃ o</td></tr>
                    ) : (
                      screeningList.map((item) => (
                        <tr key={item.maKQ} className={!item.ketQua ? "row-failed" : ""}>
                          <td><strong className="font-mono text-primary">{item.maKQ}</strong></td>
                          <td className="font-mono">{item.maDon}</td>
                          <td>{item.tenTinhNguyenVien}</td>
                          <td className="col-campaign">{item.tenChienDich}</td>
                          <td>{item.huyetAp} mmHg</td>
                          <td>{item.nhipTim} bpm</td>
                          <td>{item.canNang} kg</td>
                          <td>
                            {item.ketQua ? (
                              <span className="badge-kls badge-success">Äáº¡t</span>
                            ) : (
                              <span className="badge-kls badge-danger">KhÃ´ng Ä‘áº¡t</span>
                            )}
                          </td>
                          <td className="col-desc">{item.lyDoTuChoi || "---"}</td>
                          <td style={{ textAlign: "right" }}>
                            <button onClick={() => handleDelete(item.maKQ)} className="btn-delete-kls" title="XÃ³a bá»">
                              ðŸ—‘ï¸
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

