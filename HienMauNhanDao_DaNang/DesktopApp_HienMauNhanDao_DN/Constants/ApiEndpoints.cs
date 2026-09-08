namespace DesktopApp_HienMauNhanDao_DN.Constants
{
    public static class ApiEndpoints
    {
        // Nhớ đổi lại thành localhost hoặc Domain thật sau khi tắt ngrok nhé!
        public const string BaseUrl = "http://localhost:5236/api/";

        public static class Auth
        {
            public const string Login = "auth/login";
            public const string ChangePassword = "Auth/change-password";
        }

        public static class TaiKhoan
        {
            public const string GetAll = "TaiKhoan";
            public const string GetKhoaCongTac = "TaiKhoan/khoa-cong-tac";
            public const string Profile = "TaiKhoan/profile";
            public static string ById(object id) => $"TaiKhoan/{id}";
            public static string UpdateStatus(object id) => $"TaiKhoan/{id}/trang-thai";
            public static string ResetPassword(object id) => $"TaiKhoan/{id}/reset-password";
        }

        public static class ChienDich
        {
            public const string GetAll = "ChienDich";
            public static string ById(object id) => $"ChienDich/{id}";
        }

        public static class ChungNhan
        {
            public const string GetCandidates = "ChungNhan/candidates";
            public const string IssueAll = "ChungNhan/issue-all";
            public static string Issue(object id) => $"ChungNhan/issue/{id}";
        }

        public static class DiaDiem
        {
            public const string GetAll = "DiaDiem";
        }

        public static class DonDangKy
        {
            public const string Base = "DonDangKy";
            public const string GetAll = "DonDangKy/tat-ca";
            public const string GetChoThuNhan = "dondangky/cho-thu-nhan";
            public const string TiepNhan = "dondangky/tiep-nhan";
            public static string ByChienDich(object maChienDich) => $"DonDangKy/chien-dich/{maChienDich}";
        }

        public static class HoSoSucKhoe
        {
            public const string Base = "hososuckhoe";
            public const string GetAll = "hososuckhoe/tat-ca";
            public static string ById(object id) => $"hososuckhoe/{id}";
            public static string ByDon(object maDon) => $"hososuckhoe/don/{maDon}";
        }

        public static class KhamLamSang
        {
            public const string Base = "khamlamsang";
            public const string GetChoKham = "khamlamsang/cho-kham";
            public const string GetLichSu = "khamlamsang/lich-su";
        }

        public static class TuiMau
        {
            public const string Base = "tuimau";
            public const string GetExpiryStats = "tuimau/expiry-stats";
            public const string GetDashboardStats = "tuimau/dashboard/stats";
            public const string GetBarChart2026 = "tuimau/charts/bar?year=2026";
            public static string ById(object id) => $"tuimau/{id}";
            public static string GetBloodUnits(object maChienDich, object size) => $"tuimau/blood-units?maChienDich={maChienDich}&size={size}";
            public static string GetExpiryManagement(object viewMode, object search) => $"tuimau/expiry-management?viewMode={viewMode}&search={search}";
        }

        public static class KhoMau
        {
            public const string GetPieChart = "khomau/charts/pie";
        }

        public static class KhoMauBenhVien
        {
            public const string GetMyHospital = "KhoMauBenhVien/my-hospital";
            public const string GetInventory = "KhoMauBenhVien/my-hospital-inventory";
            public const string Import = "KhoMauBenhVien/import";
            public const string ReportIssue = "KhoMauBenhVien/report-issue";
            public static string Scan(object code) => $"KhoMauBenhVien/scan-blood-unit/{code}";
        }

        public static class TinhNguyenVien
        {
            public static string ByCccd(object cccd) => $"tinhnguyenvien/cccd/{cccd}";
        }

        public static class KetQuaXetNghiem
        {
            public const string GetDanhSach = "ketquaxetnghiem/danh-sach";
            public const string GetThongKe = "ketquaxetnghiem/thong-ke";
            public const string Luu = "ketquaxetnghiem/luu";
        }

        public static class AdminHospital
        {
            public const string GetBenhVien = "AdminHospital/benh-vien";
            public const string GetStaff = "AdminHospital/staff";
            public const string GetStock = "AdminHospital/stock";
            public const string PostNotification = "AdminHospital/notification";
        }

        public static class PhieuNhapXuat
        {
            public const string Base = "PhieuNhapXuat";
        }

        public static class NVYT
        {
            public const string TinhNguyenVien = "TinhNguyenVien";
        }
    }
}
