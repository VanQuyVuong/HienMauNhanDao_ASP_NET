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

        
        [NotMapped]
        public string? tenQuanHuyen { set; get; }

        //string? == có thể null

        [NotMapped]
        public string? tenThanhPho { set; get; }

        
    }
}
