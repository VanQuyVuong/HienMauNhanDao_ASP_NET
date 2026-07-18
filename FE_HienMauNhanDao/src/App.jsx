import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDonDangKy from "./pages/AdminDonDangKy";
import AdminCreateCampaign from "./pages/AdminCreateCampaign";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKhoMau from "./pages/AdminKhoMau";
import KetQuaXetNghiem from "./pages/KetQuaXetNghiem";
import QuanLyNhapKho from "./pages/QuanLyNhapKho";
import AdminQuanLyNguoiDung from "./pages/AdminQuanLyNguoiDung";
import AdminQuanLyTNV from "./pages/AdminQuanLyTNV";
import NhanYeuCauNhapKho from "./pages/NhanYeuCauNhapKho";
import QuanLyNhapKhoTheoChienDich from "./pages/QuanLyNhapKhoTheoChienDich";
import OtpVerification from "./pages/OtpVerification";
import XacNhanDangKy from "./pages/XacNhanDangKy";
import QuanLyChienDich from "./pages/QuanLyChienDich";
import QuanLyNhapKhoQuetMa from "./pages/QuanLyNhapKhoQuetMa";
import ThongKeTonKho from "./pages/ThongKeTonKho";
import QuanLyHanDung from "./pages/QuanLyHanDung";
import KhamLamSang from "./pages/KhamLamSang";
import ThuNhanMau from "./pages/ThuNhanMau";
import HomePage from "./pages/HomePage";
import MyDonations from "./pages/MyDonations";
import GiayChungNhan from "./pages/GiayChungNhan";
import AboutPage from "./pages/AboutPage";
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
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OtpVerification />} />
        <Route path="/about" element={<AboutPage />} />

        {/* === CÁC ROUTE CỦA TÌNH NGUYỆN VIÊN (YÊU CẦU ĐĂNG NHẬP) === */}
        <Route
          path="/dashboard"
          element={baoVeDangNhap({ children: <Dashboard /> })}
        />
        <Route
          path="/profile"
          element={baoVeDangNhap({ children: <UserProfile /> })}
        />
        <Route
          path="/xac-nhan-dang-ky/:maDon"
          element={baoVeDangNhap({ children: <XacNhanDangKy /> })}
        />
        <Route
          path="/lich-su"
          element={baoVeDangNhap({ children: <MyDonations /> })}
        />
        <Route
          path="/chung-nhan/:maDon"
          element={baoVeDangNhap({ children: <GiayChungNhan /> })}
        />

        {/* === CÁC ROUTE DÀNH CHO ADMIN === */}
        <Route
          path="/admin-users"
          element={baoVeAdmin({ children: <AdminQuanLyNguoiDung /> })}
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
          element={baoVeAdmin({ children: <AdminQuanLyTNV /> })}
        />
        <Route
          path="/admin-thong-ke"
          element={baoVeAdmin({ children: <AdminDashboard /> })}
        />

        {/* === CÁC ROUTE DÀNH CHO NHÂN VIÊN Y TẾ (NVYT) === */}
        <Route
          path="/admin-don"
          element={baoVeNhanVienYTe({ children: <AdminDonDangKy /> })}
        />
        <Route
          path="/admin-thu-nhan-mau"
          element={baoVeNhanVienYTe({ children: <ThuNhanMau /> })}
        />

        {/* === CÁC ROUTE DÀNH CHO BÁC SĨ (BS) === */}
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
