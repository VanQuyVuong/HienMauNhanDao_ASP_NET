import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/AdminChungNhan.css";

export default function CapGiayChungNhan() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);

  // 1. HÃ m load danh sÃ¡ch á»©ng viÃªn (DÃ¹ng phÆ°Æ¡ng thá»©c GET máº·c Ä‘á»‹nh)
  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://localhost:7004/api/chungnhan/candidates",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lá»—i táº£i danh sÃ¡ch á»©ng viÃªn:", err);
      alert("âŒ Lá»—i táº£i danh sÃ¡ch ngÆ°á»i hiáº¿n mÃ¡u!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = React.useMemo(() => {
    const pending = candidates.filter(
      (c) => c.trangThaiCap === "pending",
    ).length;
    const issued = candidates.filter((c) => c.trangThaiCap === "issued").length;
    return { pending, issued, total: candidates.length };
  }, [candidates]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchQ =
        !q ||
        (c.hoVaTen || "").toLowerCase().includes(q) ||
        (c.soCCCD || "").toLowerCase().includes(q);
      const matchS = !filterStatus || c.trangThaiCap === filterStatus;
      return matchQ && matchS;
    });
  }, [candidates, search, filterStatus]);

  // 2. HÃ m gá»i API cáº¥p phÃ¡t chá»©ng nháº­n (Báº¯t buá»™c dÃ¹ng POST)
  const handleIssue = async (maDon, name) => {
    if (!window.confirm(`Báº¡n cÃ³ cháº¯c muá»‘n cáº¥p chá»©ng nháº­n cho ${name}?`)) return;

    const token = localStorage.getItem("token");
    try {
      // ÄÃƒ Sá»¬A: ThÃªm method: "POST" vÃ  cáº¥u hÃ¬nh Ä‘Ãºng Ä‘á»‹a chá»‰ API
      const res = await fetch(
        `https://localhost:7004/api/chungnhan/issue/${maDon}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        alert(`âœ… Cáº¥p chá»©ng nháº­n thÃ nh cÃ´ng cho ${name}!`);
        await loadData();
        if (selected && selected.maDon === maDon) {
          setSelected(data.data);
        }
      } else {
        alert(`âŒ Lá»—i: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("âŒ CÃ³ lá»—i xáº£y ra trong quÃ¡ trÃ¬nh phÃ¡t hÃ nh!");
    }
  };

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="chungnhan-container">
        <div className="cn-header-row">
          <div>
            <h1 className="cn-page-title">ðŸ“œ Cáº¥p Giáº¥y Chá»©ng Nháº­n Hiáº¿n MÃ¡u</h1>
            <p className="cn-page-subtitle">
              PhÃ¡t hÃ nh chá»©ng nháº­n Ä‘iá»‡n tá»­ cho nhá»¯ng tÃ¬nh nguyá»‡n viÃªn Ä‘Ã£ hoÃ n
              thÃ nh hiáº¿n mÃ¡u.
            </p>
          </div>
        </div>

        <div className="cn-stats-row">
          <div className="cn-stat-card border-amber">
            <span className="cn-stat-label">Äang chá» duyá»‡t</span>
            <span className="cn-stat-val text-amber">{stats.pending}</span>
          </div>
          <div className="cn-stat-card border-emerald">
            <span className="cn-stat-label">ÄÃ£ phÃ¡t hÃ nh</span>
            <span className="cn-stat-val text-emerald">{stats.issued}</span>
          </div>
          <div className="cn-stat-card border-red">
            <span className="cn-stat-label">Tá»•ng sá»‘ Ä‘á»§ Ä‘iá»u kiá»‡n</span>
            <span className="cn-stat-val text-red">{stats.total}</span>
          </div>
        </div>

        <div className="cn-work-area">
          <div className="cn-panel cn-list-panel">
            <div className="cn-panel-header">
              <h3>Danh sÃ¡ch tÃ¬nh nguyá»‡n viÃªn</h3>
              <div className="cn-filters">
                <input
                  type="text"
                  placeholder="TÃ¬m theo tÃªn, CCCD..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="cn-input-search"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="cn-select-status"
                >
                  <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
                  <option value="pending">Chá» cáº¥p phÃ¡t</option>
                  <option value="issued">ÄÃ£ cáº¥p phÃ¡t</option>
                </select>
              </div>
            </div>

            <div className="cn-table-wrapper">
              <table className="cn-table">
                <thead>
                  <tr>
                    <th>TÃªn TÃ¬nh Nguyá»‡n ViÃªn</th>
                    <th>NhÃ³m MÃ¡u</th>
                    <th>Thá»ƒ TÃ­ch</th>
                    <th>Tráº¡ng ThÃ¡i</th>
                    <th style={{ textAlign: "center" }}>Thao TÃ¡c</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="cn-table-empty">
                        Äang táº£i danh sÃ¡ch...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="cn-table-empty">
                        KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i hiáº¿n mÃ¡u phÃ¹ há»£p.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c.maDon}
                        onClick={() => setSelected(c)}
                        className={`cn-table-row ${selected?.maDon === c.maDon ? "active" : ""}`}
                      >
                        <td>
                          <div className="cn-avatar-info">
                            <div className="cn-avatar">
                              {initials(c.hoVaTen)}
                            </div>
                            <div>
                              <strong className="cn-name-text">
                                {c.hoVaTen}
                              </strong>
                              <div className="cn-sub-text">
                                CCCD: {c.soCCCD}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-nhommau">{c.nhomMau}</span>
                        </td>
                        <td className="cn-volume-text">{c.theTich}</td>
                        <td>
                          <span className={`badge-status ${c.trangThaiCap}`}>
                            {c.trangThaiCap === "issued" ? "ÄÃ£ cáº¥p" : "Chá» cáº¥p"}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: "center" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.trangThaiCap === "issued" ? (
                            <button
                              onClick={() => navigate(`/chung-nhan/${c.maDon}`)}
                              className="btn-action btn-view"
                            >
                              ðŸ‘ï¸ Xem
                            </button>
                          ) : (
                            <button
                              onClick={() => handleIssue(c.maDon, c.hoVaTen)}
                              className="btn-action btn-issue"
                            >
                              âœï¸ Cáº¥p phÃ¡t
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cn-panel cn-preview-panel">
            {!selected ? (
              <div className="cn-preview-placeholder">
                <div className="placeholder-icon">ðŸŽ–ï¸</div>
                <h4>Xem trÆ°á»›c giáº¥y chá»©ng nháº­n</h4>
                <p>
                  Báº¥m vÃ o má»™t hÃ ng trong danh sÃ¡ch Ä‘á»ƒ xem trÆ°á»›c phÃ´i chá»©ng nháº­n
                  Ä‘iá»‡n tá»­.
                </p>
              </div>
            ) : (
              <div className="cn-certificate-preview">
                <div className="preview-top">
                  <h5>GIáº¤Y CHá»¨NG NHáº¬N ÄIá»†N Tá»¬</h5>
                  <p>MÃ£ sá»‘: {selected.maChungNhan || "ChÆ°a phÃ¡t hÃ nh"}</p>
                </div>
                <div className="preview-body">
                  <div className="preview-quote">
                    "Má»™t giá»t mÃ¡u cho Ä‘i - Má»™t cuá»™c Ä‘á»i á»Ÿ láº¡i"
                  </div>

                  <div className="preview-info-grid">
                    <div className="info-item">
                      <span className="info-label">NgÆ°á»i hiáº¿n:</span>
                      <strong className="info-val text-red">
                        {selected.hoVaTen}
                      </strong>
                    </div>
                    <div className="info-item">
                      <span className="info-label">NhÃ³m mÃ¡u:</span>
                      <span className="info-val font-bold text-red">
                        {selected.nhomMau}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Thá»ƒ tÃ­ch hiáº¿n:</span>
                      <span className="info-val font-bold">
                        {selected.theTich}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Chiáº¿n dá»‹ch:</span>
                      <span className="info-val">{selected.tenChienDich}</span>
                    </div>
                  </div>
                </div>

                <div className="preview-footer">
                  <button
                    onClick={() => navigate(`/chung-nhan/${selected.maDon}`)}
                    className="btn-preview-action btn-preview-view"
                  >
                    ðŸ‘ï¸ Trang Xem & In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

