import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { donDangKyService } from '../services/donDangKy';
import Swal from 'sweetalert2';

export default function XacNhanDangKy() {
  const navigate = useNavigate();
  const { maDon } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentMaDon = maDon || localStorage.getItem('maDon');
    if (!currentMaDon) {
      navigate('/chiendich');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await donDangKyService.getById(currentMaDon);
        setData(response.data || response);
      } catch (error) {
        console.error("Error fetching detail", error);
        navigate('/chiendich');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Clear local storage after successful fetch if it's the confirmation flow
    if (!maDon && currentMaDon) {
      setTimeout(() => {
        localStorage.removeItem('selectedCampaign');
        localStorage.removeItem('thongTinCaNhan');
        localStorage.removeItem('healthAnswers');
        localStorage.removeItem('moTaKhac');
        localStorage.removeItem('tinhNguyenVienId');
        localStorage.removeItem('maDon');
      }, 5000);
    }
  }, [maDon, navigate]);

  const handleCancel = () => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn có thực sự muốn hủy đơn đăng ký này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, hủy ngay!',
      cancelButtonText: 'Không'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await donDangKyService.cancel(data.maDon);
          setData(prev => ({ ...prev, trangThai: 'DA_HUY' }));
          Swal.fire('Đã hủy!', 'Đơn đăng ký của bạn đã được hủy.', 'success');
        } catch (error) {
          console.error('Error canceling registration:', error);
          Swal.fire('Lỗi!', 'Có lỗi xảy ra khi hủy đơn đăng ký.', 'error');
        }
      }
    });
  };

  const handleRegisterAgain = () => {
    if (data && data.chienDich) {
      localStorage.setItem('selectedCampaign', JSON.stringify(data.chienDich));
      navigate('/khai-bao-thong-tin-ca-nhan');
    }
  };

  if (loading || !data || !data.tinhNguyenVien || !data.chienDich) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-slate-500">Đang tải...</div>
      </div>
    );
  }

  const thongTinCaNhan = data.tinhNguyenVien;
  const selectedCampaign = data.chienDich;
  const theTich = data.theTich ? data.theTich.toString().replace('ML_', '') : '';
  const isCancelled = data.trangThai === 'DA_HUY';
  const isRegistered = data.trangThai === 'DA_DANG_KY';

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 mt-2 sm:mt-8 mb-16 flex justify-center">
      <div className="bg-white w-full max-w-[700px] md:border md:border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`h-36 flex flex-col items-center justify-center text-white px-6 text-center relative overflow-hidden ${isCancelled ? 'bg-gradient-to-br from-slate-500 to-slate-700' : 'bg-gradient-to-br from-green-600 to-green-800'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 z-10 backdrop-blur-sm">
            <span className="material-symbols-outlined text-2xl text-white">{isCancelled ? 'cancel' : 'check_circle'}</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight relative z-10">{isCancelled ? 'ĐƠN ĐÃ HỦY' : 'ĐĂNG KÝ THÀNH CÔNG'}</h3>
          <p className="text-[11px] opacity-80 mt-1 uppercase tracking-widest font-bold relative z-10">Chi tiết phiếu đăng ký hiến máu</p>
        </div>

        <div className="p-4 sm:p-8 flex flex-col items-center">

          {/* Registration Code */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-slate-500 mb-1">Mã đăng ký của bạn</p>
            <p className={`text-3xl font-black tracking-[0.2em] px-6 py-2 rounded-xl border ${isCancelled ? 'text-slate-500 bg-slate-50 border-slate-200 line-through' : 'text-primary bg-red-50 border-red-100'}`}>{data.maDon}</p>
          </div>

          {/* Warning Box */}
          {!isCancelled && (
            <div className="w-full p-4 bg-yellow-50 border border-yellow-100 rounded-md mb-8 flex gap-3 print:hidden">
              <span className="material-symbols-outlined text-yellow-600 shrink-0">tips_and_updates</span>
              <p className="text-[12px] text-yellow-800 leading-normal font-medium">Vui lòng chụp màn hình hoặc ghi lại mã đăng ký này và xuất trình tại quầy tiếp đón để được làm thủ tục nhanh nhất.</p>
            </div>
          )}

          {/* Registration Form Summary */}
          <div className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-6 mb-8 relative ${isCancelled ? 'opacity-70' : ''}`}>
            <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Thông Tin Đăng Ký
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Họ và tên</span>
                <p className="text-sm font-bold text-slate-800">{thongTinCaNhan?.hoVaTen}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Số CCCD</span>
                <p className="text-sm font-bold text-slate-800">{thongTinCaNhan?.soCCCD}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Ngày sinh</span>
                <p className="text-sm font-bold text-slate-800">{thongTinCaNhan?.ngaySinh}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Giới tính</span>
                <p className="text-sm font-bold text-slate-800">{thongTinCaNhan?.gioiTinh}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Số điện thoại</span>
                <p className="text-sm font-bold text-slate-800">{thongTinCaNhan?.soDienThoai}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Địa chỉ cư trú</span>
                <p className="text-sm font-bold text-slate-800">{thongTinCaNhan?.diaChi}</p>
              </div>

              <div className="col-span-2 my-2"><div className="h-px w-full bg-slate-200"></div></div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Chiến dịch</span>
                <p className="text-sm font-bold text-slate-800">{selectedCampaign?.tenChienDich}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Dung tích hiến</span>
                <p className="text-sm font-bold text-primary bg-red-100 inline-block px-2 py-0.5 rounded-md">{theTich} ml</p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Thời gian</span>
                <p className="text-sm font-semibold text-slate-700">{new Date(selectedCampaign?.thoiGianBD).toLocaleString('vi-VN')}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Địa điểm</span>
                <p className="text-sm font-semibold text-slate-700">{selectedCampaign?.diaDiem?.tenDiaDiem}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center print:hidden">
            {!isCancelled && (
              <button
                onClick={() => window.print()}
                className="w-full sm:w-40 h-12 border border-slate-200 bg-white rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                IN PHIẾU
              </button>
            )}

            {isRegistered && (
              <button
                onClick={handleCancel}
                className="w-full sm:w-40 h-12 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">cancel</span>
                HỦY ĐƠN
              </button>
            )}

            {isCancelled && (
              <button
                onClick={handleRegisterAgain}
                className="w-full sm:w-48 h-12 bg-primary text-white rounded-md text-sm font-bold hover:bg-red-800 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-lg">replay</span>
                ĐĂNG KÝ LẠI
              </button>
            )}

            <button
              onClick={() => navigate('/don-dang-ky')}
              className="w-full sm:w-48 h-12 bg-slate-800 text-white rounded-md text-sm font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              VỀ DANH SÁCH
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
