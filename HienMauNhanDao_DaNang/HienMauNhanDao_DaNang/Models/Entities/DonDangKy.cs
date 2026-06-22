using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;


namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("DONDANGKY")]
    public class DonDangKy
    {
        
            [Key]
            [Column("maDon")]
            [MaxLength(10)]
            public string MaDon { get; set; } = string.Empty;
            // FK → TinhNguyenVien (ai đăng ký)
            [Column("maTNV")]
            [MaxLength(10)]
            public string? MaTNV { get; set; }
            [ForeignKey("MaTNV")]
            public TinhNguyenVien? TinhNguyenVien { get; set; }
            // FK → ChienDichHienMau (đăng ký chiến dịch nào)
            [Column("maChienDich")]
            [MaxLength(10)]
            public string? MaChienDich { get; set; }
            [ForeignKey("MaChienDich")]
            public ChienDichHienMau? ChienDich { get; set; }
            // FK → NhanVien (nhân viên phụ trách đơn này)
            [Column("maNhanVien")]
            [MaxLength(10)]
            public string? MaNhanVien { get; set; }
            [ForeignKey("MaNhanVien")]
            public NhanVien? NhanVienPhuTrach { get; set; }
            [Column("maQR")]
            [MaxLength(255)]
            public string? MaQR { get; set; }
            [Column("thoiGianDangKy")]
            public DateTime? ThoiGianDangKy { get; set; }
            [Column("trangThai")]
            public TrangThaiDonDangKy TrangThai { get; set; }
            // Thể tích máu muốn hiến (250ml, 350ml, 450ml)
            [Column("theTich")]
            public int? TheTich { get; set; }
        }
}
