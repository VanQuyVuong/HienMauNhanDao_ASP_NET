using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("INVALIDATED_TOKEN")]
    public class InvalidatedToken
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Column("expiry_time")]
        public DateTime ExpiryTime { get; set; }
    }
}
