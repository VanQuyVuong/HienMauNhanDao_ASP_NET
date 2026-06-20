using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("PhuongXa")]
    public class PhuongXa
    {
        [Key]
        [Column("maPhuongXa")]
        [MaxLength(10)]
        public String maPhuongXa { get; set; } = string.Empty;

        [Required]
        [Column("tenPhuongXa")]
        [MaxLength(100)]
        public string tenPhuongXa { set; get; } = string.Empty;

        
        [Column("tenQuanHuyen")]
        [MaxLength(100)]
        public string? tenQuanHuyen { set; get; }

        //tring? == có thể null

        [Column("tenThanhPho")]
        [MaxLength(100)]
        public string? tenThanhPho { set; get; }

        
    }
}
