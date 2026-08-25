using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class LoginResponse
    {
        [JsonProperty("access_token")]
        public string Token { get; set; }

        [JsonProperty("maVaiTro")]
        public string Role { get; set; }

        [JsonProperty("MaVaiTro")]
        public string RoleAlt { set { if (string.IsNullOrEmpty(Role)) Role = value; } }

        [JsonProperty("email")]
        public string Email { get; set; }
    }
}
