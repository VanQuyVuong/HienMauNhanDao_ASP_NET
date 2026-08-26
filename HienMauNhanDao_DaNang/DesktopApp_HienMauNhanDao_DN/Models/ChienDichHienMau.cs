using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class ChienDichHienMau
    {
        [JsonProperty("maChienDich")]
        public string MaChienDich { get; set; } = string.Empty;

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;

        [JsonProperty("diaDiem")]
        public object? DiaDiemRaw { get; set; }

        public string DiaDiem
        {
            get
            {
                if (DiaDiemRaw == null) return "TP. Đà Nẵng";
                if (DiaDiemRaw is string str) return str;
                try
                {
                    var jobj = JObject.FromObject(DiaDiemRaw);
                    return jobj["tenDiaDiem"]?.ToString() ?? jobj["diaChiChiTiet"]?.ToString() ?? "TP. Đà Nẵng";
                }
                catch
                {
                    return DiaDiemRaw.ToString() ?? "TP. Đà Nẵng";
                }
            }
        }

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
