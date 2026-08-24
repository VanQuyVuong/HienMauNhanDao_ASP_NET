using System;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class TinhNguyenVien
    {
        [JsonProperty("maTNV")]
        public string MaTNV { get; set; }

        [JsonProperty("hoTen")]
        public string HoTen { get; set; }

        [JsonProperty("cccd")]
        public string Cccd { get; set; }

        [JsonProperty("soDienThoai")]
        public string SoDienThoai { get; set; }

        [JsonProperty("soLanHienMau")]
        public int SoLanHienMau { get; set; }

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; }

        [JsonProperty("ngaySinh")]
        public DateTime? NgaySinh { get; set; }

        [JsonProperty("gioiTinh")]
        public string GioiTinh { get; set; } // Trả về string như "Nam", "Nu" theo Enum

        [JsonProperty("diaChi")]
        public string DiaChi { get; set; }

        public string NhomMauHienThi => !string.IsNullOrEmpty(NhomMau) ? NhomMau.Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ";
    }
}
