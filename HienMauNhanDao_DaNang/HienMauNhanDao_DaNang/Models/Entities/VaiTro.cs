using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("VaiTro")]
    public class VaiTro
    {
        [Key]   //Đánh dấu khoá chính
        [Column("MaVaiTro")]
        [MaxLength(10)]
        public String maVaiTro { get; set; } = String.Empty;

        [Required]
        [Column("TenVaiTro")]
        [MaxLength(50)]
        public string tenVaiTro { get; set; } = string.Empty;
    }
}
