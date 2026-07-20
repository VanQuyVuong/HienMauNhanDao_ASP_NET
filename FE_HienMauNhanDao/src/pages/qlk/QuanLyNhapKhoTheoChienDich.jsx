import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

export default function QuanLyNhapKhoTheoChienDich() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [bloodUnits, setBloodUnits] = useState({}); // LÆ°u trá»¯ dáº¡ng: { maChienDich: [danh sÃ¡ch tÃºi] }
  const [loadingUnits, setLoadingUnits] = useState({}); // Tráº¡ng thÃ¡i táº£i cho tá»«ng chiáº¿n dá»‹ch

  // Táº£i danh sÃ¡ch chiáº¿n dá»‹ch hiáº¿n mÃ¡u
  const fetchCampaigns = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await fetch("https://localhost:7004/api/chiendich", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(data.data || []);
      }
    } catch (err) {
      console.error("Lá»—i táº£i danh sÃ¡ch chiáº¿n dá»‹ch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Táº£i danh sÃ¡ch tÃºi mÃ¡u cá»§a 1 chiáº¿n dá»‹ch cá»¥ thá»ƒ
  const fetchBloodUnits = async (campaignId) => {
    if (bloodUnits[campaignId]) return; // Náº¿u Ä‘Ã£ táº£i rá»“i thÃ¬ khÃ´ng táº£i láº¡i ná»¯a

    const token = localStorage.getItem("token");
    try {
      setLoadingUnits((prev) => ({ ...prev, [campaignId]: true }));
      const res = await fetch(
        `https://localhost:7004/api/tuimau/blood-units?maChienDich=${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setBloodUnits((prev) => ({
          ...prev,
          [campaignId]: data.content || [],
        }));
      }
    } catch (err) {
      console.error(`Lá»—i táº£i tÃºi mÃ¡u cho chiáº¿n dá»‹ch ${campaignId}:`, err);
    } finally {
      setLoadingUnits((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchBloodUnits(id);
    }
  };

  // HÃ m xuáº¥t file CSV bÃ¡o cÃ¡o cho chiáº¿n dá»‹ch
  const handleExportCampaignReport = (camp) => {
    const units = bloodUnits[camp.maChienDich] || [];
    if (units.length === 0) {
      alert("âš ï¸ KhÃ´ng cÃ³ dá»¯ liá»‡u tÃºi mÃ¡u nÃ o Ä‘á»ƒ xuáº¥t bÃ¡o cÃ¡o.");
      return;
    }

    // Thiáº¿t láº­p ná»™i dung CSV kÃ¨m mÃ£ BOM \uFEFF Ä‘á»ƒ Excel hiá»ƒn thá»‹ Ä‘Ãºng tiáº¿ng Viá»‡t cÃ³ dáº¥u
    let csvContent = "\uFEFF";
    csvContent += `BÃO CÃO NHáº¬P KHO CHIáº¾N Dá»ŠCH: ${camp.tenChienDich.toUpperCase()}\n`;
    csvContent += `MÃ£ chiáº¿n dá»‹ch: ${camp.maChienDich}\n`;
    csvContent += `Äá»‹a Ä‘iá»ƒm: ${camp.diaDiem?.tenDiaDiem || camp.tenDiaDiem || "N/A"}\n`;
    csvContent += `Thá»i gian: ${new Date(camp.thoiGianBD).toLocaleDateString("vi-VN")} - ${new Date(camp.thoiGianKT).toLocaleDateString("vi-VN")}\n\n`;
    csvContent += "STT,MÃ£ tÃºi mÃ¡u,NhÃ³m mÃ¡u,Thá»ƒ tÃ­ch,NgÃ y láº¥y máº«u,Tráº¡ng thÃ¡i\n";

    units.forEach((u, i) => {
      const dateStr = u.ngayThuNhan
        ? new Date(u.ngayThuNhan).toLocaleDateString("vi-VN")
        : "â€”";
      csvContent += `${i + 1},${u.maTuiMau},${u.nhomMau},${u.theTich}ml,${dateStr},${u.trangThai}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `BaoCao_ChienDich_${camp.maChienDich}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              color: "#af101a",
              fontWeight: "900",
              fontSize: "28px",
              margin: 0,
            }}
          >
            ðŸ“Š Nháº­p Kho Theo Chiáº¿n Dá»‹ch
          </h2>
          <p
            style={{ color: "#6c757d", margin: "5px 0 0 0", fontSize: "14px" }}
          >
            Thá»‘ng kÃª vÃ  xuáº¥t bÃ¡o cÃ¡o danh sÃ¡ch tÃºi mÃ¡u Ä‘Ã£ nháº­p kho phÃ¢n loáº¡i
            theo tá»«ng sá»± kiá»‡n.
          </p>
        </div>

        {/* Danh sÃ¡ch chiáº¿n dá»‹ch */}
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}
          >
            Äang táº£i danh sÃ¡ch chiáº¿n dá»‹ch...
          </div>
        ) : campaigns.length === 0 ? (
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px dashed #ccc",
              borderRadius: "12px",
              padding: "50px",
              textAlign: "center",
              color: "#6c757d",
            }}
          >
            ChÆ°a cÃ³ chiáº¿n dá»‹ch nÃ o Ä‘Æ°á»£c ghi nháº­n.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {campaigns.map((camp) => {
              const isExpanded = expandedId === camp.maChienDich;
              const units = bloodUnits[camp.maChienDich] || [];
              const isFinished = camp.trangThai === "ÄÃ£ káº¿t thÃºc";

              return (
                <div
                  key={camp.maChienDich}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid " + (isExpanded ? "#af101a" : "#dee2e6"),
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* TiÃªu Ä‘á» dÃ²ng chiáº¿n dá»‹ch */}
                  <div
                    onClick={() => toggleExpand(camp.maChienDich)}
                    style={{
                      padding: "20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      flexWrap: "wrap",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "10px",
                          backgroundColor: isExpanded ? "#af101a" : "#ffe3e3",
                          color: isExpanded ? "#fff" : "#af101a",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "24px",
                        }}
                      >
                        ðŸ“…
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          {camp.tenChienDich}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            flexWrap: "wrap",
                            marginTop: "5px",
                            fontSize: "12px",
                            color: "#6c757d",
                          }}
                        >
                          <span>
                            â±ï¸{" "}
                            {new Date(camp.thoiGianBD).toLocaleDateString(
                              "vi-VN",
                            )}{" "}
                            -{" "}
                            {new Date(camp.thoiGianKT).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                          <span>
                            ðŸ“ {camp.tenDiaDiem || camp.maDiaDiem || "N/A"}
                          </span>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: "bold",
                              backgroundColor: isFinished
                                ? "#e9ecef"
                                : "#d3f9d8",
                              color: isFinished ? "#495057" : "#2b8a3e",
                            }}
                          >
                            {camp.trangThai ||
                              (isFinished ? "ÄÃ£ káº¿t thÃºc" : "Äang diá»…n ra")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#adb5bd",
                            fontWeight: "bold",
                          }}
                        >
                          MÃƒ Sá»° KIá»†N
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#495057",
                          }}
                        >
                          {camp.maChienDich}
                        </div>
                      </div>
                      <span>{isExpanded ? "â–²" : "â–¼"}</span>
                    </div>
                  </div>

                  {/* Ná»™i dung chi tiáº¿t cÃ¡c tÃºi mÃ¡u */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: "1px solid #dee2e6",
                        backgroundColor: "#f8f9fa",
                        padding: "20px",
                      }}
                    >
                      {loadingUnits[camp.maChienDich] ? (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#6c757d",
                            fontSize: "12px",
                          }}
                        >
                          Äang táº£i danh sÃ¡ch tÃºi mÃ¡u...
                        </div>
                      ) : units.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#868e96",
                            fontSize: "13px",
                          }}
                        >
                          ChÆ°a cÃ³ tÃºi mÃ¡u nÃ o Ä‘Æ°á»£c nháº­p kho cho chiáº¿n dá»‹ch nÃ y.
                        </div>
                      ) : (
                        <div>
                          <div
                            style={{
                              overflowX: "auto",
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                textAlign: "left",
                                fontSize: "13px",
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    backgroundColor: "#f1f3f5",
                                    borderBottom: "1px solid #dee2e6",
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    MÃ£ tÃºi mÃ¡u
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    NhÃ³m mÃ¡u
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Thá»ƒ tÃ­ch
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    NgÃ y láº¥y máº«u
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Nhiá»‡t Ä‘á»™ VC
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Tráº¡ng thÃ¡i
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {units.map((unit) => (
                                  <tr
                                    key={unit.maTuiMau}
                                    style={{ borderBottom: "1px solid #eee" }}
                                  >
                                    <td
                                      style={{
                                        padding: "10px 15px",
                                        fontFamily: "monospace",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {unit.maTuiMau}
                                    </td>
                                    <td style={{ padding: "10px 15px" }}>
                                      <span
                                        style={{
                                          padding: "2px 6px",
                                          borderRadius: "10px",
                                          fontSize: "11px",
                                          fontWeight: "bold",
                                          backgroundColor: "#ffe3e3",
                                          color: "#af101a",
                                        }}
                                      >
                                        {unit.nhomMau}
                                      </span>
                                    </td>
                                    <td
                                      style={{
                                        padding: "10px 15px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {unit.theTich}ml
                                    </td>
                                    <td
                                      style={{
                                        padding: "10px 15px",
                                        color: "#6c757d",
                                      }}
                                    >
                                      {unit.thoiGianLayMau
                                        ? new Date(
                                            unit.thoiGianLayMau,
                                          ).toLocaleDateString("vi-VN")
                                        : "N/A"}
                                    </td>
                                    <td
                                      style={{
                                        padding: "10px 15px",
                                        color: "#6c757d",
                                      }}
                                    >
                                      {unit.nhietDoVanChuyen != null
                                        ? `${unit.nhietDoVanChuyen}Â°C`
                                        : "â€”"}
                                    </td>
                                    <td style={{ padding: "10px 15px" }}>
                                      <span
                                        style={{
                                          padding: "3px 6px",
                                          borderRadius: "4px",
                                          fontSize: "11px",
                                          fontWeight: "bold",
                                          backgroundColor:
                                            unit.trangThai === "Nháº­p kho"
                                              ? "#d0ebff"
                                              : "#ffe3e3",
                                          color:
                                            unit.trangThai === "Nháº­p kho"
                                              ? "#1971c2"
                                              : "#af101a",
                                        }}
                                      >
                                        {unit.trangThai}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "15px",
                            }}
                          >
                            <span
                              style={{ fontSize: "12px", color: "#6c757d" }}
                            >
                              Tá»•ng cá»™ng: {units.length} Ä‘Æ¡n vá»‹ mÃ¡u
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportCampaignReport(camp);
                              }}
                              style={{
                                backgroundColor: "transparent",
                                border: "1px solid #af101a",
                                color: "#af101a",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              ðŸ“¥ Xuáº¥t bÃ¡o cÃ¡o CSV
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

