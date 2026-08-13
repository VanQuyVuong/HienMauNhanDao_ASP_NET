using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;


namespace HienMauNhanDao_DaNang.Models.Entities
{

    [Table("CHIENDICHHIENMAU")]
    public class ChienDichHienMau
    {
        
            [Key]
            [Column("maChienDich")]
            [MaxLength(10)]
            public string MaChienDich { get; set; } = string.Empty;
            // FK → DiaDiem
            [Column("maDiaDiem")]
            [MaxLength(10)]
            public string? MaDiaDiem { get; set; }
            [ForeignKey("MaDiaDiem")]
            public DiaDiem? DiaDiem { get; set; }
            // FK → NhanVien
            [Column("maNhanVien")]
            [MaxLength(10)]
            public string? MaNhanVien { get; set; }
            [ForeignKey("MaNhanVien")]
            public NhanVien? NhanVienPhuTrach { get; set; }
            [Required]
            [Column("tenChienDich")]
            [MaxLength(255)]
            public string TenChienDich { get; set; } = string.Empty;
            [Required]
            [Column("thoiGianBD")]
            public DateTime ThoiGianBD { get; set; }  // Thời gian bắt đầu
            [Required]
            [Column("thoiGianKT")]
            public DateTime ThoiGianKT { get; set; }  // Thời gian kết thúc
            [Column("soLuongDuKien")]
            public int? SoLuongDuKien { get; set; }
            [Required]
            [Column("trangThai")]
            public TrangThaiChienDich TrangThai { get; set; }
            [Column("imageUrl")]
            public string? ImageUrl { get; set; }
            [Column("mucDoUuTien")]
            public MucDoUuTienChienDich MucDoUuTien { get; set; } = MucDoUuTienChienDich.BinhThuong;
            [Column("nhomMauCanKhapCap")]
            [MaxLength(50)]
            public string? NhomMauCanKhapCap { get; set; }

            [NotMapped]
            public int LuongMauDaThu { get; set; } = 0;
        }
}
