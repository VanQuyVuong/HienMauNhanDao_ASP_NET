using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;


namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("NHANVIEN")]
    public class NhanVien
    {

        [Key]
        [Column("maNhanVien")]
        [MaxLength(10)] 
        public string MaNhanVien { set; get; } = string.Empty;



        [Column("maTaiKhoan")]
        [MaxLength(10)]
        public string? MaTaiKhoan { set; get; }

        [ForeignKey("maTaiKhoan")]
        public TaiKhoan? TaiKhoan { set; get; }


        [Column("maKhoa")]
        [MaxLength(10)] 
        public string? MaKhoa { get; set; }
        [ForeignKey("maKhoa")]
        public KhoaCongTac? KhoaCongTac { get; set; }



        [Column("maDiaDiem")]
        [MaxLength(10)]
        public string? MaDiaDiem { set; get; }
        [ForeignKey("maDiaDiem")]
        public DiaDiem? DiaDiem { set; get; }



        [Required]
        [Column("hoTen")]
        [MaxLength(100)]
        public string HoTen { set; get; } = string.Empty;


         [Required]
        [Column("CCCD")]
        [MaxLength(12)]
        public string Cccd { get; set; } = string.Empty;
        [Column("gioiTinh")]
        public GioiTinh? GioiTinh { get; set; }
        [Required]
        [Column("soDienThoai")]
        [MaxLength(10)]
        public string SoDienThoai { get; set; } = string.Empty;


    }
}
