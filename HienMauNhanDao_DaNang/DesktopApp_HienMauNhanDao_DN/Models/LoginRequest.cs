using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Models
{
    public class LoginRequest
    {
        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("matKhau")]
        public string MatKhau { get; set; }
    }
}
