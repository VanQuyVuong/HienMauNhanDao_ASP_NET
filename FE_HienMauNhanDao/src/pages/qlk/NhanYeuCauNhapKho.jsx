import React, { useState, useEffect } from 'react';
import http from '../../utils/http';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function NhanYeuCauNhapKho() {
  const [khoList, setKhoList] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingKho, setLoadingKho] = useState(false);
  
  const [selectedKho, setSelectedKho] = useState(null);
  const [selectedTuiMau, setSelectedTuiMau] = useState(null);

  const fetchKhoMau = async () => {
    try {
      setLoadingKho(true);
      const res = await http.get('/khomau');
      setKhoList(res);
      if (res.length > 0 && !selectedKho) {
        setSelectedKho(res[0]); // Chọn kho đầu tiên làm mặc định
      }
    } catch (err) {
      console.error('Lỗi tải danh sách kho:', err);
    } finally {
      setLoadingKho(false);
    }
  };

  const fetchBloodUnits = async () => {
    try {
      setLoading(true);
      const res = await http.get('/tuimau');
      console.log('Dữ liệu túi máu đã tải về:', res);
      setBloodUnits(res);
    } catch (err) {
      console.error('Lỗi tải dữ liệu túi máu:', err);
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

  const handleChapNhan = async (e, tm) => {
    e.stopPropagation();
    try {
      let maNhanVien = localStorage.getItem('maNV');
      if (!maNhanVien || maNhanVien === 'null' || maNhanVien === 'undefined') {
        maNhanVien = 'NV00012'; // Fallback an toàn cho tài khoản kiểm thử hoặc lỗi session
      }
      
      // Gọi API import túi máu
      await http.post('/phieunhapxuat/import', {
        maNhanVien: maNhanVien,
        maTuiMauList: [tm.maTuiMau]
      });
      toast.success(`Đã nhập kho thành công túi máu ${tm.maTuiMau}`);
      fetchData(); // Reload lại cả kho và túi máu để update số lượng
      setSelectedTuiMau(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi nhập kho.');
      console.error(err);
    }
  };

  const handleTuChoi = async (e, tm) => {
    e.stopPropagation();
  const result = await Swal.fire({
      title: "Xác nhận",
      text: `Bạn có chắc muốn trả túi máu ${tm.maTuiMau} về cho bộ phận xét nghiệm kiểm tra lại không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280"
  });

  if (!result.isConfirmed) return;
    try {
      await http.put(`/tuimau/${tm.maTuiMau}/status?status=Chờ xét nghiệm`);
      toast.success(`Đã trả túi máu ${tm.maTuiMau} về để kiểm tra lại.`);
      fetchBloodUnits(); // Chỉ cần reload túi máu
      setSelectedTuiMau(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi trả túi máu.');
      console.error(err);
    }
  };

  // Tính toán số lượng chờ duyệt theo kho (dựa trên nhóm máu của túi máu)
  const countYeuCau = (nhomMau) => {
    return bloodUnits.filter(tm => tm.nhomMau === nhomMau && tm.trangThai === "Yêu cầu nhập kho").length;
  };

  // Filter danh sách hiển thị
  const yeuCauList = bloodUnits.filter(tm => tm.nhomMau === selectedKho?.nhomMau && tm.trangThai === "Yêu cầu nhập kho");
  const daNhapList = bloodUnits.filter(tm => tm.nhomMau === selectedKho?.nhomMau && tm.trangThai === "Nhập kho");

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Nhận yêu cầu nhập kho</h2>
        <p className="text-slate-500 text-sm mt-1">Xử lý các túi máu đã xét nghiệm đạt yêu cầu từ phía Nhân viên y tế.</p>
      </div>

        {/* VÙNG MÀU HỒNG: Danh sách Kho */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              Danh Sách Kho Máu
            </h2>
            <span className="text-[10px] text-rose-500 font-medium italic">Chọn kho để xem chi tiết</span>
          </div>
          
          {loadingKho ? (
            <div className="text-center py-2 text-rose-600 animate-pulse text-xs">Đang tải danh sách kho...</div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {khoList.map(kho => {
                const isActive = selectedKho?.maKho === kho.maKho;
                const yeuCauCount = countYeuCau(kho.nhomMau);
                return (
                  <button
                    key={kho.maKho}
                    onClick={() => setSelectedKho(kho)}
                    className={`p-2.5 rounded-xl border transition-all text-left bg-white relative group ${
                      isActive 
                        ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200 shadow-sm' 
                        : 'border-slate-100 hover:border-rose-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Badge thông báo số lượng chờ xử lý */}
                    {yeuCauCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce z-10">
                        {yeuCauCount}
                      </span>
                    )}

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-rose-600 text-[13px]">{kho.nhomMau}</span>
                        <span className="text-[9px] font-bold text-slate-400 group-hover:text-rose-400 transition-colors">{kho.maKho}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-700 truncate">Kho Nhóm {kho.nhomMau}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] bg-slate-50 p-1 rounded-md">
                        <span className="text-slate-400 font-medium">Tồn:</span>
                        <span className="font-black text-slate-800">{kho.soLuongTon}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedKho && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VÙNG MÀU XANH LÁ: Danh sách Yêu cầu */}
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-emerald-200 pb-4">
                <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined">inbox</span>
                  Yêu cầu nhập (Kho Nhóm {selectedKho.nhomMau})
                </h2>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                  Đang chờ xử lý ({yeuCauList.length})
                </span>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-10 text-emerald-600 animate-pulse font-bold">Đang tải dữ liệu...</div>
                ) : yeuCauList.length === 0 ? (
                  <div className="text-center py-10 text-emerald-600 bg-white/60 rounded-xl font-medium border border-emerald-100">
                    Không có yêu cầu nhập kho nào.
                  </div>
                ) : (
                  yeuCauList.map(tm => {
                    const isExpanded = selectedTuiMau?.maTuiMau === tm.maTuiMau;
                    return (
                      <div 
                        key={tm.maTuiMau} 
                        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer ${
                          isExpanded ? 'border-purple-300 ring-2 ring-purple-100' : 'border-emerald-100 hover:border-emerald-300'
                        }`}
                        onClick={() => setSelectedTuiMau(isExpanded ? null : tm)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-lg">
                              {tm.nhomMau}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-lg">{tm.maTuiMau}</div>
                              <div className="text-sm text-slate-500 mt-1">Người hiến: {tm.tenTinhNguyenVien} • {tm.theTich}ml</div>
                              <div className="text-xs text-slate-400 mt-1">Lấy máu lúc: {new Date(tm.thoiGianLayMau).toLocaleString('vi-VN')}</div>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-400">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>

                        {/* Nút Options xổ ra */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3 animate-[slideDown_0.3s_ease-out]">
                            <button 
                              onClick={(e) => handleTuChoi(e, tm)}
                              className="flex-1 py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">warning</span>
                              Yêu cầu kiểm tra lại
                            </button>
                            <button 
                              onClick={(e) => handleChapNhan(e, tm)}
                              className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-md transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">check_circle</span>
                              Chấp nhận nhập kho
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* VÙNG MÀU XANH DƯƠNG: Đã nhập kho */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 shadow-sm h-fit">
              <div className="border-b border-blue-200 pb-4 mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <span className="material-symbols-outlined">inventory</span>
                  Túi máu đã nhập (Kho Nhóm {selectedKho.nhomMau})
                </h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{daNhapList.length} túi</span>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {daNhapList.length === 0 ? (
                  <div className="text-center py-6 text-blue-500 font-medium">Kho này hiện đang trống hoặc chưa tải xong.</div>
                ) : (
                  daNhapList.map((tm) => (
                    <div key={tm.maTuiMau} className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                          {tm.nhomMau}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700">{tm.maTuiMau}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{tm.tenTinhNguyenVien} • Thể tích: {tm.theTich}ml</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-bold whitespace-nowrap mb-1">
                          Đã nhập kho
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(tm.thoiGianLayMau).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
