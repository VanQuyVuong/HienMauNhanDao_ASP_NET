namespace DesktopApp_HienMauNhanDao_DN.Constants
{
    public static class ApiEndpoints
    {
        public const string BaseUrl = "http://localhost:5236/api/";

        public static class Auth
        {
            public const string Login = "auth/login";
        }

        public static class NVYT
        {
            public const string DonDangKy = "nvyt/dondangky";
            public const string TatCaDon = "DonDangKy/tat-ca";
            public const string TinhNguyenVien = "TinhNguyenVien";
            public const string HoSoSucKhoe = "hososuckhoe/tat-ca";
        }
    }
}
