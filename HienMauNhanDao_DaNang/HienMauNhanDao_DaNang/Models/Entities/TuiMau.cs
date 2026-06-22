using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("TUIMAU")]
    public class TuiMau
    {
        [Key]
        [Column("maTuiMau")]
        [MaxLength(15)]
        public string MaTuiMau { get; set; } = string.Empty;

        // FK → DonDangKy (túi máu này lấy từ đơn nào)
        [Column("maDon")]
        [MaxLength(10)]
        public string? MaDon { get; set; }

        [ForeignKey("MaDon")]
        public DonDangKy? DonDangKy { get; set; }

        // FK → KhoMau (lưu vào kho nào)
        [Column("maKho")]
        [MaxLength(10)]
        public string? MaKho { get; set; }

        [ForeignKey("MaKho")]
        public KhoMau? KhoMau { get; set; }

        // FK → NhanVien (ai lấy máu)
        [Column("maNhanVien")]
        [MaxLength(10)]
        public string? MaNhanVien { get; set; }

        [ForeignKey("MaNhanVien")]
        public NhanVien? NhanVien { get; set; }

        [Column("theTich")]
        public int? TheTich { get; set; }

        [Column("thoiGianLayMau")]
        public DateTime? ThoiGianLayMau { get; set; }

        [Column("trangThai")]
        public TrangThaiTuiMau TrangThai { get; set; }

        [Column("nhietDoVanChuyen")]
        public double? NhietDoVanChuyen { get; set; }
    }
}
