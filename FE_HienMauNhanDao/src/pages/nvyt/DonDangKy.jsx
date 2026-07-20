import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../css/MyDonations.css";

export default function DonDangKy() {
  const [danhSach, setDanhSach] = useState([]);

  const fetchDanhSach = () => {
    const token = localStorage.getItem("token");
    fetch("https://localhost:7004/api/dondangky/tat-ca", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDanhSach(data.data);
      });
  };

  useEffect(() => {
    fetchDanhSach();
  }, []);

  const handleDuyet = async (maDon, trangThaiMoi) => {
    if (
      !window.confirm(
        `Báº¡n cÃ³ cháº¯c muá»‘n chuyá»ƒn sang tráº¡ng thÃ¡i: ${trangThaiMoi}?`,
      )
    )
      return;

    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://localhost:7004/api/dondangky/${maDon}/duyet`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trangThaiMoi: trangThaiMoi }),
      },
    );

    const data = await response.json();
    if (data.success) {
      alert("âœ… " + data.message);
      fetchDanhSach();
    } else alert("âŒ Lá»—i: " + data.message);
  };

  // HÃ€M Má»šI: Xá»­ lÃ½ khi báº¥m nÃºt "XÃ¡c nháº­n Láº¥y mÃ¡u"
  const handleXacNhan = async (maDon) => {
    // Hiá»ƒn thá»‹ cá»­a sá»• nhá» (prompt) Ä‘á»ƒ NVYT gÃµ sá»‘ ml mÃ¡u vÃ o
    const theTich = window.prompt(
      "Nháº­p thá»ƒ tÃ­ch mÃ¡u Ä‘Ã£ láº¥y (VÃ­ dá»¥: 250, 350, hoáº·c 450):",
      "350",
    );
    if (!theTich) return; // NVYT báº¥m Cancel thÃ¬ há»§y

    // Báº¯t buá»™c NVYT pháº£i gÃµ Ä‘Ãºng 3 chuáº©n nÃ y
    if (!["250", "350", "450"].includes(theTich)) {
      alert(
        "Thá»ƒ tÃ­ch mÃ¡u khÃ´ng há»£p lá»‡! Vui lÃ²ng nháº­p Ä‘Ãºng sá»‘ 250, 350 hoáº·c 450.",
      );
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://localhost:7004/api/dondangky/${maDon}/xac-nhan`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theTich: parseInt(theTich) }),
      },
    );

    const data = await response.json();
    if (data.success) {
      alert("ðŸ©¸ " + data.message);
      fetchDanhSach(); // Táº£i láº¡i báº£ng Ä‘á»ƒ tháº¥y nÃ³ chuyá»ƒn sang ÄÃ£ HoÃ n ThÃ nh
    } else alert("âŒ Lá»—i: " + data.message);
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="history-container" style={{ maxWidth: "1200px" }}>
        <h2 className="history-title">
          ðŸ›¡ï¸ Quáº£n lÃ½ ÄÆ¡n Ä‘Äƒng kÃ½ (DÃ nh cho NVYT)
        </h2>

        <table className="history-table">
          <thead>
            <tr>
              <th>MÃ£ ÄÆ¡n</th>
              <th>NgÆ°á»i ná»™p</th>
              <th>Chiáº¿n Dá»‹ch</th>
              <th>Thá»ƒ tÃ­ch</th>
              <th>Tráº¡ng thÃ¡i</th>
              <th>HÃ nh Ä‘á»™ng</th>
            </tr>
          </thead>
          <tbody>
            {danhSach.map((don, index) => (
              <tr key={index}>
                <td>
                  <strong>{don.maDon}</strong>
                </td>
                <td>
                  {don.tinhNguyenVien
                    ? don.tinhNguyenVien.hoTen
                    : "ChÆ°a cáº­p nháº­t"}
                </td>
                <td>{don.chienDich ? don.chienDich.tenChienDich : "N/A"}</td>

                {/* Hiá»ƒn thá»‹ sá»‘ ml mÃ¡u náº¿u Ä‘Ã£ hiáº¿n xong */}
                <td>
                  {don.theTich ? (
                    <span style={{ color: "#e63946", fontWeight: "bold" }}>
                      {don.theTich} ml
                    </span>
                  ) : (
                    "---"
                  )}
                </td>

                <td>
                  <span
                    className={`status-badge ${don.trangThai === "ChoDuyet" ? "cho-duyet" : ""}`}
                  >
                    {don.trangThai === "ChoDuyet" ? "Chá» duyá»‡t" : don.trangThai}
                  </span>
                </td>

                <td>
                  {/* Náº¿u Ä‘ang Chá» duyá»‡t thÃ¬ hiá»‡n nÃºt Duyá»‡t / Tá»« chá»‘i */}
                  {don.trangThai === "ChoDuyet" && (
                    <>
                      <button
                        onClick={() => handleDuyet(don.maDon, "DaDuyet")}
                        style={{
                          background: "#2a9d8f",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          marginRight: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Duyá»‡t
                      </button>
                      <button
                        onClick={() => handleDuyet(don.maDon, "DaTuChoi")}
                        style={{
                          background: "#e76f51",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Tá»« chá»‘i
                      </button>
                    </>
                  )}

                  {/* Náº¾U ÄÃƒ DUYá»†T Rá»’I THÃŒ HIá»†N NÃšT Láº¤Y MÃU! */}
                  {don.trangThai === "DaDuyet" && (
                    <button
                      onClick={() => handleXacNhan(don.maDon)}
                      style={{
                        background: "#d90429",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ðŸ©¸ XÃ¡c nháº­n Láº¥y mÃ¡u
                    </button>
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

