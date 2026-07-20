import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

export default function NhanYeuCauNhapKho() {
  const [khoList, setKhoList] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingKho, setLoadingKho] = useState(false);
  const [selectedKho, setSelectedKho] = useState(null);
  const [selectedTuiMau, setSelectedTuiMau] = useState(null);

  const fetchKhoMau = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoadingKho(true);
      const res = await fetch("https://localhost:7004/api/khomau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKhoList(data.data || []);
        if (data.data && data.data.length > 0 && !selectedKho) {
          setSelectedKho(data.data[0]);
        }
      }
    } catch (err) {
      console.error("Lá»—i táº£i danh sÃ¡ch kho:", err);
    } finally {
      setLoadingKho(false);
    }
  };

  const fetchBloodUnits = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await fetch("https://localhost:7004/api/tuimau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBloodUnits(data || []);
      }
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

  useEffect(() => {
    if (selectedKho && khoList.length > 0) {
      const updated = khoList.find((k) => k.maKho === selectedKho.maKho);
      if (updated) setSelectedKho(updated);
    }
  }, [khoList]);

  const handleChapNhan = async (e, tm) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    try {
      let maNhanVien = localStorage.getItem("maNV");
      if (!maNhanVien || maNhanVien === "null" || maNhanVien === "undefined") {
        maNhanVien = "NV00012"; // Fallback
      }

      const response = await fetch(
        "https://localhost:7004/api/phieunhapxuat/import",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            maNhanVien: maNhanVien,
            maTuiMauList: [tm.maTuiMau],
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        alert(`âœ… ÄÃ£ nháº­p kho thÃ nh cÃ´ng tÃºi mÃ¡u ${tm.maTuiMau}`);
        fetchData();
        setSelectedTuiMau(null);
      } else {
        alert("âŒ Lá»—i: " + data.message);
      }
    } catch (err) {
      alert("âŒ CÃ³ lá»—i xáº£y ra khi nháº­p kho.");
    }
  };

  const handleTuChoi = async (e, tm) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Báº¡n cÃ³ cháº¯c muá»‘n tráº£ tÃºi mÃ¡u ${tm.maTuiMau} vá» cho bá»™ pháº­n xÃ©t nghiá»‡m kiá»ƒm tra láº¡i?`,
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://localhost:7004/api/tuimau/${tm.maTuiMau}/status?status=Chá» xÃ©t nghiá»‡m`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert(`âœ… ÄÃ£ tráº£ tÃºi mÃ¡u ${tm.maTuiMau} vá» bá»™ pháº­n xÃ©t nghiá»‡m.`);
        fetchBloodUnits();
        setSelectedTuiMau(null);
      } else {
        alert("âŒ Lá»—i: " + data.message);
      }
    } catch (err) {
      alert("âŒ CÃ³ lá»—i xáº£y ra khi tráº£ tÃºi mÃ¡u.");
    }
  };

  const countYeuCau = (nhomMau) => {
    return bloodUnits.filter(
      (tm) =>
        (tm.nhomMau === nhomMau || tm.nhomMau?.replace("+", "") === nhomMau) &&
        tm.trangThai === "YÃªu cáº§u nháº­p kho",
    ).length;
  };

  const matchesNhomMau = (bloodType, targetKhoNhomMau) => {
    if (!bloodType || !targetKhoNhomMau) return false;
    const cleanBlood = bloodType.replace("+", "").replace("-", "").trim();
    const cleanKho = targetKhoNhomMau.replace("+", "").replace("-", "").trim();
    return cleanBlood === cleanKho;
  };

  const yeuCauList = bloodUnits.filter(
    (tm) =>
      matchesNhomMau(tm.nhomMau, selectedKho?.nhomMauString) &&
      tm.trangThai === "YÃªu cáº§u nháº­p kho",
  );
  const daNhapList = bloodUnits.filter(
    (tm) =>
      matchesNhomMau(tm.nhomMau, selectedKho?.nhomMauString) &&
      tm.trangThai === "Nháº­p kho",
  );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              color: "#af101a",
              fontWeight: "900",
              fontSize: "28px",
              margin: 0,
            }}
          >
            ðŸ“¦ Nháº­n YÃªu Cáº§u Nháº­p Kho
          </h2>
          <p
            style={{ color: "#6c757d", margin: "5px 0 0 0", fontSize: "14px" }}
          >
            Duyá»‡t cÃ¡c tÃºi mÃ¡u Ä‘áº¡t chuáº©n xÃ©t nghiá»‡m vÃ o kho hoáº·c gá»­i yÃªu cáº§u xÃ©t
            nghiá»‡m láº¡i.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff5f5",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            marginBottom: "30px",
            border: "1px solid #ffe3e3",
          }}
        >
          <h4
            style={{
              color: "#c92a2a",
              margin: "0 0 15px 0",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ðŸª DANH SÃCH KHO MÃU (CHá»ŒN Äá»‚ XEM CHI TIáº¾T)
          </h4>
          {loadingKho ? (
            <div style={{ color: "#c92a2a", fontSize: "12px" }}>
              Äang táº£i danh sÃ¡ch kho...
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {khoList.map((kho) => {
                const isActive = selectedKho?.maKho === kho.maKho;
                const yeuCauCount = countYeuCau(kho.nhomMauString);
                return (
                  <button
                    key={kho.maKho}
                    onClick={() => setSelectedKho(kho)}
                    style={{
                      backgroundColor: isActive ? "#ffe3e3" : "#fff",
                      border: "2px solid " + (isActive ? "#af101a" : "#dee2e6"),
                      borderRadius: "10px",
                      padding: "12px 15px",
                      textAlign: "left",
                      cursor: "pointer",
                      minWidth: "120px",
                      position: "relative",
                    }}
                  >
                    {yeuCauCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          backgroundColor: "#1c7ed6",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: "bold",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {yeuCauCount}
                      </span>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#af101a",
                      }}
                    >
                      <span>{kho.nhomMauString}</span>
                      <span style={{ fontSize: "10px", color: "#868e96" }}>
                        {kho.maKho}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#495057",
                        margin: "5px 0",
                      }}
                    >
                      Tá»“n kho
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "900",
                        color: "#212529",
                      }}
                    >
                      {kho.soLuongTon} tÃºi
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedKho && (
          <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: "300px",
                backgroundColor: "#ebfbee",
                border: "1px solid #b2f2bb",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  borderBottom: "1px solid #b2f2bb",
                  paddingBottom: "10px",
                }}
              >
                <h3 style={{ color: "#2b8b57", margin: 0, fontWeight: "bold" }}>
                  ðŸ“¥ YÃªu cáº§u nháº­p (NhÃ³m {selectedKho.nhomMauString})
                </h3>
                <span
                  style={{
                    backgroundColor: "#2b8b57",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  Chá» duyá»‡t ({yeuCauList.length})
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {loading ? (
                  <div style={{ color: "#2b8b57", fontSize: "14px" }}>
                    Äang táº£i...
                  </div>
                ) : yeuCauList.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.6)",
                      padding: "20px",
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#5c940e",
                    }}
                  >
                    KhÃ´ng cÃ³ yÃªu cáº§u.
                  </div>
                ) : (
                  yeuCauList.map((tm) => {
                    const isExpanded = selectedTuiMau?.maTuiMau === tm.maTuiMau;
                    return (
                      <div
                        key={tm.maTuiMau}
                        onClick={() =>
                          setSelectedTuiMau(isExpanded ? null : tm)
                        }
                        style={{
                          backgroundColor: "#fff",
                          padding: "15px",
                          borderRadius: "10px",
                          border: "1px solid #dee2e6",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{ fontWeight: "bold", fontSize: "15px" }}
                            >
                              {tm.maTuiMau}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "3px",
                              }}
                            >
                              TNV: {tm.tenTinhNguyenVien} â€¢ {tm.theTich}ml
                            </div>
                          </div>
                          <span>{isExpanded ? "â–²" : "â–¼"}</span>
                        </div>
                        {isExpanded && (
                          <div
                            style={{
                              marginTop: "15px",
                              paddingTop: "15px",
                              borderTop: "1px solid #eee",
                              display: "flex",
                              gap: "10px",
                            }}
                          >
                            <button
                              onClick={(e) => handleTuChoi(e, tm)}
                              style={{
                                flex: 1,
                                padding: "8px",
                                border: "1px solid #c92a2a",
                                color: "#c92a2a",
                                backgroundColor: "#fff",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Tráº£ vá» xÃ©t nghiá»‡m
                            </button>
                            <button
                              onClick={(e) => handleChapNhan(e, tm)}
                              style={{
                                flex: 1,
                                padding: "8px",
                                border: "none",
                                color: "#fff",
                                backgroundColor: "#0ca678",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Duyá»‡t nháº­p kho
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                minWidth: "300px",
                backgroundColor: "#e7f5ff",
                border: "1px solid #a5d8ff",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  borderBottom: "1px solid #a5d8ff",
                  paddingBottom: "10px",
                }}
              >
                <h3 style={{ color: "#1971c2", margin: 0, fontWeight: "bold" }}>
                  ðŸ›ï¸ ÄÃ£ nháº­p kho (NhÃ³m {selectedKho.nhomMauString})
                </h3>
                <span
                  style={{
                    backgroundColor: "#1971c2",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  Tá»•ng ({daNhapList.length})
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {daNhapList.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.6)",
                      padding: "20px",
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#1971c2",
                    }}
                  >
                    ChÆ°a cÃ³ tÃºi mÃ¡u.
                  </div>
                ) : (
                  daNhapList.map((tm) => (
                    <div
                      key={tm.maTuiMau}
                      style={{
                        backgroundColor: "#fff",
                        padding: "12px 15px",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                          {tm.maTuiMau}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#868e96",
                            marginTop: "2px",
                          }}
                        >
                          TÃªn: {tm.tenTinhNguyenVien} â€¢ {tm.theTich}ml
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#d0ebff",
                          color: "#1971c2",
                          fontWeight: "bold",
                          fontSize: "10px",
                        }}
                      >
                        ÄÃ£ nháº­p kho
                      </span>
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

