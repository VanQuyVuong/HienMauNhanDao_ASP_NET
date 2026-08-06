import React, { useState, useEffect } from 'react';
import http from '../../utils/http';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function QuanLyKhoBenhVien() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan', 'my-hospital', 'all-hospitals'
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedUnit, setScannedUnit] = useState(null);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Hospital Profile & Inventory State
  const [hospitalInfo, setHospitalInfo] = useState({
    maKhoa: 'BV01',
    tenBenhVien: 'Bệnh viện C Đà Nẵng',
    nhanVienQuanLy: 'Cán bộ Kho Máu',
    maNhanVien: 'NV00012'
  });
  const [stats, setStats] = useState({ tongSoTui: 0, tongTheTich: 0 });
  const [bloodUnits, setBloodUnits] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [loadingHospital, setLoadingHospital] = useState(true);

  // Load Bệnh viện công tác & Kho tồn
  const fetchMyHospitalData = async () => {
    try {
      setLoadingHospital(true);
      const res = await http.get('/khomaubenhvien/my-hospital');
      if (res?.success) {
        setHospitalInfo(res.hospital || {});
        setStats(res.stats || { tongSoTui: 0, tongTheTich: 0 });
        setBloodUnits(res.bloodUnits || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Kho Bệnh viện:', err);
    } finally {
      setLoadingHospital(false);
    }
  };

  // Load Tổng quan tất cả các kho Bệnh viện khác
  const fetchAllHospitalsData = async () => {
    try {
      const res = await http.get('/khomaubenhvien/all-hospitals');
      if (res?.success) {
        setAllHospitals(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu tất cả các kho:', err);
    }
  };

  useEffect(() => {
    fetchMyHospitalData();
    fetchAllHospitalsData();
  }, []);

  // Xử lý truy vấn túi máu theo mã vạch Barcode / Mã túi nhập tay
  const handleScanBarcode = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) {
      toast.warning('Vui lòng nhập hoặc quét mã túi máu!');
      return;
    }

    try {
      setSearching(true);
      setScannedUnit(null);
      const res = await http.get(`/khomaubenhvien/scan-blood-unit/${barcodeInput.trim()}`);
      if (res?.success) {
        setScannedUnit(res.data);
        toast.success(`✓ Đã tìm thấy túi máu ${res.data.maTuiMau}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Không tìm thấy túi máu "${barcodeInput.trim()}". Vui lòng kiểm tra lại!`;
      Swal.fire({
        icon: 'error',
        title: 'Không Tìm Thấy Túi Máu',
        text: msg,
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSearching(false);
    }
  };

  // Xử lý 1-Click Nhập Kho Bệnh viện
  const handleConfirmImport = async () => {
    if (!scannedUnit) return;

    const result = await Swal.fire({
      title: `Nhập Kho ${hospitalInfo.tenBenhVien}?`,
      text: `Xác nhận lưu trữ túi máu ${scannedUnit.maTuiMau} (${scannedUnit.nhomMau} - ${scannedUnit.theTich}ml) vào Kho Máu của ${hospitalInfo.tenBenhVien}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✓ Xác Nhận Nhập Kho',
      cancelButtonText: 'Hủy bỏ',
      confirmButtonColor: '#e11d48'
    });

    if (result.isConfirmed) {
      try {
        setImporting(true);
        const res = await http.post('/khomaubenhvien/import', {
          maTuiMau: scannedUnit.maTuiMau,
          ghiChu: `Nhập kho bởi ${hospitalInfo.nhanVienQuanLy}`
        });

        if (res?.success) {
          Swal.fire({
            icon: 'success',
            title: 'Thành Công!',
            text: res.message,
            timer: 2000,
            showConfirmButton: false
          });
          setScannedUnit(null);
          setBarcodeInput('');
          fetchMyHospitalData(); // Reload danh sách kho
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nhập kho.');
      } finally {
        setImporting(false);
      }
    }
  };

  // Xử lý Báo hỏng / Yêu cầu kiểm tra
  const handleReportIssue = async (actionType) => {
    if (!scannedUnit) return;

    const { value: reason } = await Swal.fire({
      title: actionType === 'HUY' ? 'Báo Hỏng / Hủy Túi Máu' : 'Yêu Cầu Kiểm Tra Lại',
      input: 'textarea',
      inputLabel: 'Lý do sự cố (VD: Túi bị nứt vỡ, đông máu, lỗi nhãn...)',
      inputPlaceholder: 'Ghi rõ lý do tại đây...',
      showCancelButton: true,
      confirmButtonText: 'Gửi Báo Cáo',
      cancelButtonText: 'Hủy',
      confirmButtonColor: actionType === 'HUY' ? '#dc2626' : '#d97706',
      inputValidator: (val) => {
        if (!val) return 'Vui lòng nhập lý do sự cố!';
      }
    });

    if (reason) {
      try {
        const res = await http.post('/khomaubenhvien/report-issue', {
          maTuiMau: scannedUnit.maTuiMau,
          lyDo: reason,
          hanhDong: actionType
        });

        if (res?.success) {
          toast.info(res.message);
          setScannedUnit(null);
          setBarcodeInput('');
          fetchMyHospitalData();
        }
      } catch (err) {
        toast.error('Lỗi khi gửi báo cáo sự cố.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-rose-900/15 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-rose-100 border border-white/20">
              <span className="material-symbols-outlined text-sm">local_hospital</span>
              <span>KHO MÁU BỆNH VIỆN CÔNG TÁC</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{hospitalInfo.tenBenhVien}</h1>
            <p className="text-rose-100 text-xs md:text-sm font-medium">
              Quản lý lưu trữ & Quét mã vạch Barcode nhập kho trực tiếp cho cán bộ: <span className="font-bold text-white uppercase">{hospitalInfo.nhanVienQuanLy}</span> ({hospitalInfo.maNhanVien})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[130px]">
              <p className="text-[11px] font-extrabold uppercase text-rose-200 tracking-wider">Tồn Kho Bệnh Viện</p>
              <p className="text-2xl md:text-3xl font-black text-white mt-1">{stats.tongSoTui} <span className="text-xs font-normal">túi</span></p>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[130px]">
              <p className="text-[11px] font-extrabold uppercase text-rose-200 tracking-wider">Tổng Thể Tích</p>
              <p className="text-2xl md:text-3xl font-black text-white mt-1">{stats.tongTheTich} <span className="text-xs font-normal">ml</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2 shadow-sm flex flex-col md:flex-row gap-2">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-xs md:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
              : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
          <span>🔍 Quét Mã Barcode & Nhập Kho Trực Tiếp</span>
        </button>

        <button
          onClick={() => setActiveTab('my-hospital')}
          className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-xs md:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === 'my-hospital'
              ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
              : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">inventory_2</span>
          <span>🩸 Kho Túi Máu {hospitalInfo.tenBenhVien}</span>
          <span className="px-2 py-0.5 text-xs font-mono font-black rounded-full bg-white text-rose-700 border border-white shadow-xs">
            {bloodUnits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all-hospitals')}
          className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-xs md:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === 'all-hospitals'
              ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
              : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">visibility</span>
          <span>🌐 Xem Tồn Kho Các Bệnh Viện Khác</span>
        </button>
      </div>

      {/* TAB 1: QUÉT MÃ BARCODE & NHẬP KHO TRỰC TIẾP */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-rose-600 animate-pulse">barcode_reader</span>
                <h2 className="text-xl font-black text-slate-800">Nhập Hoặc Quét Mã Vạch Barcode Túi Máu</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Gõ mã túi máu (VD: <code className="bg-slate-100 text-rose-700 px-1.5 py-0.5 rounded font-mono font-bold">TM00030</code>, <code className="bg-slate-100 text-rose-700 px-1.5 py-0.5 rounded font-mono font-bold">TM00031</code>) hoặc sử dụng đầu quét vạch Barcode để lấy thông tin tức thì.
                </p>
              </div>

              <form onSubmit={handleScanBarcode} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">qr_code_scanner</span>
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Nhập hoặc quét mã barcode (TMxxxxxx)..."
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-mono font-bold outline-none focus:border-rose-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 h-12 bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md hover:from-rose-700 hover:to-red-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  <span>{searching ? 'Đang truy vấn...' : 'Truy Vấn Túi Máu'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* CARD KẾT QUẢ TRUY VẤN TÚI MÁU REALTIME */}
          {scannedUnit && (
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 md:p-8 shadow-lg shadow-rose-900/5 animate-fade-in space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-black font-mono text-xl flex items-center justify-center shadow-md shrink-0">
                    {scannedUnit.nhomMau}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 font-mono">{scannedUnit.maTuiMau}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        <span>{scannedUnit.ketQuaViSinh}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Mã đơn: <span className="font-bold text-slate-700">{scannedUnit.maDon}</span> • Thu thuộc: <span className="font-bold text-slate-700">{scannedUnit.tenChienDich}</span></p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thể Tích Máu</p>
                  <p className="text-2xl font-black text-rose-600">{scannedUnit.theTich} ml</p>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tình Nguyện Viên</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5">{scannedUnit.tenTinhNguyenVien}</p>
                  <p className="text-slate-500 text-[11px]">CCCD: {scannedUnit.soCCCD || '---'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Thời Gian Lay Mau</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{scannedUnit.thoiGianLay || '---'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hạn Sử Dụng Nhan Dinh</p>
                  <p className="text-sm font-black text-amber-600 mt-0.5">{scannedUnit.ngayHetHan || '365 ngày'}</p>
                </div>
              </div>

              {/* NÚT THAO TÁC TRỰC TIẾP */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleReportIssue('KIEM_TRA')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 font-extrabold text-xs hover:bg-amber-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>Yêu Cầu Kiểm Tra Lại</span>
                </button>

                <button
                  onClick={() => handleReportIssue('HUY')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 font-extrabold text-xs hover:bg-rose-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">delete_forever</span>
                  <span>Báo Hỏng / Hủy Túi</span>
                </button>

                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs md:text-sm rounded-xl shadow-lg shadow-rose-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">move_to_inbox</span>
                  <span>{importing ? 'Đang Nhập Kho...' : `Xác Nhận Nhập Kho ${hospitalInfo.tenBenhVien}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KHO TÚI MÁU BỆNH VIỆN CÔNG TÁC */}
      {activeTab === 'my-hospital' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600">inventory</span>
              <span>Danh Sách Túi Máu Đã Lưu Kho tại {hospitalInfo.tenBenhVien}</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">Tổng: {bloodUnits.length} túi máu</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="p-3.5">Mã Túi Máu</th>
                  <th className="p-3.5">Tình Nguyện Viên</th>
                  <th className="p-3.5">Nhóm Máu</th>
                  <th className="p-3.5">Thể Tích</th>
                  <th className="p-3.5">Chiến Dịch</th>
                  <th className="p-3.5">Hạn Sử Dụng</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bloodUnits.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      Chưa có túi máu nào được lưu trong Kho Bệnh viện này.
                    </td>
                  </tr>
                ) : (
                  bloodUnits.map((u, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                      <td className="p-3.5 font-mono font-black text-rose-700">{u.maTuiMau}</td>
                      <td className="p-3.5 font-bold text-slate-800">{u.tenTinhNguyenVien}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full font-mono font-black bg-rose-100 text-rose-700">
                          {u.nhomMau}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">{u.theTich} ml</td>
                      <td className="p-3.5 text-slate-600">{u.tenChienDich}</td>
                      <td className="p-3.5 font-bold text-amber-600">{u.ngayHetHan}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">
                          Đã Lưu Kho
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: XEM TỒN KHO TẤT CẢ CÁC BỆNH VIỆN KHÁC (QUYỀN XEM) */}
      {activeTab === 'all-hospitals' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">domain</span>
              <span>Tổng Quan Tồn Kho Tất Cả Các Bệnh Viện (Quyền Xem)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Dữ liệu tồn kho công khai để các Bệnh viện hỗ trợ điều phối túi máu cấp cứu kịp thời.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allHospitals.map((h, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="font-extrabold text-slate-800 text-sm">{h.tenBenhVien}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-rose-600 text-white">
                    {h.tongSoTuiTon} túi
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Nhóm A</p>
                    <p className="text-rose-600 font-black">{h.soLuongA}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Nhóm B</p>
                    <p className="text-rose-600 font-black">{h.soLuongB}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Nhóm O</p>
                    <p className="text-rose-600 font-black">{h.soLuongO}</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Nhóm AB</p>
                    <p className="text-rose-600 font-black">{h.soLuongAB}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
