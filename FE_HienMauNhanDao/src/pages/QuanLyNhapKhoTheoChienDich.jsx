import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function QuanLyNhapKhoTheoChienDich() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [bloodUnits, setBloodUnits] = useState({}); // Lưu trữ dạng: { maChienDich: [danh sách túi] }
  const [loadingUnits, setLoadingUnits] = useState({}); // Trạng thái tải cho từng chiến dịch

  // Tải danh sách chiến dịch hiến máu
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
      console.error("Lỗi tải danh sách chiến dịch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Tải danh sách túi máu của 1 chiến dịch cụ thể
  const fetchBloodUnits = async (campaignId) => {
    if (bloodUnits[campaignId]) return; // Nếu đã tải rồi thì không tải lại nữa

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
      console.error(`Lỗi tải túi máu cho chiến dịch ${campaignId}:`, err);
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

  // Hàm xuất file CSV báo cáo cho chiến dịch
  const handleExportCampaignReport = (camp) => {
    const units = bloodUnits[camp.maChienDich] || [];
    if (units.length === 0) {
      alert("⚠️ Không có dữ liệu túi máu nào để xuất báo cáo.");
      return;
    }

    // Thiết lập nội dung CSV kèm mã BOM \uFEFF để Excel hiển thị đúng tiếng Việt có dấu
    let csvContent = "\uFEFF";
    csvContent += `BÁO CÁO NHẬP KHO CHIẾN DỊCH: ${camp.tenChienDich.toUpperCase()}\n`;
    csvContent += `Mã chiến dịch: ${camp.maChienDich}\n`;
    csvContent += `Địa điểm: ${camp.diaDiem?.tenDiaDiem || camp.tenDiaDiem || "N/A"}\n`;
    csvContent += `Thời gian: ${new Date(camp.thoiGianBD).toLocaleDateString("vi-VN")} - ${new Date(camp.thoiGianKT).toLocaleDateString("vi-VN")}\n\n`;
    csvContent += "STT,Mã túi máu,Nhóm máu,Thể tích,Ngày lấy mẫu,Trạng thái\n";

    units.forEach((u, i) => {
      const dateStr = u.ngayThuNhan
        ? new Date(u.ngayThuNhan).toLocaleDateString("vi-VN")
        : "—";
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
            📊 Nhập Kho Theo Chiến Dịch
          </h2>
          <p
            style={{ color: "#6c757d", margin: "5px 0 0 0", fontSize: "14px" }}
          >
            Thống kê và xuất báo cáo danh sách túi máu đã nhập kho phân loại
            theo từng sự kiện.
          </p>
        </div>

        {/* Danh sách chiến dịch */}
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}
          >
            Đang tải danh sách chiến dịch...
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
            Chưa có chiến dịch nào được ghi nhận.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {campaigns.map((camp) => {
              const isExpanded = expandedId === camp.maChienDich;
              const units = bloodUnits[camp.maChienDich] || [];
              const isFinished = camp.trangThai === "Đã kết thúc";

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
                  {/* Tiêu đề dòng chiến dịch */}
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
                        📅
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
                            ⏱️{" "}
                            {new Date(camp.thoiGianBD).toLocaleDateString(
                              "vi-VN",
                            )}{" "}
                            -{" "}
                            {new Date(camp.thoiGianKT).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                          <span>
                            📍 {camp.tenDiaDiem || camp.maDiaDiem || "N/A"}
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
                              (isFinished ? "Đã kết thúc" : "Đang diễn ra")}
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
                          MÃ SỰ KIỆN
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
                      <span>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Nội dung chi tiết các túi máu */}
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
                          Đang tải danh sách túi máu...
                        </div>
                      ) : units.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#868e96",
                            fontSize: "13px",
                          }}
                        >
                          Chưa có túi máu nào được nhập kho cho chiến dịch này.
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
                                    Mã túi máu
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Nhóm máu
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Thể tích
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Ngày lấy mẫu
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Nhiệt độ VC
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 15px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Trạng thái
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
                                        ? `${unit.nhietDoVanChuyen}°C`
                                        : "—"}
                                    </td>
                                    <td style={{ padding: "10px 15px" }}>
                                      <span
                                        style={{
                                          padding: "3px 6px",
                                          borderRadius: "4px",
                                          fontSize: "11px",
                                          fontWeight: "bold",
                                          backgroundColor:
                                            unit.trangThai === "Nhập kho"
                                              ? "#d0ebff"
                                              : "#ffe3e3",
                                          color:
                                            unit.trangThai === "Nhập kho"
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
                              Tổng cộng: {units.length} đơn vị máu
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
                              📥 Xuất báo cáo CSV
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
