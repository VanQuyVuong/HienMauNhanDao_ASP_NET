using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("THONGBAO")]
    public class ThongBao
    {
        [Key]
        [Column("maThongBao")]
        [MaxLength(10)]
        public string MaThongBao { get; set; } = string.Empty;

        // FK → TaiKhoan (người gửi)
        [Column("maTaiKhoanGui")]
        [MaxLength(10)]
        public string? MaTaiKhoanGui { get; set; }

        [ForeignKey("MaTaiKhoanGui")]
        public TaiKhoan? NguoiGui { get; set; }

        // FK → TaiKhoan (người nhận)
        [Column("maTaiKhoanNhan")]
        [MaxLength(10)]
        public string? MaTaiKhoanNhan { get; set; }

        [ForeignKey("MaTaiKhoanNhan")]
        public TaiKhoan? NguoiNhan { get; set; }

        [Column("noiDung")]
        public string? NoiDung { get; set; }

        [Column("thoiGianGui")]
        public DateTime ThoiGianGui { get; set; } = DateTime.Now;

        [Column("trangThai")]
        public TrangThaiThongBao TrangThai { get; set; } = TrangThaiThongBao.ChuaDoc;
    }
}
