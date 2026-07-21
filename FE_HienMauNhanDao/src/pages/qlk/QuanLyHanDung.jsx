import React, { useState, useEffect } from 'react';
import http from "../../utils/http";
import {Document,Packer,Paragraph,Table,TableRow,TableCell,TextRun,HeadingLevel,AlignmentType,BorderStyle,WidthType,ShadingType,} from "docx"; import { saveAs } from "file-saver";

const QuanLyHanDung = () => {
    const [viewMode, setViewMode] = useState('all'); // all, expired, near
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        expiredCount: 0,
        nearExpiryCount: 0,
        safeCount: 0
    });
    const [bloodUnits, setBloodUnits] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, unitsRes] = await Promise.all([
                http.get('/tuimau/expiry-stats'),
                http.get(`/tuimau/expiry-management?viewMode=${viewMode}&search=${searchQuery}`)
            ]);
            setStats(statsRes || { expiredCount: 0, nearExpiryCount: 0, safeCount: 0, hasCritical: false });
            setBloodUnits(Array.isArray(unitsRes) ? unitsRes : []);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu hạn dùng:", error);
            // Don't let it crash, set default values
            setStats({ expiredCount: 0, nearExpiryCount: 0, safeCount: 0, hasCritical: false });
            setBloodUnits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1); // Reset về trang 1 khi lọc
        fetchData();
    }, [viewMode, searchQuery]);

    // Tính toán phân trang
    const totalPages = Math.ceil(bloodUnits.length / pageSize);
    const paginatedUnits = bloodUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

    const handleExportReport = async (providedData = null) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("vi-VN");
        const timeStr = `${now.getHours()}h${now.getMinutes()}m${now.getSeconds()}s`;
        
        const dataToExport = providedData || [...bloodUnits];

        // Xác định tiêu đề dựa trên Tab hiện tại
        const modeTitle = 
            viewMode === 'all' ? "TỔNG QUAN HỆ THỐNG" : 
            viewMode === 'safe' ? "DANH SÁCH AN TOÀN" :
            viewMode === 'near' ? "DANH SÁCH SẮP HẾT HẠN" : "DANH SÁCH ĐÃ HẾT HẠN";
        
        const getStatusColor = (status) => {
            switch(status) {
                case 'SAFE': return "2E7D32"; 
                case 'NEAR_EXPIRY': return "E65100"; 
                case 'WARNING_EXPIRED': return "B71C1C"; 
                case 'EXPIRED': return "D32F2F"; 
                case 'ARCHIVED_EXPIRED': return "616161"; 
                default: return "000000";
            }
        };

        const rows = dataToExport.map((u, i) => {
            const statusColor = getStatusColor(u.trangThaiHan);
            const statusText = 
                u.trangThaiHan === 'SAFE' ? "An toàn" : 
                u.trangThaiHan === 'NEAR_EXPIRY' ? "Sắp hết hạn" : 
                u.trangThaiHan === 'WARNING_EXPIRED' ? "Tiêu hủy gấp" : 
                u.trangThaiHan === 'ARCHIVED_EXPIRED' ? "Lưu trữ" : "Quá hạn";

            return new TableRow({
                children: [
                    makeCell(i + 1, { center: true }),
                    makeCell(u.maTuiMau, { bold: true }),
                    makeCell(u.maChienDich, { center: true }),
                    makeCell(u.nhomMau, { bold: true, center: true }),
                    makeCell(u.theTich + "ml", { center: true }),
                    makeCell(new Date(u.thoiGianLayMau).toLocaleDateString("vi-VN")),
                    makeCell(new Date(u.ngayHetHan).toLocaleDateString("vi-VN"), { 
                        bold: true, 
                        color: statusColor 
                    }),
                    makeCell(statusText, { 
                        bold: true, 
                        color: statusColor,
                        size: 20 
                    }),
                ]
            });
        });

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24 })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: 20 })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 500, after: 500 },
                        children: [
                            new TextRun({
                                text: `BÁO CÁO ${modeTitle}`,
                                bold: true,
                                size: 32,
                                color: "af101a",
                            }),
                        ],
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    makeCell("STT", { bold: true, shading: "F3F4F6", center: true }),
                                    makeCell("Mã túi máu", { bold: true, shading: "F3F4F6" }),
                                    makeCell("Chiến dịch", { bold: true, shading: "F3F4F6", center: true }),
                                    makeCell("Nhóm máu", { bold: true, shading: "F3F4F6", center: true }),
                                    makeCell("Thể tích", { bold: true, shading: "F3F4F6", center: true }),
                                    makeCell("Ngày lấy", { bold: true, shading: "F3F4F6" }),
                                    makeCell("Hạn dùng", { bold: true, shading: "F3F4F6" }),
                                    makeCell("Trạng thái", { bold: true, shading: "F3F4F6" }),
                                ]
                            }),
                            ...rows
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 400 },
                        children: [
                            new TextRun({ text: `Ngày lập: ${dateStr}`, italics: true }),
                            new TextRun({ text: ` | Mã xuất: ${timeStr}`, italics: true, size: 16 }),
                        ]
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `BaoCao_${viewMode}_${now.toISOString().replace(/[:.]/g, '-')}.docx`);
    };

    const handleDeleteExpired = async () => {
        if (window.confirm(`Bạn có chắc chắn muốn TIÊU HỦY tất cả ${stats.expiredCount} túi máu đã hết hạn không? Hành động này không thể hoàn tác.`)) {
            try {
                await http.delete('/tuimau/delete-expired');
                alert("Đã tiêu hủy thành công!");
                fetchData();
            } catch (error) {
                alert("Lỗi khi tiêu hủy: " + (error.response?.data || error.message));
            }
        }
    };

    const handleDeleteSingle = async (id) => {
        if (window.confirm(`Bạn có chắc muốn tiêu hủy túi máu ${id}?`)) {
            try {
                await http.delete(`/tuimau/blood-units/${id}`);
                alert("Đã tiêu hủy túi máu thành công!");
                fetchData();
            } catch (error) {
                alert("Lỗi khi tiêu hủy!");
            }
        }
    };

    const hasWarningExpired = stats.hasCritical;

    return (
        <div className="bg-gray-50 text-slate-800 antialiased min-h-screen">
            {/* CSS for custom animations */}
            <style>
                {`
                @keyframes pulse-red-bg {
                    0% { background-color: white; border-color: #e2e8f0; }
                    50% { background-color: #fef2f2; border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
                    100% { background-color: white; border-color: #e2e8f0; }
                }
                .animate-pulse-red {
                    animation: pulse-red-bg 1.5s infinite ease-in-out;
                }
                `}
            </style>

            <main className="p-8 space-y-6">
                
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Hạn dùng & Tiêu hủy</h1>
                    <p className="text-slate-500 text-sm mt-1">Theo dõi vòng đời và quản lý tiêu hủy các túi máu dựa trên thời gian thu nhận.</p>
                </div>

                {/* Summary Stats Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div 
                        onClick={() => setViewMode('expired')}
                        className={`p-6 rounded-2xl border bg-white shadow-sm flex items-center gap-5 transition-all cursor-pointer ${hasWarningExpired ? 'animate-pulse-red' : 'border-slate-200 hover:shadow-md hover:-translate-y-1'}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${hasWarningExpired ? 'bg-red-600 text-white animate-bounce' : 'bg-red-50 text-red-600'}`}>
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {hasWarningExpired ? 'priority_high' : 'dangerous'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đã hết hạn</p>
                            <h3 className={`text-2xl font-black ${hasWarningExpired ? 'text-red-600' : 'text-red-600'}`}>{stats.expiredCount} túi</h3>
                            {hasWarningExpired && <p className="text-[9px] text-red-500 font-bold animate-pulse">CẢNH BÁO: CÓ TÚI SẮP BỊ XÓA!</p>}
                        </div>
                    </div>

                    <div 
                        onClick={() => setViewMode('near')}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sắp hết hạn (&lt; 7 ngày)</p>
                            <h3 className="text-2xl font-black text-orange-600">{stats.nearExpiryCount} túi</h3>
                        </div>
                    </div>

                    <div 
                        onClick={() => setViewMode('safe')}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">An toàn</p>
                            <h3 className="text-2xl font-black text-green-600">{stats.safeCount} túi</h3>
                        </div>
                    </div>
                </div>

                {/* Controls & Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
                        {['all', 'safe', 'near', 'expired'].map((mode) => (
                            <button 
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === mode ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {mode === 'all' ? 'Tổng quan' : mode === 'safe' ? 'An toàn' : mode === 'near' ? 'Sắp hết hạn' : 'Đã hết hạn'}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleExportReport()}
                            className="h-11 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">file_download</span>
                            Xuất báo cáo {viewMode === 'all' ? 'Tổng quan' : ''}
                        </button>
                        {viewMode === 'expired' && stats.expiredCount > 0 && (
                            <button 
                                onClick={handleDeleteExpired}
                                className="h-11 px-5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 flex items-center gap-2 shadow-md transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                Tiêu hủy tất cả đơn vị quá hạn
                            </button>
                        )}
                    </div>
                </div>

                {/* Data Table Card */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px] flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">
                            {viewMode === 'all' && "Danh sách túi máu trong kho"}
                            {viewMode === 'expired' && "Danh sách túi máu ĐÃ HẾT HẠN"}
                            {viewMode === 'near' && "Danh sách túi máu SẮP HẾT HẠN"}
                        </h3>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                type="text" 
                                placeholder="Tìm mã túi máu..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-100">
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã túi máu</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã chiến dịch</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhóm máu</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thể tích</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày lấy mẫu</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạn sử dụng</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái hạn</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                                <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : bloodUnits.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <span className="material-symbols-outlined text-5xl mb-2 opacity-20">inventory_2</span>
                                                <p className="text-sm italic">Chưa có dữ liệu túi máu nào được tìm thấy</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUnits.map((unit) => (
                                        <tr key={unit.maTuiMau} className={`hover:bg-slate-50 transition-all ${
                                            unit.trangThaiHan === 'ARCHIVED_EXPIRED' ? 'opacity-40 grayscale italic bg-slate-100/50' : 
                                            unit.trangThaiHan === 'WARNING_EXPIRED' ? 'bg-red-50/50' :
                                            unit.trangThaiHan === 'EXPIRED' ? 'bg-red-50/30' : ''
                                        }`}>
                                            <td className={`py-4 px-6 font-mono font-bold ${
                                                unit.trangThaiHan === 'ARCHIVED_EXPIRED' ? 'text-slate-400' :
                                                (unit.trangThaiHan?.includes('EXPIRED')) ? 'text-red-700' : 'text-slate-900'
                                            }`}>
                                                {unit.maTuiMau}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-semibold text-slate-600">{unit.maChienDich}</td>
                                            <td className="py-4 px-6">
                                                <span className={`w-10 h-6 flex items-center justify-center rounded-full font-black text-xs ${
                                                    unit.trangThaiHan === 'ARCHIVED_EXPIRED' ? 'bg-slate-200 text-slate-400' :
                                                    unit.nhomMau?.startsWith('O') ? 'bg-red-100 text-red-700' : 
                                                    unit.nhomMau?.startsWith('A') ? 'bg-blue-100 text-blue-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {unit.nhomMau || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-700 text-center font-medium">{unit.theTich}ml</td>
                                            <td className="py-4 px-6 text-sm text-slate-500">
                                                {new Date(unit.thoiGianLayMau).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className={`py-4 px-6 text-sm font-bold ${
                                                unit.trangThaiHan === 'ARCHIVED_EXPIRED' ? 'text-slate-400' :
                                                (unit.trangThaiHan?.includes('EXPIRED')) ? 'text-red-600' : 'text-slate-700'
                                            }`}>
                                                {new Date(unit.ngayHetHan).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="py-4 px-6">
                                                {unit.trangThaiHan === 'ARCHIVED_EXPIRED' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-400 text-white rounded-full text-[10px] font-bold uppercase">
                                                        Lưu trữ (Quá {Math.abs(unit.daysRemaining)} ngày)
                                                    </span>
                                                ) : unit.trangThaiHan === 'WARNING_EXPIRED' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-700 text-white rounded-full text-[10px] font-bold uppercase shadow-lg animate-pulse">
                                                        <span className="material-symbols-outlined text-[12px]">warning</span> TIÊU HỦY GẤP ({Math.abs(unit.daysRemaining)}n)
                                                    </span>
                                                ) : unit.trangThaiHan === 'EXPIRED' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-bold uppercase shadow-sm">
                                                        Quá hạn {Math.abs(unit.daysRemaining)} ngày
                                                    </span>
                                                ) : unit.trangThaiHan === 'NEAR_EXPIRY' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span> Còn {unit.daysRemaining} ngày
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> An toàn
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button 
                                                    onClick={() => handleDeleteSingle(unit.maTuiMau)}
                                                    className={`p-2 transition-colors ${unit.trangThaiHan === 'WARNING_EXPIRED' ? 'text-red-700 hover:scale-125' : 'text-slate-400 hover:text-red-600'}`} 
                                                    title="Tiêu hủy"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete_forever</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && bloodUnits.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <p className="text-sm text-slate-500">
                                Hiển thị <span className="font-bold text-slate-700">{paginatedUnits.length}</span> đơn vị trong tổng số <span className="font-bold text-slate-700">{bloodUnits.length}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                    .map((page, index, array) => {
                                        const results = [];
                                        if (index > 0 && page !== array[index - 1] + 1) {
                                            results.push(<span key={`dots-${page}`} className="text-slate-400">...</span>);
                                        }
                                        results.push(
                                            <button 
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                                    currentPage === page 
                                                    ? 'bg-primary text-white shadow-md' 
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                        return results;
                                    })
                                }

                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default QuanLyHanDung;
