using System.Text.Json.Serialization;

namespace HienMauNhanDao_DaNang.Models.DTOs.Responses
{
    public class LoginResponse
    {
        // [JsonPropertyName] = đổi tên field khi trả về JSON
        // C# dùng PascalCase (AccessToken)
        // nhưng JSON trả về sẽ là snake_case (access_token)

        [JsonPropertyName("access_token")]
        public string AccessToken { set; get; } = string.Empty;

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { set; get; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = "Bearer";

        [JsonPropertyName("expires_in")]
        public long ExpiresIn { set; get; } = 2592000; // 30 ngày = 2.592.000 giây

        [JsonPropertyName("user_id")]
        public string UserId { set; get; } = string.Empty;
        public string Email { set; get; } = string.Empty;
        public string MaVaiTro { set; get; } = string.Empty;
        public string? MaNhanVien { set; get; }//nullable vì không phải ai cũng là nhân viên
        public string? MaTNV { set; get; }
    }
}
