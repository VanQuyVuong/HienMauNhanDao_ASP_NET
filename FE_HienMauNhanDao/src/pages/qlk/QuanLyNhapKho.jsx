import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/QuanLyNhapKho.css";

export default function QuanLyNhapKho() {
  const [khoList, setKhoList] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingKho, setLoadingKho] = useState(false);

  const [selectedKho, setSelectedKho] = useState(null);
  const [selectedTuiMau, setSelectedTuiMau] = useState(null);

  // Táº£i danh sÃ¡ch cÃ¡c ngÄƒn kho lÆ°u trá»¯
  const fetchKhoMau = async () => {
    try {
      setLoadingKho(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/khomau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (resData.success && Array.isArray(resData.data)) {
        setKhoList(resData.data);
        if (resData.data.length > 0 && !selectedKho) {
          setSelectedKho(resData.data[0]); // Chá»n ngÄƒn kho Ä‘áº§u tiÃªn máº·c Ä‘á»‹nh
        }
      }
    } catch (err) {
      console.error("Lá»—i táº£i danh sÃ¡ch kho:", err);
    } finally {
      setLoadingKho(false);
    }
  };

  // Táº£i danh sÃ¡ch táº¥t cáº£ cÃ¡c tÃºi mÃ¡u
  const fetchBloodUnits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/tuimau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBloodUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lá»—i táº£i dá»¯ liá»‡u tÃºi mÃ¡u:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    await fetchKhoMau();
    await fetchBloodUnits();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Gá»i API C# duyá»‡t nháº­p kho vÃ  sinh phiáº¿u nháº­p
  const handleChapNhan = async (e, tm) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      let emailNV = localStorage.getItem("email") || "NV00001";

      const payload = {
        maNhanVien: emailNV,
        maTuiMauList: [tm.maTuiMau],
      };

      const res = await fetch(
        "https://localhost:7004/api/phieunhapxuat/import",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        alert(`ÄÃ£ duyá»‡t nháº­p kho thÃ nh cÃ´ng tÃºi mÃ¡u ${tm.maTuiMau}`);
        fetchData(); // Táº£i láº¡i sá»‘ liá»‡u tá»“n kho
        setSelectedTuiMau(null);
      } else {
        alert("Lá»—i khi nháº­p kho!");
      }
    } catch (err) {
      alert("Lá»—i káº¿t ná»‘i mÃ¡y chá»§!");
    }
  };

  // Gá»i API C# tráº£ tÃºi mÃ¡u vá» phÃ²ng xÃ©t nghiá»‡m
  const handleTuChoi = async (e, tm) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Báº¡n cÃ³ cháº¯c muá»‘n tráº£ tÃºi mÃ¡u ${tm.maTuiMau} vá» phÃ²ng xÃ©t nghiá»‡m khÃ´ng?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://localhost:7004/api/tuimau/${tm.maTuiMau}/status?status=Chá» xÃ©t nghiá»‡m`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert(`ÄÃ£ tráº£ tÃºi mÃ¡u ${tm.maTuiMau} vá» Ä‘á»ƒ xÃ©t nghiá»‡m láº¡i.`);
        fetchBloodUnits();
        setSelectedTuiMau(null);
      } else {
        alert("Lá»—i káº¿t ná»‘i mÃ¡y chá»§!");
      }
    } catch (err) {
      alert("CÃ³ lá»—i xáº£y ra khi tráº£ tÃºi tÃºi mÃ¡u.");
    }
  };

  // Äáº¿m sá»‘ lÆ°á»£ng tÃºi Ä‘ang chá» duyá»‡t cá»§a ngÄƒn kho Ä‘Ã³ Ä‘á»ƒ hiá»ƒn thá»‹ cháº¥m trÃ²n bÃ¡o Ä‘á»™ng
  const countYeuCau = (nhomMau) => {
    return bloodUnits.filter(
      (tm) => tm.nhomMau === nhomMau && tm.trangThai === "YÃªu cáº§u nháº­p kho",
    ).length;
  };

  // Lá»c dá»¯ liá»‡u theo ngÄƒn kho Ä‘ang Ä‘Æ°á»£c Thá»§ kho chá»n
  const yeuCauList = bloodUnits.filter(
    (tm) =>
      tm.nhomMau === selectedKho?.nhomMauString &&
      tm.trangThai === "YÃªu cáº§u nháº­p kho",
  );
  const daNhapList = bloodUnits.filter(
    (tm) =>
      tm.nhomMau === selectedKho?.nhomMauString && tm.trangThai === "Nháº­p kho",
  );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="nk-container animate-fadein">
        <div className="nk-header">
          <h1 className="nk-title">ðŸ“¥ Quáº£n lÃ½ Nháº­p kho mÃ¡u</h1>
          <p className="nk-subtitle">
            Thá»§ kho phÃª duyá»‡t cÃ¡c tÃºi mÃ¡u Ä‘áº¡t chuáº©n vÃ  Ä‘Æ°a vÃ o cÃ¡c tá»§ báº£o quáº£n
            láº¡nh.
          </p>
        </div>

        {/* DANH SÃCH CÃC NGÄ‚N Tá»¦ LÆ¯U TRá»® */}
        <div className="nk-warehouse-section">
          <div className="nk-section-title">
            <span>âš™ï¸ DANH SÃCH CÃC NGÄ‚N LÆ¯U TRá»® TRONG KHO</span>
            <small>Chá»n nhÃ³m mÃ¡u Ä‘á»ƒ xem cÃ¡c yÃªu cáº§u nháº­p kho chi tiáº¿t</small>
          </div>

          {loadingKho ? (
            <div className="nk-loading-small">
              Äang táº£i danh sÃ¡ch ngÄƒn kho...
            </div>
          ) : (
            <div className="nk-warehouse-grid">
              {khoList.map((kho) => {
                const isActive = selectedKho?.maKho === kho.maKho;
                const yeuCauCount = countYeuCau(kho.nhomMauString);
                return (
                  <button
                    key={kho.maKho}
                    onClick={() => setSelectedKho(kho)}
                    className={`nk-warehouse-card ${isActive ? "active" : ""}`}
                  >
                    {yeuCauCount > 0 && (
                      <span className="nk-badge-count animate-bounce">
                        {yeuCauCount}
                      </span>
                    )}
                    <div className="nk-card-blood-type">
                      {kho.nhomMauString}
                    </div>
                    <div className="nk-card-name">NgÄƒn {kho.tenKho}</div>
                    <div className="nk-card-stats">
                      <span>Tá»“n kho:</span>
                      <strong>{kho.soLuongTon} tÃºi</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedKho && (
          <div className="nk-layout-split">
            {/* Cá»™t TrÃ¡i: HÃ ng chá» duyá»‡t nháº­p kho */}
            <div className="nk-panel-left">
              <div className="nk-panel-header">
                <h3>ðŸ“¥ YÃªu cáº§u nháº­p (NgÄƒn nhÃ³m {selectedKho.nhomMauString})</h3>
                <span className="nk-badge-status">
                  Chá» duyá»‡t ({yeuCauList.length})
                </span>
              </div>

              <div className="nk-list-wrapper">
                {loading ? (
                  <div className="nk-loading-small">Äang táº£i dá»¯ liá»‡u...</div>
                ) : yeuCauList.length === 0 ? (
                  <div className="nk-empty-box">
                    KhÃ´ng cÃ³ yÃªu cáº§u nháº­p kho nÃ o cho nhÃ³m mÃ¡u nÃ y.
                  </div>
                ) : (
                  yeuCauList.map((tm) => {
                    const isExpanded = selectedTuiMau?.maTuiMau === tm.maTuiMau;
                    return (
                      <div
                        key={tm.maTuiMau}
                        className={`nk-blood-item ${isExpanded ? "expanded" : ""}`}
                        onClick={() =>
                          setSelectedTuiMau(isExpanded ? null : tm)
                        }
                      >
                        <div className="nk-item-top">
                          <div className="nk-item-info">
                            <div className="nk-avatar-blood">{tm.nhomMau}</div>
                            <div>
                              <div className="nk-item-id">{tm.maTuiMau}</div>
                              <div className="nk-item-sub">
                                NgÆ°á»i hiáº¿n: {tm.tenTinhNguyenVien} â€¢{" "}
                                {tm.theTich}ml
                              </div>
                              <div className="nk-item-time">
                                Thá»i gian láº¥y:{" "}
                                {new Date(tm.thoiGianLayMau).toLocaleString(
                                  "vi-VN",
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="nk-arrow-icon">
                            {isExpanded ? "â–²" : "â–¼"}
                          </span>
                        </div>

                        {isExpanded && (
                          <div
                            className="nk-item-options"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleTuChoi(e, tm)}
                              className="nk-btn-reject"
                            >
                              âš ï¸ Tráº£ vá» xÃ©t nghiá»‡m láº¡i
                            </button>
                            <button
                              onClick={(e) => handleChapNhan(e, tm)}
                              className="nk-btn-accept"
                            >
                              âœ… PhÃª duyá»‡t nháº­p kho
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cá»™t Pháº£i: Lá»‹ch sá»­ Ä‘Ã£ nháº­p kho cá»§a nhÃ³m mÃ¡u nÃ y */}
            <div className="nk-panel-right">
              <div className="nk-panel-header blue">
                <h3>
                  ðŸ“¦ TÃºi mÃ¡u Ä‘Ã£ lÆ°u (NgÄƒn nhÃ³m {selectedKho.nhomMauString})
                </h3>
                <span className="nk-badge-status blue">
                  Äang lÆ°u kho ({daNhapList.length})
                </span>
              </div>

              <div className="nk-list-wrapper max-height">
                {daNhapList.length === 0 ? (
                  <div className="nk-empty-box">
                    NgÄƒn kho nÃ y hiá»‡n chÆ°a cÃ³ tÃºi mÃ¡u nÃ o Ä‘Æ°á»£c lÆ°u trá»¯.
                  </div>
                ) : (
                  daNhapList.map((tm) => (
                    <div key={tm.maTuiMau} className="nk-stored-item">
                      <div className="nk-stored-left">
                        <div className="nk-avatar-stored">{tm.nhomMau}</div>
                        <div>
                          <div className="nk-stored-id">{tm.maTuiMau}</div>
                          <div className="nk-stored-sub">
                            {tm.tenTinhNguyenVien} â€¢ {tm.theTich}ml
                          </div>
                        </div>
                      </div>
                      <div className="nk-stored-right">
                        <span className="nk-tag-stored">ÄÃ£ lÆ°u trá»¯</span>
                        <span className="nk-stored-time">
                          {new Date(tm.thoiGianLayMau).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

