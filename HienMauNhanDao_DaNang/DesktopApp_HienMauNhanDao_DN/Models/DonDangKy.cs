using System;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class DonDangKy
    {
        [JsonProperty("maDon")]
        public string MaDon { get; set; }

        [JsonProperty("maTNV")]
        public string MaTNV { get; set; }

        [JsonProperty("tinhNguyenVien")]
        public TinhNguyenVien TinhNguyenVien { get; set; }

        [JsonProperty("maChienDich")]
        public string MaChienDich { get; set; }

        [JsonProperty("chienDich")]
        public ChienDichHienMau ChienDich { get; set; }

        [JsonProperty("trangThai")]
        public string TrangThai { get; set; }

        [JsonProperty("thoiGianDangKy")]
        public DateTime ThoiGianDangKy { get; set; }

        [JsonProperty("theTich")]
        public int? TheTich { get; set; }

        // Properties hỗ trợ hiển thị trên DataGrid
        public string HoTenTNV => TinhNguyenVien?.HoTen ?? "N/A";
        public string CccdTNV => TinhNguyenVien?.Cccd ?? "N/A";
        public string TenChienDich => ChienDich?.TenChienDich ?? "N/A";

        
        public string TrangThaiHienThi
        {
            get
            {
                switch (TrangThai)
                {
                    case "DaDangKy": return "Đã Đăng Ký";
                    case "ChoDuyet": return "Chờ Duyệt";
                    case "DaDuyet": return "Đã Duyệt";
                    case "DaHuy": return "Đã Hủy";
                    case "DaTuChoi": return "Đã Từ Chối";
                    case "DaHoanThanh": return "Đã Hoàn Thành";
                    case "DaHien": return "Đã Hiến Máu";
                    default: return "Không xác định";
                }
            }
        }
    }
}
