import React, { useState, useEffect } from 'react';
import http from '../../utils/http';
import { chienDichService } from '../../services/chienDichService';
import {Document,Packer,Paragraph,Table,TableRow,TableCell,TextRun,HeadingLevel,AlignmentType,BorderStyle,WidthType,ShadingType,} from "docx"; import { saveAs } from "file-saver";

const QuanLyNhapKhoTheoChienDich = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [bloodUnits, setBloodUnits] = useState({}); // { campaignId: [units] }
    const [loadingUnits, setLoadingUnits] = useState({}); // { campaignId: boolean }

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const res = await chienDichService.getChienDichs();
            setCampaigns(res.data || res || []);
        } catch (err) {
            console.error('Lỗi tải danh sách chiến dịch:', err);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBloodUnits = async (campaignId) => {
        if (bloodUnits[campaignId]) return;

        try {
            setLoadingUnits(prev => ({ ...prev, [campaignId]: true }));
            const res = await http.get(`/tuimau/blood-units?maChienDich=${campaignId}&size=100`);
            setBloodUnits(prev => ({ ...prev, [campaignId]: res.content || [] }));
        } catch (err) {
            console.error(`Lỗi tải túi máu cho ${campaignId}:`, err);
            setBloodUnits(prev => ({ ...prev, [campaignId]: [] }));
        } finally {
            setLoadingUnits(prev => ({ ...prev, [campaignId]: false }));
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

    // Helper tạo ô bảng cho Word
    const makeCell = (text, opts = {}) =>
        new TableCell({
            width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
            shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading } : undefined,
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

    const handleExportCampaignReport = async (camp) => {
        const units = bloodUnits[camp.maChienDich] || [];
        const today = new Date().toLocaleDateString("vi-VN");
        
        // Thống kê theo nhóm máu trong chiến dịch
        const stats = {};
        units.forEach(u => {
            stats[u.nhomMau] = (stats[u.nhomMau] || 0) + 1;
        });

        const headerSection = [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 26, font: "Times New Roman" }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "Độc lập – Tự do – Hạnh phúc", bold: true, size: 24, font: "Times New Roman" }),
                ],
            }),
            new Paragraph({ children: [new TextRun({ text: "───────────────", size: 24, font: "Times New Roman" })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [] }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.HEADING_1,
                children: [
                    new TextRun({ text: "BÁO CÁO CHI TIẾT NHẬP KHO CHIẾN DỊCH", bold: true, size: 28, color: "C62828", font: "Times New Roman" }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: camp.tenChienDich.toUpperCase(), bold: true, size: 24, font: "Times New Roman" }),
                ],
            }),
            new Paragraph({ children: [] }),
            new Paragraph({
                children: [
                    new TextRun({ text: `Mã chiến dịch: ${camp.maChienDich}`, size: 24, font: "Times New Roman" }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: `Địa điểm: ${camp.diaDiem?.tenDiaDiem || 'N/A'}`, size: 24, font: "Times New Roman" }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: `Thời gian: ${new Date(camp.thoiGianBD).toLocaleDateString('vi-VN')} - ${new Date(camp.thoiGianKT).toLocaleDateString('vi-VN')}`, size: 24, font: "Times New Roman" }),
                ],
            }),
            new Paragraph({ children: [] }),
        ];

        const unitRows = units.map((u, i) => new TableRow({
            children: [
                makeCell(i + 1, { center: true }),
                makeCell(u.maTuiMau, { font: "Courier New", center: true }),
                makeCell(u.nhomMau, { bold: true, center: true, color: "B71C1C" }),
                makeCell(`${u.theTich}ml`, { center: true }),
                makeCell(u.ngayThuNhan ? new Date(u.ngayThuNhan).toLocaleDateString('vi-VN') : '—', { center: true }),
                makeCell(u.nhietDoVanChuyen != null ? `${u.nhietDoVanChuyen}°C` : '—', { center: true }),
            ]
        }));

        const tableSection = [
            new Paragraph({
                children: [new TextRun({ text: "I. DANH SÁCH CHI TIẾT TÚI MÁU THU NHẬN", bold: true, size: 24, font: "Times New Roman", color: "C62828" })],
            }),
            new Paragraph({ children: [] }),
            new Table({
                width: { size: 9500, type: WidthType.DXA },
                rows: [
                    makeHeaderRow(["STT", "MÃ TÚI MÁU", "NHÓM MÁU", "THỂ TÍCH", "NGÀY LẤY", "NHIỆT ĐỘ"]),
                    ...unitRows
                ]
            }),
            new Paragraph({ children: [] }),
        ];

        const summaryRows = Object.entries(stats).map(([nhom, count], i) => new TableRow({
            children: [
                makeCell(i + 1, { center: true }),
                makeCell(nhom, { bold: true, center: true }),
                makeCell(count, { center: true, bold: true }),
                makeCell("túi", { center: true }),
            ]
        }));

        const summarySection = [
            new Paragraph({
                children: [new TextRun({ text: "II. TỔNG HỢP THEO NHÓM MÁU", bold: true, size: 24, font: "Times New Roman", color: "C62828" })],
            }),
            new Paragraph({ children: [] }),
            new Table({
                width: { size: 6000, type: WidthType.DXA },
                rows: [
                    makeHeaderRow(["STT", "NHÓM MÁU", "SỐ LƯỢNG", "ĐƠN VỊ"]),
                    ...summaryRows,
                    new TableRow({
                        children: [
                            makeCell("", { shading: "FFEBEE" }),
                            makeCell("TỔNG CỘNG", { bold: true, center: true, shading: "FFEBEE" }),
                            makeCell(units.length, { bold: true, center: true, shading: "FFEBEE" }),
                            makeCell("túi", { center: true, shading: "FFEBEE" }),
                        ]
                    })
                ]
            }),
            new Paragraph({ children: [] }),
            new Paragraph({ children: [] }),
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                    new TextRun({ text: `Đà Nẵng, ngày ${today}`, size: 24, italics: true, font: "Times New Roman" }),
                ],
            }),
            new Paragraph({ children: [] }),
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                    new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 24, font: "Times New Roman" }),
                ],
            }),
        ];

        const doc = new Document({
            sections: [{
                properties: { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 900 } } },
                children: [...headerSection, ...tableSection, ...summarySection],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `BaoCao_ChienDich_${camp.maChienDich}.docx`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                    <p className="text-slate-500 font-medium">Đang tải danh sách chiến dịch...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Nhập kho theo chiến dịch</h2>
                <p className="text-slate-500 text-sm mt-1">Xem danh sách các túi máu đã nhập kho được phân loại theo từng chiến dịch hiến máu.</p>
            </div>

            {/* Campaign List */}
            <div className="space-y-4">
                {campaigns.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                        <p className="text-slate-500">Chưa có chiến dịch nào được ghi nhận.</p>
                    </div>
                ) : (
                    campaigns.map((camp) => (
                        <div key={camp.maChienDich} 
                            className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${expandedId === camp.maChienDich ? 'ring-2 ring-primary/10 border-primary/20' : ''}`}>
                            
                            {/* Row Header */}
                            <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(camp.maChienDich)}>
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${expandedId === camp.maChienDich ? 'bg-primary text-white' : 'bg-red-50 text-primary'}`}>
                                        <span className="material-symbols-outlined text-3xl">event</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{camp.tenChienDich}</h3>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                {new Date(camp.thoiGianBD).toLocaleDateString('vi-VN')} - {new Date(camp.thoiGianKT).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {camp.diaDiem?.tenDiaDiem || 'N/A'}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                camp.trangThai === 'Đã kết thúc' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {camp.trangThai === 'Đã kết thúc' ? 'Đã kết thúc' : 'Đang diễn ra'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã chiến dịch</div>
                                        <div className="text-sm font-black text-slate-600">
                                            {camp.maChienDich} 
                                            <span className="text-primary ml-1 text-xs">
                                                ({camp.luongMauDaThu || 0} ml)
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expandedId === camp.maChienDich ? 'rotate-180 text-primary' : ''}`}>
                                        expand_more
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === camp.maChienDich && (
                                <div className="border-t border-slate-100 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-6">
                                        {loadingUnits[camp.maChienDich] ? (
                                            <div className="py-10 text-center">
                                                <span className="material-symbols-outlined text-3xl text-slate-300 animate-spin">sync</span>
                                                <p className="text-slate-400 text-sm mt-2">Đang tải danh sách túi máu...</p>
                                            </div>
                                        ) : !bloodUnits[camp.maChienDich] || bloodUnits[camp.maChienDich].length === 0 ? (
                                            <div className="py-10 text-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                                                </div>
                                                <p className="text-slate-500 text-sm">Chưa có túi máu nào được nhập kho cho chiến dịch này.</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                                                            <th className="py-4 px-6">Mã túi máu</th>
                                                            <th className="py-4 px-6">Nhóm máu</th>
                                                            <th className="py-4 px-6">Thể tích</th>
                                                            <th className="py-4 px-6">Ngày lấy mẫu</th>
                                                            <th className="py-4 px-6">Nhiệt độ VC</th>
                                                            <th className="py-4 px-6">Trạng thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {bloodUnits[camp.maChienDich].map((unit) => (
                                                            <tr key={unit.maTuiMau} className="text-sm hover:bg-slate-50 transition-colors">
                                                                <td className="py-4 px-6 font-mono font-bold text-slate-700">{unit.maTuiMau}</td>
                                                                <td className="py-4 px-6">
                                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-black text-xs">
                                                                        {unit.nhomMau || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6 text-slate-600 font-medium">{unit.theTich}ml</td>
                                                                <td className="py-4 px-6 text-slate-500">
                                                                    {unit.ngayThuNhan ? new Date(unit.ngayThuNhan).toLocaleDateString('vi-VN') : 'N/A'}
                                                                </td>
                                                                <td className="py-4 px-6 text-slate-500">
                                                                    {unit.nhietDoVanChuyen != null ? `${unit.nhietDoVanChuyen}°C` : '—'}
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase border border-blue-100">
                                                                        {unit.trangThai}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="mt-4 flex justify-between items-center px-2">
                                            <p className="text-xs text-slate-400 font-medium">Hiển thị {bloodUnits[camp.maChienDich]?.length || 0} đơn vị máu</p>
                                            {bloodUnits[camp.maChienDich]?.length > 0 && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExportCampaignReport(camp);
                                                    }}
                                                    className="text-xs font-bold text-primary hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 border border-transparent hover:border-primary/20"
                                                >
                                                    Xuất báo cáo chiến dịch (.docx) <span className="material-symbols-outlined text-sm">description</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuanLyNhapKhoTheoChienDich;
