import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserLayout from "./layouts/UserLayout";
import QuanLyKhoLayout from "./layouts/QuanLyKhoLayout";
import NVYTLayout from "./layouts/NVYTLayout";
import BacSiLayout from "./layouts/BacSiLayout";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import RegisterVolunteer from "./pages/RegisterVolunteer";
import OtpVerification from "./pages/OtpVerification";
import AboutPage from "./pages/AboutPage";
import ChienDichPage from "./pages/ChienDichPage";
import ThongTinCaNhan from "./pages/ThongTinCaNhan";
import KhaiBaoYTe from "./pages/KhaiBaoYTe";
import XacNhanDangKy from "./pages/XacNhanDangKy";
import GiayChungNhanPage from "./pages/GiayChungNhanPage";
import HoSoCaNhan from "./pages/HoSoCaNhan";
import NewsDetail from "./pages/NewsDetail";
import ThongKeTonKho from "./pages/qlk/ThongKeTonKho";
import QuanLyNhapKho from "./pages/qlk/QuanLyNhapKho";
import DanhSachDonDangKy from "./pages/DanhSachDonDangKy";
import DebugLogin from "./pages/qlk/DebugLogin";

// NVYT pages
import DonDangKy from "./pages/nvyt/DonDangKy";
import TinhNguyenVien from "./pages/nvyt/TinhNguyenVien";
import KhaiBaoYTeNVYT from "./pages/nvyt/KhaiBaoYTeNVYT";
import KhamLamSang from "./pages/bacsi/KhamLamSang";
import DanhSachChoKham from "./pages/bacsi/DanhSachChoKham";
import KetQuaXetNghiem from "./pages/bacsi/KetQuaXetNghiem";
import CapNhatXetNghiem from "./pages/nvyt/CapNhatXetNghiem";
import ThuNhanMau from "./pages/nvyt/ThuNhanMau"; // Trigger Vite reload
import QuanLyHanDung from "./pages/qlk/QuanLyHanDung";
import QuanLyKhoBenhVien from "./pages/qlk/QuanLyKhoBenhVien";
import AdminLayout from "./layouts/AdminLayout";
import QuanLyNguoiDung from "./pages/admin/QuanLyNguoiDung";
import QuanLyChienDich from "./pages/admin/QuanLyChienDich";
import CapGiayChungNhan from "./pages/admin/CapGiayChungNhan";

import AdminHospitalLayout from "./layouts/AdminHospitalLayout";
import DashboardOverview from "./pages/adminHospital/DashboardOverview";
import ManageStaff from "./pages/adminHospital/ManageStaff";
import ManageStock from "./pages/adminHospital/ManageStock";
import ManageNews from "./pages/adminHospital/ManageNews";

const queryClient = new QueryClient();

// Guard: cho phép các vai trò NVYT (Lễ Tân & Xét Nghiệm) truy cập
function NvytGuard({ children }) {
  const role = (localStorage.getItem("role") || "").trim();
  const isNvytRole = ["NVYT", "NVYT_LT", "NVYT-LT", "NVYT_XN", "NVYT-XN"].includes(role);
  if (!isNvytRole) return <Navigate to="/login" replace />;
  return children;
}

function BacSiGuard({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "BS") return <Navigate to="/login" replace />;
  return children;
}

// Guard: chỉ cho phép role QLK (Quản lý kho) truy cập
function QlkGuard({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "QLK") return <Navigate to="/login" replace />;
  return children;
}

function AdminGuard({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "AD") return <Navigate to="/login" replace />;
  return children;
}

function AdminHospitalGuard({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "ADMIN_BV") return <Navigate to="/login" replace />;
  return children;
}

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("app") === "maui") {
      localStorage.setItem("isMobileApp", "true");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastContainer />
        <Routes>
          {/* ── Trang người dùng / tình nguyện viên ── */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterVolunteer />} />
            <Route path="otp" element={<OtpVerification />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="chiendich" element={<ChienDichPage />} />
            <Route path="tin-tuc/:id" element={<NewsDetail />} />
            <Route path="don-dang-ky" element={<DanhSachDonDangKy />} />
            <Route path="don-dang-ky-detail/:maDon" element={<XacNhanDangKy />}/>
            <Route path="khai-bao-thong-tin-ca-nhan"element={<ThongTinCaNhan />}/>
            <Route path="khai-bao-y-te" element={<KhaiBaoYTe />} />
            <Route path="xac-nhan-dang-ky" element={<XacNhanDangKy />} />
            <Route path="xac-nhan-dang-ky/:maDon" element={<XacNhanDangKy />} />
            <Route path="chung-nhan/:maDon" element={<GiayChungNhanPage />} />
            <Route path="ho-so" element={<HoSoCaNhan />} />
            <Route path="debug-login" element={<DebugLogin />} />
          </Route>
          {/* Quản Lý Kho Routes */}
          <Route path="/quan-ly-kho" element={<QlkGuard><QuanLyKhoLayout /></QlkGuard>}>
            <Route index element={<Navigate to="benh-vien" replace />} />
            <Route path="benh-vien" element={<QuanLyKhoBenhVien />} />
            <Route path="thong-ke" element={<ThongKeTonKho />} />
            <Route path="nhap-kho" element={<QuanLyNhapKho />} />
            <Route path="nhap-kho-chien-dich" element={<Navigate to="/quan-ly-kho/nhap-kho?tab=chien-dich" replace />} />
            <Route path="nhan-yeu-cau" element={<Navigate to="/quan-ly-kho/nhap-kho?tab=nhan-yeu-cau" replace />} />
            <Route path="quan-ly-han-dung" element={<QuanLyHanDung />} />
          </Route>

          {/* ── Trang bác sĩ (maVaiTro = BS trong TAIKHOAN) ── */}
          <Route path="/bac-si" element={<BacSiGuard><BacSiLayout /></BacSiGuard>}>
            <Route index element={<Navigate to="danh-sach-cho-kham" replace />}/>
            <Route path="danh-sach-cho-kham" element={<DanhSachChoKham />} />
            <Route path="kham-lam-sang" element={<KhamLamSang />} />
            <Route path="ket-qua-xet-nghiem" element={<KetQuaXetNghiem />} />
          </Route>

          {/* ── Trang Admin Toàn Hệ Thống ── */}
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<Navigate to="nguoi-dung" replace />} />
            <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
            <Route path="chien-dich" element={<QuanLyChienDich />} />
            <Route path="chung-nhan" element={<CapGiayChungNhan />} />
          </Route>

          {/* ── Trang Admin Bệnh Viện (Level 2) ── */}
          <Route path="/admin-bv" element={<AdminHospitalGuard><AdminHospitalLayout /></AdminHospitalGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="nhan-su" element={<ManageStaff />} />
            <Route path="kho-mau" element={<ManageStock />} />
            <Route path="tin-tuc" element={<ManageNews />} />
            <Route path="chien-dich" element={<QuanLyChienDich />} />
          </Route>

          {/* ── Trang nhân viên y tế ── */}
          <Route path="/nvyt" element={<NvytGuard><NVYTLayout /></NvytGuard>}>
            <Route index element={<Navigate to="don-dang-ky" replace />} />
            <Route path="don-dang-ky" element={<DonDangKy />} />
            <Route path="tinh-nguyen-vien" element={<TinhNguyenVien />} />
            <Route path="khai-bao-y-te" element={<KhaiBaoYTeNVYT />} />
            <Route path="cap-nhat-xet-nghiem" element={<CapNhatXetNghiem />} />
            <Route path="thu-nhan-mau" element={<ThuNhanMau />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
