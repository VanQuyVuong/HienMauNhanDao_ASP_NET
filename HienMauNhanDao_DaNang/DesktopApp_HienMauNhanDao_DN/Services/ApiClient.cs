using System;
using System.Net.Http;
using System.Net.Http.Headers;
using DesktopApp_HienMauNhanDao_DN.Constants;

namespace DesktopApp_HienMauNhanDao_DN.Services
{
    public sealed class ApiClient
    {
        private static readonly Lazy<ApiClient> lazy = new Lazy<ApiClient>(() => new ApiClient());
        public static ApiClient Instance => lazy.Value;

        public HttpClient Client { get; private set; }
        public string Token { get; set; }
        public string Role { get; set; }

        private ApiClient()
        {
            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => { return true; }
            };
            Client = new HttpClient(handler);
            Client.BaseAddress = new Uri(ApiEndpoints.BaseUrl);
            Client.DefaultRequestHeaders.Accept.Clear();
            Client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public void SetToken(string token, string role)
        {
            Token = token;
            Role = role;
            Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        public void Logout()
        {
            Token = string.Empty;
            Role = string.Empty;
            Client.DefaultRequestHeaders.Authorization = null;
        }

        public void ClearToken()
        {
            Token = string.Empty;
            Client.DefaultRequestHeaders.Authorization = null;
        }
    }
}
