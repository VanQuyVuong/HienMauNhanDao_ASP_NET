import React from 'react';
import { useSearchParams } from 'react-router-dom';
import NhanYeuCauNhapKho from './NhanYeuCauNhapKho';
import QuanLyNhapKhoQuetMa from './QuanLyNhapKhoQuetMa';
import QuanLyNhapKhoTheoChienDich from './QuanLyNhapKhoTheoChienDich';

const QuanLyNhapKho = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'nhan-yeu-cau';

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-1">
        <button
          onClick={() => handleTabChange('nhan-yeu-cau')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'nhan-yeu-cau'
              ? 'bg-red-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50 hover:text-red-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">assignment_returned</span>
          <span>Nhận yêu cầu nhập kho</span>
        </button>

        <button
          onClick={() => handleTabChange('nhap-kho')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'nhap-kho'
              ? 'bg-red-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50 hover:text-red-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
          <span>Quét mã vạch & Nhập kho</span>
        </button>

        <button
          onClick={() => handleTabChange('chien-dich')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'chien-dich'
              ? 'bg-red-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50 hover:text-red-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">event_repeat</span>
          <span>Nhập kho theo chiến dịch</span>
        </button>
      </div>

      {/* Tab content wrapper */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {activeTab === 'nhan-yeu-cau' && <NhanYeuCauNhapKho />}
        {activeTab === 'nhap-kho' && <QuanLyNhapKhoQuetMa />}
        {activeTab === 'chien-dich' && <QuanLyNhapKhoTheoChienDich />}
      </div>
    </div>
  );
};

export default QuanLyNhapKho;
