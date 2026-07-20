import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../css/AdminKhaiBaoYTe.css";

export default function KhaiBaoYTeNVYT() {
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://localhost:7004/api/hososuckhoe/tat-ca", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setDanhSach(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Lá»—i táº£i danh sÃ¡ch há»“ sÆ¡:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // HÃ m hiá»ƒn thá»‹ giÃ¡ trá»‹ CÃ³/KhÃ´ng tá»« boolean
  const YN = (val) =>
    val ? (
      <span className="badge-yn badge-yn-yes">CÃ³</span>
    ) : (
      <span className="badge-yn badge-yn-no">KhÃ´ng</span>
    );

  const filtered = danhSach.filter((hs) => {
    const keyword = search.toLowerCase();
    return (
      hs.maHoSo?.toLowerCase().includes(keyword) ||
      hs.maDon?.toLowerCase().includes(keyword) ||
      hs.donDangKy?.tinhNguyenVien?.hoTen?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="kbt-container">
        <div className="kbt-header">
          <div>
            <h1 className="kbt-title">ðŸ“‹ Danh sÃ¡ch Há»“ SÆ¡ Khai BÃ¡o Y Táº¿</h1>
            <p className="kbt-subtitle">
              Theo dÃµi toÃ n bá»™ phiáº¿u sá»©c khá»e do TÃ¬nh nguyá»‡n viÃªn khai bÃ¡o
            </p>
          </div>
          <div className="kbt-stats">
            <div className="kbt-stat-card">
              <div className="kbt-stat-number">{danhSach.length}</div>
              <div className="kbt-stat-label">Tá»•ng há»“ sÆ¡</div>
            </div>
            <div className="kbt-stat-card kbt-stat-risk">
              <div className="kbt-stat-number">
                {
                  danhSach.filter(
                    (h) =>
                      h.dauHong || h.khangSinh || h.truyenNhiem || h.coThai,
                  ).length
                }
              </div>
              <div className="kbt-stat-label">Cáº§n chÃº Ã½</div>
            </div>
          </div>
        </div>

        <div className="kbt-search-row">
          <input
            type="text"
            placeholder="ðŸ” TÃ¬m theo MÃ£ há»“ sÆ¡, MÃ£ Ä‘Æ¡n, TÃªn TNV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="kbt-search-input"
          />
          <button onClick={loadData} className="btn-reload">
            ðŸ”„ Táº£i láº¡i
          </button>
        </div>

        {loading ? (
          <div className="kbt-loading">Äang táº£i dá»¯ liá»‡u...</div>
        ) : (
          <div className="kbt-table-wrapper">
            <table className="kbt-table">
              <thead>
                <tr>
                  <th>MÃ£ Há»“ SÆ¡</th>
                  <th>MÃ£ ÄÆ¡n</th>
                  <th>TÃ¬nh nguyá»‡n viÃªn</th>
                  <th>Sá»‘t/Äau há»ng</th>
                  <th>KhÃ¡ng sinh</th>
                  <th>Truyá»n nhiá»…m</th>
                  <th>Thai sáº£n</th>
                  <th>MÃ´ táº£ khÃ¡c</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#94a3b8",
                      }}
                    >
                      KhÃ´ng cÃ³ dá»¯ liá»‡u nÃ o
                    </td>
                  </tr>
                ) : (
                  filtered.map((hs) => (
                    <tr
                      key={hs.maHoSo}
                      className={
                        hs.dauHong ||
                        hs.khangSinh ||
                        hs.truyenNhiem ||
                        hs.coThai
                          ? "row-risk"
                          : ""
                      }
                    >
                      <td>
                        <strong className="text-primary">{hs.maHoSo}</strong>
                      </td>
                      <td className="font-mono">{hs.maDon}</td>
                      <td>{hs.donDangKy?.tinhNguyenVien?.hoTen || "N/A"}</td>
                      <td>{YN(hs.dauHong)}</td>
                      <td>{YN(hs.khangSinh)}</td>
                      <td>{YN(hs.truyenNhiem)}</td>
                      <td>{YN(hs.coThai)}</td>
                      <td className="col-motakhac">{hs.moTaKhac || "---"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

