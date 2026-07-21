import React, { useState, useEffect } from "react";
import http from "../../utils/http";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend,} from "recharts";
import {Document,Packer,Paragraph,Table,TableRow,TableCell,TextRun,HeadingLevel,AlignmentType,BorderStyle,WidthType,ShadingType,} from "docx"; import { saveAs } from "file-saver";

const ThongKeTonKho = () => {
  const [stats, setStats] = useState({
    totalBloodUnits: 0,
    newVolunteers: 0,
    activeCampaigns: 0,
    screeningPassRate: 0,
  });

  const [loading, setLoading] = useState(true);

  // Thêm state cho biểu đồ và bảng
  const [barData, setBarData] = useState([]);
  const [bloodUnits, setBloodUnits] = useState({ content: [] });
  const [pieData, setPieData] = useState([]);
  const COLORS = ["#af101a", "#d32f2f", "#ffb3ac", "#8f6f6c"]; // Tương ứng O, A, B, AB

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Chạy song song API để lấy dữ liệu
        const [statsData, barDataRes, pieDataRes] = await Promise.all([
          http.get("/tuimau/dashboard/stats"),
          http.get("/tuimau/charts/bar?year=2026"),
          http.get("/khomau/charts/pie"),
        ]);

        setStats(statsData || { totalBloodUnits: 0, newVolunteers: 0, activeCampaigns: 0, screeningPassRate: 0 });

        // Map data cho Bar Chart
        const mappedBarData =
          barDataRes && Array.isArray(barDataRes) && barDataRes.length > 0
            ? barDataRes
            : Array.from({ length: 12 }, (_, i) => ({
                month: `T.${i + 1}`,
                totalUnits: 0,
              }));
        setBarData(mappedBarData);

        // Map data cho Pie Chart
        const aggregatedPie = {
          "Nhóm O": 0,
          "Nhóm A": 0,
          "Nhóm B": 0,
          "Nhóm AB": 0,
        };
        
        if (pieDataRes && Array.isArray(pieDataRes)) {
          pieDataRes.forEach((item) => {
            if (item.bloodType.startsWith("AB"))
              aggregatedPie["Nhóm AB"] += item.quantity;
            else if (item.bloodType.startsWith("A"))
              aggregatedPie["Nhóm A"] += item.quantity;
            else if (item.bloodType.startsWith("B"))
              aggregatedPie["Nhóm B"] += item.quantity;
            else if (item.bloodType.startsWith("O"))
              aggregatedPie["Nhóm O"] += item.quantity;
          });
        }

        const mappedPieData = Object.keys(aggregatedPie)
          .map((key) => ({ name: key, value: aggregatedPie[key] }))
          .filter((item) => item.value > 0);

        if (mappedPieData.length === 0)
          mappedPieData.push({ name: "Trống", value: 1 });
        setPieData(mappedPieData);

        // Map data cho Bảng Tổng hợp 8 nhóm máu
        const today = new Date().toLocaleDateString("vi-VN");
        const NGUONG_AN_TOAN = 10;

        const summaryTable = (pieDataRes && Array.isArray(pieDataRes)) 
          ? pieDataRes.map((item) => ({
              nhomMau: item.bloodType,
              soLuong: item.quantity,
              nguongAnToan: NGUONG_AN_TOAN,
              trangThai: item.quantity >= NGUONG_AN_TOAN ? "An toàn" : "Sắp hết",
              ngayCapNhat: today,
            }))
          : [];

        setBloodUnits({ content: summaryTable });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ Backend:", error);
        setStats({ totalBloodUnits: 0, newVolunteers: 0, activeCampaigns: 0, screeningPassRate: 0 });
        setBarData(Array.from({ length: 12 }, (_, i) => ({ month: `T.${i + 1}`, totalUnits: 0 })));
        setPieData([{ name: "Lỗi kết nối", value: 1 }]);
        setBloodUnits({ content: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper tạo ô bảng
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

  // Hàm xuất Word báo cáo
  const handleExportExcel = async () => {
    const today = new Date().toLocaleDateString("vi-VN");
    const dateStr = new Date().toISOString().slice(0, 10);
    const allBloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

    // ===== TIÊU ĐỀ & THÔNG TIN CHUNG =====
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
        children: [
          new TextRun({
            text: "───────────────",
            size: 24,
            font: "Times New Roman",
          }),
        ],
        alignment: AlignmentType.CENTER,
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
        children: [
          new TextRun({
            text: `Ngày xuất báo cáo: ${today}`,
            size: 24,
            font: "Times New Roman",
            italics: true,
          }),
        ],
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({ children: [] }),
    ];

    // ===== BẢNG 1: CHỈ SỐ TỔNG QUAN =====
    const tongQuan = [
      new Paragraph({
        children: [
          new TextRun({
            text: "I. CHỈ SỐ TỔNG QUAN",
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
          makeHeaderRow(["STT", "CHỈ SỐ", "GIÁ TRỊ", "ĐƠN VỊ"]),
          new TableRow({
            children: [
              makeCell("1"),
              makeCell("Tổng đơn vị máu trong kho"),
              makeCell(stats.totalBloodUnits, { bold: true, center: true }),
              makeCell("túi", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("2"),
              makeCell("Tổng tình nguyện viên"),
              makeCell(stats.newVolunteers, { bold: true, center: true }),
              makeCell("người", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("3"),
              makeCell("Số chiến dịch hiến máu"),
              makeCell(stats.activeCampaigns, { bold: true, center: true }),
              makeCell("chiến dịch", { center: true }),
            ],
          }),
          new TableRow({
            children: [
              makeCell("4"),
              makeCell("Tỷ lệ đạt sàng lọc lâm sàng"),
              makeCell(`${stats.screeningPassRate}%`, {
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

    // ===== BẢNG 2: TỒN KHO THEO NHÓM MÁU =====
    const tongTonKho = bloodUnits.content.reduce(
      (s, u) => s + (u.soLuong || 0),
      0,
    );
    const tonKhoRows = allBloodTypes.map((bt, i) => {
      const found = bloodUnits.content.find((u) => u.nhomMau === bt);
      const soLuong = found ? (found.soLuong ?? 0) : 0;
      const nguong = found ? (found.nguongAnToan ?? 10) : 10;
      const isAlert = soLuong < nguong;
      const trangThai =
        soLuong === 0 ? "⚠ Kho trống" : isAlert ? "⚠ Dưới ngưỡng" : "✓ An toàn";
      const color = soLuong === 0 ? "B71C1C" : isAlert ? "E65100" : "1B5E20";
      return new TableRow({
        children: [
          makeCell(i + 1, { center: true }),
          makeCell(bt, { bold: true, center: true }),
          makeCell(soLuong, { bold: true, center: true }),
          makeCell(nguong, { center: true }),
          makeCell(trangThai, { bold: true, color, center: true }),
        ],
      });
    });

    const tonKhoSection = [
      new Paragraph({
        children: [
          new TextRun({
            text: "II. TỒN KHO THEO NHÓM MÁU",
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "C62828",
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `(Cập nhật: ${today})`,
            size: 22,
            italics: true,
            font: "Times New Roman",
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
            "SỐ LƯỢNG (túi)",
            "NGƯỠNG AN TOÀN",
            "TÌNH TRẠNG",
          ]),
          ...tonKhoRows,
          new TableRow({
            children: [
              makeCell("", { shading: "FFEBEE" }),
              makeCell("TỔNG CỘNG", {
                bold: true,
                shading: "FFEBEE",
                center: true,
              }),
              makeCell(tongTonKho, {
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

    // ===== BẢNG 3: LƯỢNG MÁU THEO THÁNG =====
    const thangLabels = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    const monthRows2 = thangLabels.map((label, idx) => {
      const found = barData.find((d) => d.month === idx + 1);
      const qty = found ? found.totalUnits : 0;
      return new TableRow({
        children: [
          makeCell(idx + 1, { center: true }),
          makeCell(label, { center: true }),
          makeCell(qty, { bold: qty > 0, center: true }),
          makeCell(qty > 0 ? "Có thu nhận" : "—", {
            center: true,
            color: qty > 0 ? "1B5E20" : "9E9E9E",
          }),
        ],
      });
    });
    const tongNam = thangLabels.reduce((s, _, i) => {
      const f = barData.find((d) => d.month === i + 1);
      return s + (f ? f.totalUnits : 0);
    }, 0);

    const thangSection = [
      new Paragraph({
        children: [
          new TextRun({
            text: "III. LƯỢNG MÁU THU ĐƯỢC THEO THÁNG (NĂM 2026)",
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
          makeHeaderRow(["STT", "THÁNG", "SỐ TÚI MÁU", "TÌNH TRẠNG"]),
          ...monthRows2,
          new TableRow({
            children: [
              makeCell("", { shading: "FFEBEE" }),
              makeCell("TỔNG CẢ NĂM", {
                bold: true,
                shading: "FFEBEE",
                center: true,
              }),
              makeCell(tongNam, {
                bold: true,
                shading: "FFEBEE",
                center: true,
              }),
              makeCell("", { shading: "FFEBEE" }),
            ],
          }),
        ],
      }),
      new Paragraph({ children: [] }),
      new Paragraph({ children: [] }),
    ];

    // ===== CHỮ KÝ =====
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
            text: "QUẢN LÝ KHO MÁU",
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
            ...thangSection,
            ...kySection,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `BaoCaoTonKho_${dateStr}.docx`);
  };

  // Hàm xử lý hủy túi máu
  const handleDelete = async (maTuiMau) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn hủy túi máu ${maTuiMau} không? Hành động này không thể hoàn tác.`,
      )
    ) {
      return;
    }
    try {
      await http.delete(`/tuimau/blood-units/${maTuiMau}`);
      alert("Đã hủy túi máu thành công!");
      // Tải lại dữ liệu trang hiện tại
      setPage(0);
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi hủy túi máu:", error);
      alert("Không thể hủy túi máu này. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Đang tải dữ liệu từ máy chủ...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-slate-800 antialiased min-h-screen">
      <main className="p-8 space-y-8">
        {/* Tiêu đề trang */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Thống kê &amp; Tồn kho
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Dữ liệu được cập nhật tự động theo thời gian thực.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              className="h-10 px-4 bg-emerald-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">
                description
              </span>{" "}
              Xuất Báo Cáo (.docx)
            </button>
          </div>
        </div>

        {/* 4 Thẻ thống kê (Cards) */}
        <div className="grid grid-cols-4 gap-6">
          {/* Thẻ 1: Tổng đơn vị máu */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="absolute right-4 top-4 text-[#af101a]/10">
              <span
                className="material-symbols-outlined text-6xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bloodtype
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Tổng đơn vị máu
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.totalBloodUnits.toLocaleString()}
              </h3>
            </div>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>{" "}
              Dữ liệu thực tế
            </p>
          </div>

          {/* Thẻ 2: Số TNV mới */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="absolute right-4 top-4 text-blue-500/10">
              <span className="material-symbols-outlined text-6xl">
                person_add
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Số TNV hệ thống
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.newVolunteers.toLocaleString()}
              </h3>
            </div>
            <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">people</span>{" "}
              Dữ liệu thực tế
            </p>
          </div>

          {/* Thẻ 3: Chiến dịch đang chạy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="absolute right-4 top-4 text-orange-500/10">
              <span className="material-symbols-outlined text-6xl">
                campaign
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Số chiến dịch
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.activeCampaigns < 10
                  ? `0${stats.activeCampaigns}`
                  : stats.activeCampaigns}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Đã khai báo trên hệ thống
            </p>
          </div>

          {/* Thẻ 4: Tỷ lệ đạt sàng lọc */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="absolute right-4 top-4 text-emerald-500/10">
              <span className="material-symbols-outlined text-6xl">
                fact_check
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Tỷ lệ đạt sàng lọc
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.screeningPassRate}%
              </h3>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${stats.screeningPassRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* PHẦN MỚI: Biểu đồ */}
        <div className="grid grid-cols-12 gap-6 h-[400px]">
          {/* Biểu đồ tròn */}
          <div className="col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-lg">
                pie_chart
              </span>{" "}
              Tỷ lệ tồn kho
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
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

          {/* Biểu đồ cột */}
          <div className="col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-lg">
                bar_chart
              </span>{" "}
              Lượng máu thu được (2026)
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar
                    dataKey="totalUnits"
                    fill="#af101a"
                    radius={[4, 4, 0, 0]}
                    name="Túi máu"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* PHẦN MỚI: Bảng chi tiết */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h4 className="text-sm font-bold text-slate-700">
              Trạng thái tồn kho theo 8 nhóm máu
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Dưới
                ngưỡng an toàn
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{" "}
                Trên ngưỡng an toàn
              </span>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="h-12 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Nhóm máu
                </th>
                <th className="h-12 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Ngưỡng an toàn
                </th>
                <th className="h-12 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Ngày cập nhật
                </th>
                <th className="h-12 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Trạng thái
                </th>
                <th className="h-12 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                  Tổng số lượng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bloodUnits &&
              bloodUnits.content &&
              bloodUnits.content.length > 0 ? (
                bloodUnits.content.map((unit, idx) => (
                  <tr
                    key={idx}
                    className="h-16 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6">
                      <span className="w-10 h-6 inline-flex items-center justify-center rounded-full text-[12px] font-black bg-red-100 text-red-800">
                        {unit.nhomMau}
                      </span>
                    </td>
                    <td className="px-6 text-sm font-bold text-slate-600 text-center">
                      {unit.nguongAnToan}
                    </td>
                    <td className="px-6 text-sm text-slate-600">
                      {unit.ngayCapNhat}
                    </td>
                    <td className="px-6">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase flex w-fit items-center gap-1 ${unit.trangThai === "Sắp hết" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              unit.trangThai === "Sắp hết"
                                ? "#ef4444"
                                : "#10b981",
                          }}
                        ></span>
                        {unit.trangThai}
                      </span>
                    </td>
                    <td className="px-6 text-right font-black text-lg text-slate-800">
                      {unit.soLuong}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    Chưa có dữ liệu tồn kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ThongKeTonKho;
