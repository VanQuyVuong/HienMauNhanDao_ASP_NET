import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegisterVolunteer from "./pages/RegisterVolunteer";
import ChienDichPage from "./pages/tnv/ChienDichPage";
import DonDangKy from "./pages/nvyt/DonDangKy";
import AdminCreateCampaign from "./pages/admin/AdminCreateCampaign";
import HoSoCaNhan from "./pages/tnv/HoSoCaNhan";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminKhoMau from "./pages/qlk/AdminKhoMau";
import KetQuaXetNghiem from "./pages/bacsi/KetQuaXetNghiem";
import QuanLyNhapKho from "./pages/qlk/QuanLyNhapKho";
import QuanLyNguoiDung from "./pages/admin/QuanLyNguoiDung";
import TinhNguyenVien from "./pages/nvyt/TinhNguyenVien";
import NhanYeuCauNhapKho from "./pages/qlk/NhanYeuCauNhapKho";
import QuanLyNhapKhoTheoChienDich from "./pages/qlk/QuanLyNhapKhoTheoChienDich";
import OtpVerification from "./pages/OtpVerification";
import XacNhanDangKy from "./pages/tnv/XacNhanDangKy";
import QuanLyChienDich from "./pages/admin/QuanLyChienDich";
import QuanLyNhapKhoQuetMa from "./pages/qlk/QuanLyNhapKhoQuetMa";
import ThongKeTonKho from "./pages/qlk/ThongKeTonKho";
import QuanLyHanDung from "./pages/qlk/QuanLyHanDung";
import KhamLamSang from "./pages/bacsi/KhamLamSang";
import DanhSachChoKham from "./pages/bacsi/DanhSachChoKham";
import ThuNhanMau from "./pages/nvyt/ThuNhanMau";
import HomePage from "./pages/HomePage";
import DanhSachDonDangKy from "./pages/tnv/DanhSachDonDangKy";
import CampaignDetail from "./pages/tnv/CampaignDetail";
import GiayChungNhanPage from "./pages/tnv/GiayChungNhanPage";
import AboutPage from "./pages/AboutPage";
import KhaiBaoYTe from "./pages/tnv/KhaiBaoYTe";
import ThongTinCaNhan from "./pages/tnv/ThongTinCaNhan";
import DebugLogin from "./pages/qlk/DebugLogin";
import CapNhatXetNghiem from "./pages/nvyt/CapNhatXetNghiem";
// === CÁC HÀM BẢO VỆ ROUTE (ROUTE GUARDS) ===

