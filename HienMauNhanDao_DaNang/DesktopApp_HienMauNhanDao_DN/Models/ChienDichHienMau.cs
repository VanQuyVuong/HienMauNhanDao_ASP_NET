using System;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class ChienDichHienMau
    {
        [JsonProperty("maChienDich")]
        public string MaChienDich { get; set; } = string.Empty;

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;

        [JsonProperty("diaDiem")]
        public string? DiaDiem { get; set; }

        [JsonProperty("thoiGianBatDau")]
        public DateTime? ThoiGianBatDau { get; set; }

        [JsonProperty("thoiGianKetThuc")]
        public DateTime? ThoiGianKetThuc { get; set; }

        [JsonProperty("soLuongDuKien")]
        public int? SoLuongDuKien { get; set; }

        [JsonProperty("trangThai")]
        public string? TrangThai { get; set; }

        public string ThoiGianHienThi => ThoiGianBatDau.HasValue ? ThoiGianBatDau.Value.ToString("dd/MM/yyyy") : "Thường xuyên";
        public string TrangThaiHienThi => !string.IsNullOrEmpty(TrangThai) ? TrangThai : "Đang diễn ra";
    }
}
