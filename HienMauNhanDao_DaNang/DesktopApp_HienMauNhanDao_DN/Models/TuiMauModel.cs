using System;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class TuiMauDto
    {
        [JsonProperty("maTuiMau")]
        public string MaTuiMau { get; set; } = string.Empty;

        [JsonProperty("maDon")]
        public string MaDon { get; set; } = string.Empty;

        [JsonProperty("maNV")]
        public string MaNV { get; set; } = string.Empty;

        [JsonProperty("theTich")]
        public int TheTich { get; set; } = 350;

        [JsonProperty("thoiGianLayMau")]
        public DateTime ThoiGianLayMau { get; set; } = DateTime.Now;

        [JsonProperty("nhietDoVanChuyen")]
        public double NhietDoVanChuyen { get; set; } = 4.0;

        [JsonProperty("trangThai")]
        public string TrangThai { get; set; } = "ChuaXuLy";

        [JsonProperty("maKho")]
        public string? MaKho { get; set; }

        [JsonProperty("tenTinhNguyenVien")]
        public string TenTinhNguyenVien { get; set; } = string.Empty;

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = "Chưa rõ";

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;
    }

    public class CreateTuiMauRequest
    {
        [JsonProperty("maDon")]
        public string MaDon { get; set; } = string.Empty;

        [JsonProperty("maNV")]
        public string MaNV { get; set; } = string.Empty;

        [JsonProperty("theTich")]
        public int TheTich { get; set; } = 350;

        [JsonProperty("thoiGianLayMau")]
        public string ThoiGianLayMau { get; set; } = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");

        [JsonProperty("nhietDoVanChuyen")]
        public double NhietDoVanChuyen { get; set; } = 4.0;
    }

    public class KetQuaXetNghiemDto
    {
        [JsonProperty("maKQ")]
        public string MaKQ { get; set; } = string.Empty;

        [JsonProperty("maTuiMau")]
        public string MaTuiMau { get; set; } = string.Empty;

        [JsonProperty("maNhanVien")]
        public string MaNhanVien { get; set; } = string.Empty;

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = "O+";

        [JsonProperty("soLanXetNghiem")]
        public int SoLanXetNghiem { get; set; } = 1;

        [JsonProperty("ketQua")]
        public bool? KetQua { get; set; }

        [JsonProperty("moTa")]
        public string MoTa { get; set; } = string.Empty;

        [JsonProperty("tenTinhNguyenVien")]
        public string TenTinhNguyenVien { get; set; } = string.Empty;

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;

        public bool IsDat => KetQua == true;

        public string KetQuaHienThi
        {
            get
            {
                if (KetQua == null) return "⏳ Chờ XN vi sinh";
                return KetQua == true ? "✅ Đạt Tiêu Chuẩn" : "❌ Không Đạt (Hủy)";
            }
        }
    }

    public class SaveXetNghiemRequest
    {
        [JsonProperty("maTuiMau")]
        public string MaTuiMau { get; set; } = string.Empty;

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = "O+";

        [JsonProperty("soLanXetNghiem")]
        public int SoLanXetNghiem { get; set; } = 1;

        [JsonProperty("ketQua")]
        public bool KetQua { get; set; }

        [JsonProperty("moTa")]
        public string MoTa { get; set; } = string.Empty;

        [JsonProperty("maNhanVien")]
        public string MaNhanVien { get; set; } = string.Empty;
    }

    public class XetNghiemStatsDto
    {
        [JsonProperty("tongSo")]
        public int TongSo { get; set; }

        [JsonProperty("datYeuCau")]
        public int DatYeuCau { get; set; }

        [JsonProperty("khongDat")]
        public int KhongDat { get; set; }

        [JsonProperty("reTestCount")]
        public int ReTestCount { get; set; }
    }
}
