using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class KhoMauNhomDto
    {
        [JsonProperty("maKho")]
        public string MaKho { get; set; } = string.Empty;

        [JsonProperty("tenKho")]
        public string TenKho { get; set; } = string.Empty;

        [JsonProperty("nhomMauString")]
        public string NhomMauString { get; set; } = "Chưa rõ";

        [JsonProperty("soLuongTon")]
        public int SoLuongTon { get; set; }

        [JsonProperty("nguongAnToan")]
        public int NguongAnToan { get; set; } = 50;

        [JsonProperty("tinhTrang")]
        public string TinhTrang { get; set; } = "AnToan";

        [JsonProperty("maKhoa")]
        public string MaKhoa { get; set; } = string.Empty;

        public bool IsAnToan => TinhTrang == "AnToan" && SoLuongTon >= NguongAnToan;
        public string TinhTrangHienThi => IsAnToan ? "AN TOÀN ✅" : "CẠN KIỆT ⚠️";
        public string TinhTrangBg => IsAnToan ? "#dcfce7" : "#fee2e2";
        public string TinhTrangFg => IsAnToan ? "#15803d" : "#b91c1c";
        public string TinhTrangBorder => IsAnToan ? "#86efac" : "#fca5a5";
    }

    public class BloodUnitInventoryDto
    {
        [JsonProperty("maTuiMau")]
        public string MaTuiMau { get; set; } = string.Empty;

        [JsonProperty("maDon")]
        public string MaDon { get; set; } = string.Empty;

        [JsonProperty("tenTinhNguyenVien")]
        public string TenTinhNguyenVien { get; set; } = string.Empty;

        [JsonProperty("soCCCD")]
        public string? SoCCCD { get; set; }

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = "Chưa rõ";

        [JsonProperty("theTich")]
        public int TheTich { get; set; } = 350;

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;

        [JsonProperty("thoiGianLay")]
        public string? ThoiGianLay { get; set; }

        [JsonProperty("ngayHetHan")]
        public string? NgayHetHan { get; set; }

        [JsonProperty("trangThai")]
        public string TrangThai { get; set; } = string.Empty;

        // Visual status helpers
        public string TrangThaiHienThi
        {
            get
            {
                if (TrangThai == "DaLuuKho") return "Đã lưu kho";
                if (TrangThai == "ChuaXuLy") return "Chờ xử lý / Re-test";
                if (TrangThai == "DaXetNghiem") return "Đã XN (Chờ nhập kho)";
                if (TrangThai == "DaHuy") return "Đã hủy";
                return TrangThai;
            }
        }
    }

    public class ScanBloodUnitDto
    {
        [JsonProperty("maTuiMau")]
        public string MaTuiMau { get; set; } = string.Empty;

        [JsonProperty("maDon")]
        public string MaDon { get; set; } = string.Empty;

        [JsonProperty("tenTinhNguyenVien")]
        public string TenTinhNguyenVien { get; set; } = string.Empty;

        [JsonProperty("soCCCD")]
        public string? SoCCCD { get; set; }

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = "Chưa rõ";

        [JsonProperty("theTich")]
        public int TheTich { get; set; } = 350;

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;

        [JsonProperty("thoiGianLay")]
        public string? ThoiGianLay { get; set; }

        [JsonProperty("ngayHetHan")]
        public string? NgayHetHan { get; set; }

        [JsonProperty("trangThaiHienTai")]
        public string TrangThaiHienTai { get; set; } = string.Empty;

        [JsonProperty("ketQuaViSinh")]
        public string KetQuaViSinh { get; set; } = string.Empty;

        [JsonProperty("isEligibleImport")]
        public bool IsEligibleImport { get; set; } = true;
    }

    public class ImportHospitalRequest
    {
        [JsonProperty("maTuiMau")]
        public string MaTuiMau { get; set; } = string.Empty;

        [JsonProperty("ghiChu")]
        public string? GhiChu { get; set; }
    }

    public class ReportIssueRequest
    {
        [JsonProperty("maTuiMau")]
        public string MaTuiMau { get; set; } = string.Empty;

        [JsonProperty("lyDo")]
        public string LyDo { get; set; } = string.Empty;

        [JsonProperty("hanhDong")]
        public string HanhDong { get; set; } = "KIEM_TRA";
    }

    public class ExpiryStatsDto
    {
        [JsonProperty("expiredCount")]
        public int ExpiredCount { get; set; }

        [JsonProperty("nearExpiryCount")]
        public int NearExpiryCount { get; set; }

        [JsonProperty("safeCount")]
        public int SafeCount { get; set; }

        [JsonProperty("hasCritical")]
        public bool HasCritical { get; set; }
    }
}
