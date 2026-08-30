using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class ChienDich
    {
        [JsonProperty("maChienDich")]
        public string MaChienDich { get; set; }

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; }

        [JsonProperty("mucDoUuTien")]
        public string MucDoUuTien { get; set; }

        [JsonProperty("thoiGianBD")]
        public string? ThoiGianBD { get; set; }

        public string DiaDiemString => "TP. Đà Nẵng";
    }
}
