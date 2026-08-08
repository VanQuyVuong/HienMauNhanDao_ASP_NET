import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminHospitalDashboard() {
  const [activeTab, setActiveTab] = useState("staff");

  const TABS = [
    { id: "staff", label: "Quản lý Nhân sự", icon: "badge" },
    { id: "stock", label: "Quản lý Kho máu", icon: "bloodtype" },
    { id: "news", label: "Đăng Tin tức", icon: "article" },
    { id: "notification", label: "Gửi Thông báo", icon: "notifications_active" },
    { id: "campaign", label: "Tạo Chiến dịch", icon: "event" },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
            Bảng điều khiển Bệnh viện
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Quản lý nội bộ, kho máu, thông báo và chiến dịch.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold ${
              activeTab === tab.id
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                : "bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 shadow-sm overflow-y-auto custom-scrollbar">
        {activeTab === "staff" && <StaffTab />}
        {activeTab === "stock" && <StockTab />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "notification" && <NotificationTab />}
        {activeTab === "campaign" && <CampaignTab />}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 1: QUẢN LÝ NHÂN SỰ
// ----------------------------------------------------
function StaffTab() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5037/api/AdminHospital/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách nhân sự");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10 text-slate-500">Đang tải...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Danh sách Nhân sự Nội bộ</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staffList.map((staff, idx) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 relative overflow-hidden group hover:border-rose-200 transition-colors">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/5 rounded-full group-hover:scale-150 transition-transform" />
            <h3 className="font-bold text-slate-800 text-lg">{staff.hoTen}</h3>
            <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg w-max">
              {staff.role}
            </span>
            <div className="text-sm text-slate-600 mt-2 space-y-1">
              <p>Email: {staff.email}</p>
              <p>SĐT: {staff.soDienThoai}</p>
              <p>CCCD: {staff.cccd}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 2: QUẢN LÝ KHO MÁU
// ----------------------------------------------------
function StockTab() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5037/api/AdminHospital/stock", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStocks(res.data);
      } catch (err) {
        toast.error("Lỗi tải thông tin kho máu");
      }
    };
    fetchStock();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Tình trạng Kho máu</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stocks.map((s, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-1 items-center text-center ${s.alert ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <span className="text-4xl font-black bg-gradient-to-br from-rose-500 to-rose-700 bg-clip-text text-transparent drop-shadow-sm">
              {s.nhomMau?.replace("_positive", "+").replace("_negative", "-")}
            </span>
            <p className="text-2xl font-bold text-slate-800 mt-2">{s.soLuongTon} <span className="text-sm font-normal text-slate-500">túi</span></p>
            <p className="text-xs text-slate-500 font-medium">Ngưỡng: {s.nguongAnToan}</p>
            {s.alert && (
              <span className="mt-2 text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse">
                Cảnh báo Thiếu
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 3: ĐĂNG TIN TỨC
// ----------------------------------------------------
function NewsTab() {
  const [form, setForm] = useState({ TieuDe: "", NoiDung: "", HinhAnh: "news_default.jpg" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5037/api/AdminHospital/news", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Đăng tin tức thành công!");
      setForm({ TieuDe: "", NoiDung: "", HinhAnh: "news_default.jpg" });
    } catch (err) {
      toast.error("Lỗi khi đăng tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Đăng Tin Tức Mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề</label>
          <input
            required
            type="text"
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring focus:ring-rose-200 outline-none transition"
            value={form.TieuDe}
            onChange={(e) => setForm({ ...form, TieuDe: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung</label>
          <textarea
            required
            rows={5}
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring focus:ring-rose-200 outline-none transition"
            value={form.NoiDung}
            onChange={(e) => setForm({ ...form, NoiDung: e.target.value })}
          />
        </div>
        <button
          disabled={loading}
          className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng bài ngay"}
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------
// TAB 4: GỬI THÔNG BÁO
// ----------------------------------------------------
function NotificationTab() {
  const [form, setForm] = useState({ NhomMau: "O_positive", NoiDung: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5037/api/AdminHospital/notification", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      setForm({ ...form, NoiDung: "" });
    } catch (err) {
      toast.error(err.response?.data || "Lỗi khi gửi thông báo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Gửi Thông Báo Khẩn</h2>
      <p className="text-sm text-slate-500">Hệ thống sẽ tự động tìm các TNV có nhóm máu yêu cầu và gửi tin nhắn đẩy.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Chọn Nhóm Máu</label>
          <select
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
            value={form.NhomMau}
            onChange={(e) => setForm({ ...form, NhomMau: e.target.value })}
          >
            <option value="A_positive">A+</option>
            <option value="A_negative">A-</option>
            <option value="B_positive">B+</option>
            <option value="B_negative">B-</option>
            <option value="O_positive">O+</option>
            <option value="O_negative">O-</option>
            <option value="AB_positive">AB+</option>
            <option value="AB_negative">AB-</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung thông báo</label>
          <textarea
            required
            rows={4}
            placeholder="VD: Kho máu O+ của BV C đang thiếu hụt trầm trọng. Xin mời các bạn đến hỗ trợ..."
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
            value={form.NoiDung}
            onChange={(e) => setForm({ ...form, NoiDung: e.target.value })}
          />
        </div>
        <button
          disabled={loading}
          className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Phát đi thông báo"}
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------
// TAB 5: TẠO CHIẾN DỊCH
// ----------------------------------------------------
function CampaignTab() {
  const [form, setForm] = useState({
    TenChienDich: "",
    ThoiGianBD: "",
    ThoiGianKT: "",
    SoLuongDuKien: 100,
    LoaiChienDich: "ThuongXuyen",
    ImageUrl: "default.jpg"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5037/api/AdminHospital/campaign", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Khởi tạo chiến dịch thành công");
      setForm({ ...form, TenChienDich: "", ThoiGianBD: "", ThoiGianKT: "" });
    } catch (err) {
      toast.error(err.response?.data || "Lỗi tạo chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Mở Đợt Tiếp Nhận Máu</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Tên Chiến dịch</label>
          <input required type="text" className="w-full p-3 rounded-xl border outline-none" value={form.TenChienDich} onChange={(e) => setForm({ ...form, TenChienDich: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Thời gian bắt đầu</label>
          <input required type="datetime-local" className="w-full p-3 rounded-xl border outline-none" value={form.ThoiGianBD} onChange={(e) => setForm({ ...form, ThoiGianBD: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Thời gian kết thúc</label>
          <input required type="datetime-local" className="w-full p-3 rounded-xl border outline-none" value={form.ThoiGianKT} onChange={(e) => setForm({ ...form, ThoiGianKT: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Số lượng dự kiến</label>
          <input required type="number" min="1" className="w-full p-3 rounded-xl border outline-none" value={form.SoLuongDuKien} onChange={(e) => setForm({ ...form, SoLuongDuKien: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Loại Hình</label>
          <select className="w-full p-3 rounded-xl border outline-none" value={form.LoaiChienDich} onChange={(e) => setForm({ ...form, LoaiChienDich: e.target.value })}>
            <option value="ThuongXuyen">Thường Xuyên</option>
            <option value="CoDinh">Cố Định</option>
            <option value="KhanCap">Khẩn Cấp</option>
          </select>
        </div>
        <div className="col-span-2 mt-4">
          <button disabled={loading} className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition disabled:opacity-50">
            Tạo chiến dịch
          </button>
        </div>
      </form>
    </div>
  );
}
