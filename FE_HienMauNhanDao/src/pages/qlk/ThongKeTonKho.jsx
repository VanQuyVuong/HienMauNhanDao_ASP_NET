import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
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
import "../../css/ThongKeTonKho.css";

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

  // HÃ m chuyá»ƒn Ä‘á»•i tÃªn nhÃ³m mÃ¡u Enum sang dáº¡ng hiá»ƒn thá»‹ thÃ¢n thiá»‡n
  const formatBloodType = (typeStr) => {
    if (!typeStr) return "ChÆ°a rÃµ";
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

        // 1. Xá»­ lÃ½ dá»¯ liá»‡u lÆ°á»£ng mÃ¡u theo 12 thÃ¡ng (BarChart)
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

        // 2. Xá»­ lÃ½ dá»¯ liá»‡u tá»· lá»‡ tá»“n kho 4 nhÃ³m chÃ­nh (PieChart)
        const aggregatedPie = {
          "NhÃ³m O": 0,
          "NhÃ³m A": 0,
          "NhÃ³m B": 0,
          "NhÃ³m AB": 0,
        };
        if (d.theoNhomMau && Array.isArray(d.theoNhomMau)) {
          d.theoNhomMau.forEach((item) => {
            const friendlyName = formatBloodType(item.nhomMau);
            if (friendlyName.startsWith("AB"))
              aggregatedPie["NhÃ³m AB"] += item.soluongTon;
            else if (friendlyName.startsWith("A"))
              aggregatedPie["NhÃ³m A"] += item.soluongTon;
            else if (friendlyName.startsWith("B"))
              aggregatedPie["NhÃ³m B"] += item.soluongTon;
            else if (friendlyName.startsWith("O"))
              aggregatedPie["NhÃ³m O"] += item.soluongTon;
          });
        }
        const mappedPieData = Object.keys(aggregatedPie)
          .map((key) => ({ name: key, value: aggregatedPie[key] }))
          .filter((item) => item.value > 0);

        setPieData(
          mappedPieData.length > 0
            ? mappedPieData
            : [{ name: "Trá»‘ng", value: 1 }],
        );

        // 3. Xá»­ lÃ½ báº£ng tá»•ng há»£p 8 nhÃ³m mÃ¡u chi tiáº¿t so vá»›i ngÆ°á»¡ng an toÃ n (máº·c Ä‘á»‹nh 10 Ä‘Æ¡n vá»‹)
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
            trangThai: quantity >= NGUONG_AN_TOAN ? "An toÃ n" : "Sáº¯p háº¿t",
            ngayCapNhat: todayStr,
          };
        });
        setTableData(summaryList);
      }
    } catch (error) {
      console.error("Lá»—i láº¥y dá»¯ liá»‡u thá»‘ng kÃª:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CÃ¡c hÃ m phá»¥ trá»£ táº¡o Ã´ báº£ng trong file Word
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

  // Xuáº¥t bÃ¡o cÃ¡o Word (.docx) chuáº©n máº«u hÃ nh chÃ­nh
  const handleExportWord = async () => {
    const today = new Date().toLocaleDateString("vi-VN");
    const dateStr = new Date().toISOString().slice(0, 10);

    const headerSection = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Cá»˜NG HÃ’A XÃƒ Há»˜I CHá»¦ NGHÄ¨A VIá»†T NAM",
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
            text: "Äá»™c láº­p â€“ Tá»± do â€“ Háº¡nh phÃºc",
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
            text: "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€",
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
            text: "BÃO CÃO Tá»’N KHO MÃU",
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
            text: "Há»‡ thá»‘ng Quáº£n lÃ½ Hiáº¿n mÃ¡u NhÃ¢n Ä‘áº¡o TP. ÄÃ  Náºµng",
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
            text: `NgÃ y xuáº¥t bÃ¡o cÃ¡o: ${today}`,
            size: 24,
            font: "Times New Roman",
            italics: true,
          }),
        ],
      }),
      new Paragraph({ children: [] }),
    ];

    // Báº£ng 1: Chá»‰ sá»‘ tá»•ng quan
    const tongQuan = [
      new Paragraph({
        children: [
          new TextRun({
            text: "I. CHá»ˆ Sá» Tá»”NG QUAN KHO MÃU",
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
          makeHeaderRow(["STT", "CHá»ˆ Sá» THá»NG KÃŠ", "GIÃ TRá»Š", "ÄÆ N Vá»Š"]),
          new TableRow({
            children: [
              makeCell("1"),
              makeCell("Tá»•ng Ä‘Æ¡n vá»‹ mÃ¡u lÆ°u kho thá»±c táº¿"),
              makeCell(stats.tongTuiMau, { bold: true, center: true }),
              makeCell("tÃºi", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("2"),
              makeCell("Tá»•ng sá»‘ tÃ¬nh nguyá»‡n viÃªn Ä‘Ã£ Ä‘Äƒng kÃ½"),
              makeCell(stats.tongNguoiDung, { bold: true, center: true }),
              makeCell("ngÆ°á»i", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("3"),
              makeCell("Tá»•ng sá»‘ chiáº¿n dá»‹ch hiáº¿n mÃ¡u"),
              makeCell(stats.tongChienDich, { bold: true, center: true }),
              makeCell("chiáº¿n dá»‹ch", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("4"),
              makeCell("Tá»· lá»‡ khÃ¡m Ä‘áº¡t sÃ ng lá»c lÃ¢m sÃ ng"),
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

    // Báº£ng 2: Chi tiáº¿t 8 nhÃ³m mÃ¡u
    const tonKhoRows = tableData.map((item, idx) => {
      const isAlert = item.soLuong < item.nguongAnToan;
      const tTrang =
        item.soLuong === 0 ? "Kho trá»‘ng" : isAlert ? "DÆ°á»›i ngÆ°á»¡ng" : "An toÃ n";
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
            text: "II. Tá»’N KHO THEO Tá»ªNG NHÃ“M MÃU Cá»¤ THá»‚",
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
            "NHÃ“M MÃU",
            "Sá» LÆ¯á»¢NG Tá»’N (tÃºi)",
            "NGÆ¯á» NG AN TOÃ€N",
            "TÃŒNH TRáº NG",
          ]),
          ...tonKhoRows,
          new TableRow({
            children: [
              makeCell("", { shading: "FFEBEE" }),
              makeCell("Tá»”NG Cá»˜NG KHO", {
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

    // Chá»¯ kÃ½ xÃ¡c nháº­n
    const kySection = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: `ÄÃ  Náºµng, ngÃ y ${today}`,
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
            text: "THá»¦ KHO MÃU XÃC NHáº¬N",
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
            text: "(KÃ½ vÃ  ghi rÃµ há» tÃªn)",
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
        <h3>Äang táº£i dá»¯ liá»‡u bÃ¡o cÃ¡o thá»‘ng kÃª...</h3>
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
            <h1 className="tktk-title">Thá»‘ng KÃª & Tá»“n Kho MÃ¡u</h1>
            <p className="tktk-subtitle">
              BÃ¡o cÃ¡o trá»±c quan lÆ°á»£ng mÃ¡u tá»“n kho vÃ  káº¿t quáº£ tiáº¿p nháº­n.
            </p>
          </div>
          <button onClick={handleExportWord} className="btn-export-word">
            ðŸ“„ Xuáº¥t BÃ¡o CÃ¡o (.docx)
          </button>
        </div>

        {/* 4 Cards KPI */}
        <div className="tktk-kpi-grid">
          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Tá»•ng Ä‘Æ¡n vá»‹ mÃ¡u</p>
              <h3 className="kpi-value red">{stats.tongTuiMau}</h3>
            </div>
            <div className="kpi-icon red">ðŸ©¸</div>
          </div>

          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Sá»‘ TNV há»‡ thá»‘ng</p>
              <h3 className="kpi-value blue">{stats.tongNguoiDung}</h3>
            </div>
            <div className="kpi-icon blue">ðŸ‘¥</div>
          </div>

          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Sá»‘ chiáº¿n dá»‹ch</p>
              <h3 className="kpi-value orange">{stats.tongChienDich}</h3>
            </div>
            <div className="kpi-icon orange">ðŸ“…</div>
          </div>

          <div className="kpi-card shadow-sm">
            <div className="kpi-content">
              <p className="kpi-label">Tá»· lá»‡ Ä‘áº¡t sÃ ng lá»c</p>
              <h3 className="kpi-value green">{stats.tyLeDatSangLoc}%</h3>
            </div>
            <div className="kpi-icon green">âœ…</div>
          </div>
        </div>

        {/* Biá»ƒu Ä‘á»“ Recharts */}
        <div className="tktk-charts-grid">
          {/* Biá»ƒu Ä‘á»“ TrÃ²n: CÆ¡ cáº¥u nhÃ³m mÃ¡u */}
          <div className="chart-card">
            <h4>ðŸ“Š Tá»· lá»‡ tá»“n kho theo nhÃ³m mÃ¡u</h4>
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

          {/* Biá»ƒu Ä‘á»“ Cá»™t: Thu hoáº¡ch mÃ¡u theo thÃ¡ng */}
          <div className="chart-card">
            <h4>
              ðŸ“Š LÆ°á»£ng mÃ¡u thu Ä‘Æ°á»£c theo thÃ¡ng (NÄƒm {new Date().getFullYear()})
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
                    name="Sá»‘ tÃºi mÃ¡u"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Báº£ng chi tiáº¿t tá»“n kho 8 nhÃ³m mÃ¡u */}
        <div className="tktk-table-card shadow-sm">
          <div className="table-header">
            <h4>Tráº¡ng thÃ¡i chi tiáº¿t tá»“n kho theo 8 nhÃ³m mÃ¡u</h4>
            <div className="legend-row">
              <span className="legend-item danger">
                <span className="dot"></span> DÆ°á»›i ngÆ°á»¡ng an toÃ n (Trá»‘ng)
              </span>
              <span className="legend-item success">
                <span className="dot"></span> TrÃªn ngÆ°á»¡ng an toÃ n (Äáº¡t)
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="tktk-table">
              <thead>
                <tr>
                  <th>NhÃ³m mÃ¡u</th>
                  <th style={{ textAlign: "center" }}>NgÆ°á»¡ng an toÃ n</th>
                  <th>NgÃ y cáº­p nháº­t</th>
                  <th>Tráº¡ng thÃ¡i</th>
                  <th style={{ textAlign: "right" }}>Tá»•ng sá»‘ lÆ°á»£ng (tÃºi)</th>
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

