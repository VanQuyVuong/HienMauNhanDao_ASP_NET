import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/MyDonations.css";

export default function DanhSachDonDangKy() {
  const [lichSu, setLichSu] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://localhost:7004/api/dondangky", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLichSu(data.data);
      })
      .catch((err) => console.error("Lá»—i táº£i lá»‹ch sá»­:", err));
  }, []);

  // HÃ€M HELPER REFACTOR: TÃ¡ch logic map Class tráº¡ng thÃ¡i
  const getBadgeClass = (trangThai) => {
    switch (trangThai) {
      case "ChoDuyet":
        return "cho-duyet";
      case "DaDuyet":
        return "da-duyet";
      case "DaHoanThanh":
        return "da-hoan-thanh";
      case "DaTuChoi":
        return "da-tu-choi";
      default:
        return "";
    }
  };

  // HÃ€M HELPER REFACTOR: TÃ¡ch logic dá»‹ch chá»¯ tráº¡ng thÃ¡i
  const getTrangThaiText = (trangThai) => {
    switch (trangThai) {
      case "ChoDuyet":
        return "Chá» duyá»‡t";
      case "DaDuyet":
        return "ÄÃ£ duyá»‡t";
      case "DaHoanThanh":
        return "ÄÃ£ hoÃ n thÃ nh";
      case "DaTuChoi":
        return "Bá»‹ tá»« chá»‘i";
      default:
        return trangThai;
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="history-container">
        <h2 className="history-title">ðŸ©¸ Lá»‹ch sá»­ Ä‘Äƒng kÃ½ cá»§a tÃ´i</h2>

        <table className="history-table">
          <thead>
            <tr>
              <th>MÃ£ ÄÆ¡n</th>
              <th>Chiáº¿n Dá»‹ch</th>
              <th>Thá»i gian ná»™p</th>
              <th>Thá»ƒ tÃ­ch</th>
              <th>Tráº¡ng thÃ¡i</th>
              <th>Chá»©ng nháº­n</th>
            </tr>
          </thead>
          <tbody>
            {lichSu.map((don, index) => (
              <tr key={index}>
                <td>
                  <strong>{don.maDon}</strong>
                </td>
                <td>
                  {don.chienDich ? don.chienDich.tenChienDich : "Äang cáº­p nháº­t"}
                </td>
                <td>{new Date(don.thoiGianDangKy).toLocaleString("vi-VN")}</td>
                <td>{don.theTich} ml</td>

                {/* ÃP Dá»¤NG HÃ€M HELPER REFACTOR: TrÃ´ng gá»n gÃ ng hÆ¡n ráº¥t nhiá»u */}
                <td>
                  <span
                    className={`status-badge ${getBadgeClass(don.trangThai)}`}
                  >
                    {getTrangThaiText(don.trangThai)}
                  </span>
                </td>

                <td>
                  {don.trangThai === "DaHoanThanh" ? (
                    <button
                      onClick={() => navigate(`/chung-nhan/${don.maDon}`)}
                      className="btn-xem-chungnhan"
                    >
                      ðŸŽ–ï¸ Xem GCN
                    </button>
                  ) : (
                    <span style={{ color: "#aaa" }}>ChÆ°a kháº£ dá»¥ng</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

