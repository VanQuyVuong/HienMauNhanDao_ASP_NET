import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const QuanLyNhapKhoQuetMa = () => {
    const [khoMaus, setKhoMaus] = useState([]);
    const [bloodUnits, setBloodUnits] = useState([]);
    const [selectedKho, setSelectedKho] = useState(null);
    const [tenBenhVien, setTenBenhVien] = useState('');
    const [maTuiMau, setMaTuiMau] = useState('');
    const [tuiMau, setTuiMau] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchKhoMaus();
        fetchBloodUnits();
    }, []);

    const fetchKhoMaus = async () => {
        try {
            const res = await api.get('/KhoMauBenhVien/my-hospital-inventory');
            if (res.data?.success) {
                setKhoMaus(res.data.data);
                setTenBenhVien(res.data.tenBenhVien);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách kho máu:", err);
        }
    };

    const fetchBloodUnits = async () => {
        try {
            const res = await api.get('/KhoMauBenhVien/my-hospital');
            if (res.data?.success) {
                setBloodUnits(res.data.bloodUnits);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách túi máu:", err);
        }
    };

    const handleScan = async (e) => {
        e.preventDefault();
        if (!maTuiMau.trim()) return;
        setLoading(true);
        try {
            const res = await api.get(`/KhoMauBenhVien/scan-blood-unit/${maTuiMau.trim()}`);
            if (res.data?.success) {
                setTuiMau(res.data.data);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi hệ thống khi tìm túi máu!';
            Swal.fire('Thất bại', msg, 'error');
            setTuiMau(null);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!tuiMau) return;
        try {
            const res = await api.post('/KhoMauBenhVien/import', { maTuiMau: tuiMau.maTuiMau });
            if (res.data?.success) {
                Swal.fire('Thành công', res.data.message, 'success');
                setTuiMau(null);
                setMaTuiMau('');
                fetchKhoMaus(); // Cập nhật lại grid kho máu
                fetchBloodUnits(); // Cập nhật lại danh sách túi máu
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi khi nhập kho!';
            Swal.fire('Thất bại', msg, 'error');
        }
    };

    const handleReportIssue = async () => {
        if (!tuiMau) return;
        
        const { value: lyDo } = await Swal.fire({
            title: 'Yêu cầu kiểm tra lại',
            input: 'textarea',
            inputLabel: 'Lý do từ chối / yêu cầu kiểm tra',
            inputPlaceholder: 'Nhập lý do chi tiết (VD: Tạp chất, Bao bì rách...)',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Gửi yêu cầu',
            cancelButtonText: 'Hủy'
        });

        if (lyDo) {
            try {
                const res = await api.post('/KhoMauBenhVien/report-issue', {
                    maTuiMau: tuiMau.maTuiMau,
                    lyDo: lyDo,
                    hanhDong: "KIEM_TRA"
                });
                if (res.data?.success) {
                    Swal.fire('Thành công', res.data.message, 'success');
                    setTuiMau(null);
                    setMaTuiMau('');
                }
            } catch (err) {
                Swal.fire('Thất bại', err.response?.data?.message || 'Lỗi gửi yêu cầu', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Grid Kho Máu */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-3xl text-red-600">bloodtype</span>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Kho Máu Lưu Trữ Bệnh Viện</h2>
                        <p className="text-sm text-slate-500">{tenBenhVien || 'Đang tải dữ liệu...'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {khoMaus.map(kho => (
                        <div 
                            key={kho.maKho} 
                            onClick={() => setSelectedKho(kho)}
                            className={`p-4 border rounded-xl flex flex-col items-center shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                                selectedKho?.maKho === kho.maKho 
                                ? 'bg-red-600 border-red-700 shadow-md ring-4 ring-red-100' 
                                : 'bg-red-50/30 border-red-100 hover:bg-red-50'
                            }`}
                        >
                            <span className={`text-sm mb-1 line-clamp-1 text-center font-medium ${selectedKho?.maKho === kho.maKho ? 'text-red-100' : 'text-slate-500'}`}>{kho.tenKho}</span>
                            <span className={`text-4xl font-black mb-3 drop-shadow-sm ${selectedKho?.maKho === kho.maKho ? 'text-white' : 'text-red-600'}`}>{kho.nhomMauString}</span>
                            <div className="flex items-center justify-between w-full px-3 py-1 bg-white rounded-md border border-red-100 text-sm shadow-inner">
                                <span className="text-slate-500 font-medium">Tồn:</span>
                                <span className={`font-black ${kho.tinhTrang === 'CanKiet' ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {kho.soLuongTon} <span className="text-xs font-normal text-slate-400">đv</span>
                                </span>
                            </div>
                        </div>
                    ))}
                    {khoMaus.length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-500 italic flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-4xl opacity-50">inventory_2</span>
                            Bệnh viện chưa có dữ liệu tồn kho.
                        </div>
                    )}
                </div>
            </div>

            {/* Khu vực Quét Mã & Xử lý */}
            <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Cột trái: Quét mã & Thông tin túi máu */}
                <div className="flex-1 max-w-xl flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-600">qr_code_scanner</span>
                            Nhập kho bằng mã túi máu
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Nhập hoặc quét mã vạch trên nhãn túi máu đã qua Xét nghiệm Vi sinh để xem chi tiết và thực hiện phân bổ tự động vào kho tương ứng.
                        </p>
                        
                        <form onSubmit={handleScan} className="flex gap-2 pt-2">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">barcode</span>
                                <input
                                    type="text"
                                    value={maTuiMau}
                                    onChange={(e) => setMaTuiMau(e.target.value)}
                                    placeholder="Ví dụ: TM00101"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-mono tracking-wider"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !maTuiMau}
                                className="px-6 bg-slate-800 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md active:scale-95"
                            >
                                {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Kiểm tra'}
                            </button>
                        </form>
                    </div>

                    {/* Ticket Details */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 relative overflow-hidden shadow-inner flex-1 flex flex-col">
                        {/* Background decoration */}
                        <div className="absolute -right-6 -top-6 text-slate-100 opacity-50 pointer-events-none">
                            <span className="material-symbols-outlined" style={{ fontSize: '150px' }}>water_drop</span>
                        </div>

                        {!tuiMau ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 relative z-10 min-h-[250px]">
                                <span className="material-symbols-outlined text-6xl opacity-30 animate-pulse">document_scanner</span>
                                <p className="font-medium text-sm">Chưa có thông tin túi máu</p>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-start border-b border-slate-200 border-dashed pb-4">
                                    <div>
                                        <h4 className="font-black text-slate-800 text-xl font-mono tracking-wider">{tuiMau.maTuiMau}</h4>
                                        <div className="mt-1">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                                tuiMau.trangThaiHienTai === 'DaLuuKho' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'
                                            }`}>
                                                {tuiMau.trangThaiHienTai}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-3xl font-black text-red-600 drop-shadow-sm">{tuiMau.nhomMau}</div>
                                        <div className="text-sm font-bold text-slate-600 bg-white px-2 py-0.5 rounded shadow-sm border mt-1">{tuiMau.theTich} ml</div>
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm text-slate-700">
                                    <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Người hiến:</span> <b className="text-slate-900">{tuiMau.tenTinhNguyenVien}</b></p>
                                    <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Chiến dịch:</span> <span className="text-right font-medium max-w-[200px] truncate">{tuiMau.tenChienDich}</span></p>
                                    <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Ngày tiếp nhận:</span> <span>{tuiMau.thoiGianLay}</span></p>
                                    <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Vi sinh:</span> 
                                        <span className={`font-bold ${tuiMau.ketQuaViSinh.includes('ĐẠT') ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {tuiMau.ketQuaViSinh}
                                        </span>
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-3 mt-4">
                                    <button
                                        onClick={handleImport}
                                        disabled={tuiMau.trangThaiHienTai === 'DaLuuKho' || !tuiMau.ketQuaViSinh.includes('ĐẠT')}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-lg">login</span> Xác nhận nhập kho
                                    </button>
                                    <button
                                        onClick={handleReportIssue}
                                        className="px-4 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                                        title="Yêu cầu xét nghiệm / kiểm tra lại"
                                    >
                                        <span className="material-symbols-outlined text-lg">warning</span>
                                    </button>
                                </div>
                                
                                {(tuiMau.trangThaiHienTai === 'DaLuuKho' || !tuiMau.ketQuaViSinh.includes('ĐẠT')) && (
                                    <p className="text-xs text-center text-red-500 mt-2 font-medium">
                                        {tuiMau.trangThaiHienTai === 'DaLuuKho' ? '* Túi máu này đã được lưu kho' : '* Túi máu không đạt tiêu chuẩn vi sinh'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột phải: Danh sách túi máu của kho đang chọn */}
                <div className="flex-[2] bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[500px]">
                    {!selectedKho ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <span className="material-symbols-outlined text-6xl opacity-30">inventory_2</span>
                            <p className="font-medium text-center">Bấm vào một Kho máu ở phía trên<br/>để xem danh sách túi máu đang có</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-4 border-b pb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-3 h-8 bg-red-600 rounded-full"></span>
                                    {selectedKho.tenKho}
                                </h3>
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm">
                                    {bloodUnits.filter(u => u.nhomMau === selectedKho.nhomMauString && u.trangThai === "DaLuuKho").length} túi máu
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-3">
                                    {bloodUnits.filter(u => u.nhomMau === selectedKho.nhomMauString && u.trangThai === "DaLuuKho").length === 0 ? (
                                        <div className="py-10 text-center text-slate-500 italic bg-slate-50 rounded-xl border border-dashed">
                                            Kho máu này hiện đang trống.
                                        </div>
                                    ) : (
                                        bloodUnits
                                            .filter(u => u.nhomMau === selectedKho.nhomMauString && u.trangThai === "DaLuuKho")
                                            .map(u => (
                                                <div key={u.maTuiMau} className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                                            <span className="material-symbols-outlined">water_drop</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 font-mono tracking-wider">{u.maTuiMau}</h4>
                                                            <p className="text-xs text-slate-500 mt-1">Người hiến: <b>{u.tenTinhNguyenVien}</b></p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-red-600">{u.nhomMau}</div>
                                                        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1">{u.theTich} ml</div>
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
        </div>
    );
};

export default QuanLyNhapKhoQuetMa;
