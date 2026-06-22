using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("CHITIETNHAPXUAT")]
    public class ChiTietNhapXuat
    {
        // KHÔNG có [Key] ở đây!
        // Khóa chính kép sẽ cấu hình trong DbContext sau
        [Column("maPhieu")]
        [MaxLength(10)]
        public string MaPhieu { get; set; } = string.Empty;

        [ForeignKey("MaPhieu")]
        public PhieuNhapXuat? PhieuNhapXuat { get; set; }

        [Column("maTuiMau")]
        [MaxLength(15)]
        public string MaTuiMau { get; set; } = string.Empty;

        [ForeignKey("MaTuiMau")]
        public TuiMau? TuiMau { get; set; }
    }
}
