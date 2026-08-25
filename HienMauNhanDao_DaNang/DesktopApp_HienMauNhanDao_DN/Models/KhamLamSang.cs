using System;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class KhamLamSang
    {
        [JsonProperty("maKQ")]
        public string MaKQ { get; set; }

        [JsonProperty("maDon")]
        public string MaDon { get; set; }

        [JsonProperty("donDangKy")]
        public DonDangKy DonDangKy { get; set; }

        [JsonProperty("huyetAp")]
        public string HuyetAp { get; set; }

        [JsonProperty("nhipTim")]
        public string NhipTim { get; set; }

        [JsonProperty("canNang")]
        public string CanNang { get; set; }

        [JsonProperty("nhietDo")]
        public string NhietDo { get; set; }

        [JsonProperty("ketQua")]
        public string KetQua { get; set; }

        [JsonProperty("lyDoTuChoi")]
        public string LyDoTuChoi { get; set; }

        [JsonProperty("ngayKham")]
        public DateTime? NgayKham { get; set; }

        [JsonProperty("maNV")]
        public string MaNV { get; set; }

        // Display Properties
        public string HoTenTNV => DonDangKy?.TinhNguyenVien?.HoTen ?? DonDangKy?.HoTenTNV ?? "N/A";
        public string CccdTNV => DonDangKy?.TinhNguyenVien?.Cccd ?? "N/A";
        public bool IsDat => KetQua != null && (KetQua.Equals("Dat", StringComparison.OrdinalIgnoreCase) || KetQua.Equals("DU_DIEU_KIEN", StringComparison.OrdinalIgnoreCase) || KetQua.Equals("Đủ điều kiện", StringComparison.OrdinalIgnoreCase));
        public string KetQuaHienThi => IsDat ? "Đủ điều kiện" : (string.IsNullOrEmpty(LyDoTuChoi) ? "Không đủ điều kiện" : $"Tạm hoãn: {LyDoTuChoi}");
    }

    public class DonChoKhamDto
    {
        [JsonProperty("maDon")]
        public string MaDon { get; set; }

        [JsonProperty("maTNV")]
        public string MaTNV { get; set; }

        [JsonProperty("tenTinhNguyenVien")]
        public string TenTinhNguyenVien { get; set; }

        [JsonProperty("ngaySinh")]
        public string NgaySinh { get; set; }

        [JsonProperty("gioiTinh")]
        public string GioiTinh { get; set; }

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; }

        [JsonProperty("soDienThoai")]
        public string SoDienThoai { get; set; }

        [JsonProperty("cccd")]
        public string Cccd { get; set; }

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; }

        [JsonProperty("theTich")]
        public int TheTich { get; set; } = 350;
    }
}
