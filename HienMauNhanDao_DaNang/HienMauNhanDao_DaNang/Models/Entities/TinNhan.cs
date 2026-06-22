using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("TINNHAN")]
    public class TinNhan
    {
        [Key]
        [Column("maTinNhan")]
        [MaxLength(10)]
        public string MaTinNhan { get; set; } = string.Empty;

        [Column("maTaiKhoanGui")]
        [MaxLength(10)]
        public string? MaTaiKhoanGui { get; set; }

        [ForeignKey("MaTaiKhoanGui")]
        public TaiKhoan? NguoiGui { get; set; }

        [Column("maTaiKhoanNhan")]
        [MaxLength(10)]
        public string? MaTaiKhoanNhan { get; set; }

        [ForeignKey("MaTaiKhoanNhan")]
        public TaiKhoan? NguoiNhan { get; set; }

        // TypeName = "TEXT" → lưu text dài không giới hạn
        [Column("noiDung", TypeName = "TEXT")]
        public string? NoiDung { get; set; }

        [Column("thoiGian")]
        public DateTime ThoiGian { get; set; } = DateTime.Now;

        // false = chưa đọc, true = đã đọc
        [Column("trangThai")]
        public bool DaDoc { get; set; } = false;
    }
}
