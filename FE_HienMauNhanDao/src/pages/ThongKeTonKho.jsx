import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import "../css/ThongKeTonKho.css";

const COLORS = [
  "#af101a",
  "#d32f2f",
  "#ffb3ac",
  "#8f6f6c",
  "#3b82f6",
  "#60a5fa",
  "#10b981",
  "#34d399",
];

export default function ThongKeTonKho() {
  const [stats, setStats] = useState({
    tongTuiMau: 0,
    tongNguoiDung: 0,
    tongChienDich: 0,
    tyLeDatSangLoc: 0,
  });

  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Hàm chuyển đổi tên nhóm máu Enum sang dạng hiển thị thân thiện
  const formatBloodType = (typeStr) => {
    if (!typeStr) return "Chưa rõ";
    return typeStr.replace("_positive", "+").replace("_negative", "-");
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://localhost:7004/api/thongke/tong-quan",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const resJson = await response.json();

      if (response.ok && resJson.success) {
        const d = resJson.data;
        setStats({
          tongTuiMau: d.tongTuiMau || 0,
          tongNguoiDung: d.tongNguoiDung || 0,
          tongChienDich: d.tongChienDich || 0,
          tyLeDatSangLoc: d.tyLeDatSangLoc || 0,
        });

        // 1. Xử lý dữ liệu lượng máu theo 12 tháng (BarChart)
        const monthsData = Array.from({ length: 12 }, (_, i) => ({
          month: `T.${i + 1}`,
          totalUnits: 0,
        }));
        if (d.theoThang && Array.isArray(d.theoThang)) {
          d.theoThang.forEach((item) => {
            const mIndex = item.month - 1;
            if (mIndex >= 0 && mIndex < 12) {
              monthsData[mIndex].totalUnits = item.totalUnits;
            }
          });
        }
        setBarData(monthsData);

        // 2. Xử lý dữ liệu tỷ lệ tồn kho 4 nhóm chính (PieChart)
        const aggregatedPie = {
          "Nhóm O": 0,
          "Nhóm A": 0,
          "Nhóm B": 0,
          "Nhóm AB": 0,
        };
        if (d.theoNhomMau && Array.isArray(d.theoNhomMau)) {
          d.theoNhomMau.forEach((item) => {
            const friendlyName = formatBloodType(item.nhomMau);
            if (friendlyName.startsWith("AB"))
              aggregatedPie["Nhóm AB"] += item.soluongTon;
            else if (friendlyName.startsWith("A"))
              aggregatedPie["Nhóm A"] += item.soluongTon;
            else if (friendlyName.startsWith("B"))
              aggregatedPie["Nhóm B"] += item.soluongTon;
            else if (friendlyName.startsWith("O"))
              aggregatedPie["Nhóm O"] += item.soluongTon;
          });
        }
        const mappedPieData = Object.keys(aggregatedPie)
          .map((key) => ({ name: key, value: aggregatedPie[key] }))
          .filter((item) => item.value > 0);

        setPieData(
          mappedPieData.length > 0
            ? mappedPieData
            : [{ name: "Trống", value: 1 }],
        );

        // 3. Xử lý bảng tổng hợp 8 nhóm máu chi tiết so với ngưỡng an toàn (mặc định 10 đơn vị)
        const NGUONG_AN_TOAN = 10;
        const allBloodTypes = [
          "O+",
          "O-",
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
        ];
        const todayStr = new Date().toLocaleDateString("vi-VN");

        const summaryList = allBloodTypes.map((bt) => {
          const found = d.theoNhomMau?.find(
            (item) => formatBloodType(item.nhomMau) === bt,
          );
          const quantity = found ? found.soluongTon : 0;
          return {
            nhomMau: bt,
            soLuong: quantity,
            nguongAnToan: NGUONG_AN_TOAN,
            trangThai: quantity >= NGUONG_AN_TOAN ? "An toàn" : "Sắp hết",
            ngayCapNhat: todayStr,
          };
        });
        setTableData(summaryList);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Các hàm phụ trợ tạo ô bảng trong file Word
  const makeCell = (text, opts = {}) =>
    new TableCell({
      width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
      shading: opts.shading
        ? { type: ShadingType.CLEAR, fill: opts.shading }
        : undefined,
      children: [
        new Paragraph({
          alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: String(text ?? ""),
              bold: opts.bold || false,
              size: opts.size || 22,
              color: opts.color || "000000",
              font: "Times New Roman",
            }),
          ],
        }),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
    });

  const makeHeaderRow = (cols) =>
    new TableRow({
      children: cols.map((c) =>
        makeCell(c, {
          bold: true,
          shading: "C62828",
          color: "FFFFFF",
          center: true,
          size: 22,
        }),
      ),
      tableHeader: true,
    });

  // Xuất báo cáo Word (.docx) chuẩn mẫu hành chính
  const handleExportWord = async () => {
    const today = new Date().toLocaleDateString("vi-VN");
    const dateStr = new Date().toISOString().slice(0, 10);

    const headerSection = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
            bold: true,
            size: 26,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Độc lập – Tự do – Hạnh phúc",
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "───────────────",
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: "BÁO CÁO TỒN KHO MÁU",
            bold: true,
            size: 32,
            color: "C62828",
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Hệ thống Quản lý Hiến máu Nhân đạo TP. Đà Nẵng",
            size: 26,
            font: "Times New Roman",
            italics: true,
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: `Ngày xuất báo cáo: ${today}`,
            size: 24,
            font: "Times New Roman",
            italics: true,
          }),
        ],
      }),
      new Paragraph({ children: [] }),
    ];

    // Bảng 1: Chỉ số tổng quan
    const tongQuan = [
      new Paragraph({
        children: [
          new TextRun({
            text: "I. CHỈ SỐ TỔNG QUAN KHO MÁU",
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "C62828",
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        rows: [
          makeHeaderRow(["STT", "CHỈ SỐ THỐNG KÊ", "GIÁ TRỊ", "ĐƠN VỊ"]),
          new TableRow({
            children: [
              makeCell("1"),
              makeCell("Tổng đơn vị máu lưu kho thực tế"),
              makeCell(stats.tongTuiMau, { bold: true, center: true }),
              makeCell("túi", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("2"),
              makeCell("Tổng số tình nguyện viên đã đăng ký"),
              makeCell(stats.tongNguoiDung, { bold: true, center: true }),
              makeCell("người", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("3"),
              makeCell("Tổng số chiến dịch hiến máu"),
              makeCell(stats.tongChienDich, { bold: true, center: true }),
              makeCell("chiến dịch", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("4"),
              makeCell("Tỷ lệ khám đạt sàng lọc lâm sàng"),
              makeCell(`${stats.tyLeDatSangLoc}%`, {
                bold: true,
                center: true,
              }),
              makeCell("", { center: true }),
            ],
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Paragraph({ children: [] }),
    ];

    // Bảng 2: Chi tiết 8 nhóm máu
    const tonKhoRows = tableData.map((item, idx) => {
      const isAlert = item.soLuong < item.nguongAnToan;
      const tTrang =
        item.soLuong === 0 ? "Kho trống" : isAlert ? "Dưới ngưỡng" : "An toàn";
      const color =
        item.soLuong === 0 ? "B71C1C" : isAlert ? "E65100" : "1B5E20";

      return new TableRow({
        children: [
          makeCell(idx + 1, { center: true }),
          makeCell(item.nhomMau, { bold: true, center: true }),
          makeCell(item.soLuong, { bold: true, center: true }),
          makeCell(item.nguongAnToan, { center: true }),
          makeCell(tTrang, { bold: true, color, center: true }),
        ],
      });
    });

    const tonKhoSection = [
      new Paragraph({
        children: [
          new TextRun({
            text: "II. TỒN KHO THEO TỪNG NHÓM MÁU CỤ THỂ",
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "C62828",
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        rows: [
          makeHeaderRow([
            "STT",
            "NHÓM MÁU",
            "SỐ LƯỢNG TỒN (túi)",
            "NGƯỠNG AN TOÀN",
            "TÌNH TRẠNG",
          ]),
          ...tonKhoRows,
          new TableRow({
            children: [
              makeCell("", { shading: "FFEBEE" }),
              makeCell("TỔNG CỘNG KHO", {
                bold: true,
                shading: "FFEBEE",
                center: true,
              }),
              makeCell(stats.tongTuiMau, {
                bold: true,
                shading: "FFEBEE",
                center: true,
              }),
              makeCell("", { shading: "FFEBEE" }),
              makeCell("", { shading: "FFEBEE" }),
            ],
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Paragraph({ children: [] }),
    ];

    // Chữ ký xác nhận
    const kySection = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: `Đà Nẵng, ngày ${today}`,
            size: 24,
            italics: true,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: "THỦ KHO MÁU XÁC NHẬN",
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: "(Ký và ghi rõ họ tên)",
            size: 22,
            italics: true,
            font: "Times New Roman",
          }),
        ],
      }),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1000, bottom: 1000, left: 1200, right: 900 },
            },
          },
          children: [
            ...headerSection,
            ...tongQuan,
            ...tonKhoSection,
            ...kySection,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `BaoCaoTonKho_${dateStr}.docx`);
  };

  if (loading) {
    return (
      <div className="tktk-loading">
        <h3>Đang tải dữ liệu báo cáo thống kê...</h3>
      </div>
    );
  }

  return (
    <div className="tktk-wrapper">
      <Navbar />

      <main className="tktk-container">
        {/* Header */}
        <div className="tktk-header-row">
          <div>
            <h1 className="tktk-title">Thống Kê & Tồn Kho Máu</h1>
            <p className="tktk-subtitle">
              Báo cáo trực quan lượng máu tồn kho và kết quả tiếp nhận.
            </p>
          </div>
          <button onClick={handleExportWord} className="btn-export-word">
            📄 Xuất Báo Cáo (.docx)
          </button>
        </div>

        {/* 4 Cards KPI */}
        <div className="tktk-kpi-grid">
          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Tổng đơn vị máu</p>
              <h3 className="kpi-value red">{stats.tongTuiMau}</h3>
            </div>
            <div className="kpi-icon red">🩸</div>
          </div>

          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Số TNV hệ thống</p>
              <h3 className="kpi-value blue">{stats.tongNguoiDung}</h3>
            </div>
            <div className="kpi-icon blue">👥</div>
          </div>

          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Số chiến dịch</p>
              <h3 className="kpi-value orange">{stats.tongChienDich}</h3>
            </div>
            <div className="kpi-icon orange">📅</div>
          </div>

          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Tỷ lệ đạt sàng lọc</p>
              <h3 className="kpi-value green">{stats.tyLeDatSangLoc}%</h3>
            </div>
            <div className="kpi-icon green">✅</div>
          </div>
        </div>

        {/* Biểu đồ Recharts */}
        <div className="tktk-charts-grid">
          {/* Biểu đồ Tròn: Cơ cấu nhóm máu */}
          <div className="chart-card">
            <h4>📊 Tỷ lệ tồn kho theo nhóm máu</h4>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ Cột: Thu hoạch máu theo tháng */}
          <div className="chart-card">
            <h4>
              📊 Lượng máu thu được theo tháng (Năm {new Date().getFullYear()})
            </h4>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar
                    dataKey="totalUnits"
                    fill="#af101a"
                    radius={[4, 4, 0, 0]}
                    name="Số túi máu"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bảng chi tiết tồn kho 8 nhóm máu */}
        <div className="tktk-table-card shadow-sm">
          <div className="table-header">
            <h4>Trạng thái chi tiết tồn kho theo 8 nhóm máu</h4>
            <div className="legend-row">
              <span className="legend-item danger">
                <span className="dot"></span> Dưới ngưỡng an toàn (Trống)
              </span>
              <span className="legend-item success">
                <span className="dot"></span> Trên ngưỡng an toàn (Đạt)
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="tktk-table">
              <thead>
                <tr>
                  <th>Nhóm máu</th>
                  <th style={{ textAlign: "center" }}>Ngưỡng an toàn</th>
                  <th>Ngày cập nhật</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Tổng số lượng (túi)</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item) => (
                  <tr key={item.nhomMau}>
                    <td>
                      <span className="badge-nhom-mau">{item.nhomMau}</span>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>
                      {item.nguongAnToan}
                    </td>
                    <td>{item.ngayCapNhat}</td>
                    <td>
                      <span
                        className={`status-pill ${item.soLuong < item.nguongAnToan ? "danger" : "success"}`}
                      >
                        {item.trangThai}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: "900",
                        fontSize: "16px",
                      }}
                    >
                      {item.soLuong}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