// 1. Bảo vệ đăng nhập: Yêu cầu phải có token
function baoVeDangNhap({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 2. Bảo vệ Admin: Chỉ cho phép role AD
function baoVeAdmin({ children }) {
  const token = localStorage.getItem("token");
  const vaiTro = localStorage.getItem("role");
  if (!token || vaiTro !== "AD") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 3. Bảo vệ Nhân viên y tế: Cho phép NVYT hoặc AD
function baoVeNhanVienYTe({ children }) {
  const token = localStorage.getItem("token");
  const vaiTro = localStorage.getItem("role");
  if (!token || (vaiTro !== "NVYT" && vaiTro !== "AD")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 4. Bảo vệ Bác sĩ: Cho phép BS hoặc AD
function baoVeBacSi({ children }) {
  const token = localStorage.getItem("token");
  const vaiTro = localStorage.getItem("role");
  if (!token || (vaiTro !== "BS" && vaiTro !== "AD")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 5. Bảo vệ Thủ kho: Cho phép QLK hoặc AD
function baoVeThuKho({ children }) {
  const token = localStorage.getItem("token");
  const vaiTro = localStorage.getItem("role");
  if (!token || (vaiTro !== "QLK" && vaiTro !== "AD")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === CÁC ROUTE CÔNG KHAI (AI CŨNG XEM ĐƯỢC) === */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterVolunteer />} />
        <Route path="/otp" element={<OtpVerification />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/debug-login" element={<DebugLogin />} />

        {/* === CÁC ROUTE CỦA TÌNH NGUYỆN VIÊN (YÊU CẦU ĐĂNG NHẬP) === */}
        <Route
          path="/dashboard"
          element={baoVeDangNhap({ children: <ChienDichPage /> })}
        />
        <Route
          path="/profile"
          element={baoVeDangNhap({ children: <HoSoCaNhan /> })}
        />
        <Route
          path="/xac-nhan-dang-ky/:maDon"
          element={baoVeDangNhap({ children: <XacNhanDangKy /> })}
        />
        <Route
          path="/lich-su"
          element={baoVeDangNhap({ children: <DanhSachDonDangKy /> })}
        />
        <Route
          path="/chung-nhan/:maDon"
          element={baoVeDangNhap({ children: <GiayChungNhanPage /> })}
        />
        <Route
          path="/campaign-detail/:id"
          element={baoVeDangNhap({ children: <CampaignDetail /> })}
        />
        <Route
          path="/khai-bao-y-te/:maDon"
          element={baoVeDangNhap({ children: <KhaiBaoYTe /> })}
        />
        <Route
          path="/khai-bao-thong-tin-ca-nhan"
          element={baoVeDangNhap({ children: <ThongTinCaNhan /> })}
        />

        {/* === CÁC ROUTE DÀNH CHO ADMIN === */}
        <Route
          path="/admin-users"
          element={baoVeAdmin({ children: <QuanLyNguoiDung /> })}
        />
        <Route
          path="/admin-quan-ly-chien-dich"
          element={baoVeAdmin({ children: <QuanLyChienDich /> })}
        />
        <Route
          path="/admin-tao-cd"
          element={baoVeAdmin({ children: <AdminCreateCampaign /> })}
        />
        <Route
          path="/admin-volunteers"
          element={baoVeAdmin({ children: <TinhNguyenVien /> })}
        />
        <Route
          path="/admin-thong-ke"
          element={baoVeAdmin({ children: <AdminDashboard /> })}
        />

        {/* === CÁC ROUTE DÀNH CHO NHÂN VIÊN Y TẾ (NVYT) === */}
        <Route
          path="/admin-don"
          element={baoVeNhanVienYTe({ children: <DonDangKy /> })}
        />
        <Route
          path="/admin-thu-nhan-mau"
          element={baoVeNhanVienYTe({ children: <ThuNhanMau /> })}
        />
        <Route
          path="/admin-cap-nhat-xet-nghiem"
          element={baoVeNhanVienYTe({ children: <CapNhatXetNghiem /> })}
        />

        <Route
          path="/admin-cho-kham"
          element={baoVeBacSi({ children: <DanhSachChoKham /> })}
        />
        <Route
          path="/admin-kham-lam-sang"
          element={baoVeBacSi({ children: <KhamLamSang /> })}
        />
        <Route
          path="/admin-xet-nghiem"
          element={baoVeBacSi({ children: <KetQuaXetNghiem /> })}
        />

        {/* === CÁC ROUTE DÀNH CHO THỦ KHO MÁU (QLK) === */}
        <Route
          path="/admin-kho-mau"
          element={baoVeThuKho({ children: <AdminKhoMau /> })}
        />
        <Route
          path="/admin-nhap-kho"
          element={baoVeThuKho({ children: <QuanLyNhapKho /> })}
        />
        <Route
          path="/qlk-nhan-yeu-cau"
          element={baoVeThuKho({ children: <NhanYeuCauNhapKho /> })}
        />
        <Route
          path="/qlk-nhap-theo-chien-dich"
          element={baoVeThuKho({ children: <QuanLyNhapKhoTheoChienDich /> })}
        />
        <Route
          path="/admin-nhap-kho-quet-ma"
          element={baoVeThuKho({ children: <QuanLyNhapKhoQuetMa /> })}
        />
        <Route
          path="/admin-thong-ke-ton-kho"
          element={baoVeThuKho({ children: <ThongKeTonKho /> })}
        />
        <Route
          path="/admin-quan-ly-han-dung"
          element={baoVeThuKho({ children: <QuanLyHanDung /> })}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

