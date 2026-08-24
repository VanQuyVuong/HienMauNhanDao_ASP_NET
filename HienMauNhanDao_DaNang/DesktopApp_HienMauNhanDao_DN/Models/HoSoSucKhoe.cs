using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class HoSoSucKhoe
    {
        [JsonProperty("maHoSo")]
        public string MaHoSo { get; set; }

        [JsonProperty("maDon")]
        public string MaDon { get; set; }

        [JsonProperty("donDangKy")]
        public DonDangKy DonDangKy { get; set; }

        [JsonProperty("khangSinh")]
        public bool? KhangSinh { get; set; }

        [JsonProperty("truyenNhiem")]
        public bool? TruyenNhiem { get; set; }

        [JsonProperty("dauHong")]
        public bool? DauHong { get; set; }

        [JsonProperty("coThai")]
        public bool? CoThai { get; set; }

        [JsonProperty("moTaKhac")]
        public string MoTaKhac { get; set; }

        public string HoTenTNV => DonDangKy?.TinhNguyenVien?.HoTen ?? "N/A";
        public string NguyCo => (KhangSinh == true || TruyenNhiem == true || DauHong == true || CoThai == true) ? "Có" : "Không";
    }
}
