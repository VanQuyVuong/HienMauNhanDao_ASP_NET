import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/KhamLamSang.css"; // TÃ¡i sá»­ dá»¥ng CSS cá»§a KhÃ¡m LÃ¢m SÃ ng hoáº·c style riÃªng

export default function DanhSachChoKham() {
  const navigate = useNavigate();
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadChoKham = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/khamlamsang/cho-kham", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDanhSach(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Lá»—i khi táº£i danh sÃ¡ch chá» khÃ¡m:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChoKham();
  }, []);

  const handleKham = (maDon) => {
    // Chuyá»ƒn hÆ°á»›ng sang trang khÃ¡m lÃ¢m sÃ ng vÃ  truyá»n maDon qua state
    navigate("/admin-kham-lam-sang", { state: { maDon } });
  };

  const filteredList = danhSach.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.maDon.toLowerCase().includes(term) ||
      item.tenTinhNguyenVien.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <Navbar />
      <div className="kls-container">
        <div className="kls-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="kls-title" style={{ color: "#d90429" }}>DANH SÃCH TNV CHá»œ KHÃM LÃ‚M SÃ€NG</h1>
            <p className="kls-subtitle">Hiá»ƒn thá»‹ cÃ¡c tÃ¬nh nguyá»‡n viÃªn Ä‘Ã£ Ä‘Äƒng kÃ½, Ä‘Ã£ khai bÃ¡o y táº¿ vÃ  Ä‘ang chá» khÃ¡m</p>
          </div>
          <button 
            onClick={loadChoKham} 
            className="btn-checkin" 
            style={{ backgroundColor: "#22c55e" }}
          >
            Táº£i Láº¡i Danh SÃ¡ch
          </button>
        </div>

        {/* Thanh tÃ¬m kiáº¿m */}
        <div className="kls-card" style={{ marginBottom: "20px", padding: "15px" }}>
          <div className="checkin-search-box" style={{ margin: 0 }}>
            <input
              type="text"
              placeholder="TÃ¬m kiáº¿m theo mÃ£ Ä‘Æ¡n hoáº·c há» tÃªn tÃ¬nh nguyá»‡n viÃªn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="checkin-input"
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>

        {/* Báº£ng danh sÃ¡ch chá» */}
        <div className="kls-card">
          {loading ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Äang táº£i danh sÃ¡ch chá» khÃ¡m...</p>
          ) : filteredList.length === 0 ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>KhÃ´ng cÃ³ tÃ¬nh nguyá»‡n viÃªn nÃ o trong danh sÃ¡ch chá» khÃ¡m.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 8px", color: "#64748b" }}>MÃ£ ÄÆ¡n</th>
                  <th style={{ padding: "12px 8px", color: "#64748b" }}>Há» TÃªn</th>
                  <th style={{ padding: "12px 8px", color: "#64748b" }}>NgÃ y Sinh</th>
                  <th style={{ padding: "12px 8px", color: "#64748b" }}>Giá»›i TÃ­nh</th>
                  <th style={{ padding: "12px 8px", color: "#64748b" }}>NhÃ³m MÃ¡u dá»± kiáº¿n</th>
                  <th style={{ padding: "12px 8px", color: "#64748b", textAlign: "center" }}>HÃ nh Äá»™ng</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item.maDon} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 8px", fontWeight: "bold", fontFamily: "monospace", color: "#0f172a" }}>
                      {item.maDon}
                    </td>
                    <td style={{ padding: "12px 8px", color: "#0f172a", fontWeight: 500 }}>
                      {item.tenTinhNguyenVien}
                    </td>
                    <td style={{ padding: "12px 8px", color: "#475569" }}>
                      {item.ngaySinh}
                    </td>
                    <td style={{ padding: "12px 8px", color: "#475569" }}>
                      {item.gioiTinh}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ 
                        backgroundColor: "#f1f5f9", 
                        padding: "4px 8px", 
                        borderRadius: "4px",
                        fontWeight: "bold",
                        color: "#0f172a"
                      }}>
                        {item.nhomMau}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleKham(item.maDon)}
                        className="btn-checkin"
                        style={{ backgroundColor: "#d90429", padding: "6px 14px", borderRadius: "6px" }}
                      >
                        KhÃ¡m SÃ ng Lá»c
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

