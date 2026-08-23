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

        private ApiClient()
        {
            // Tránh lỗi chứng chỉ SSL localhost
            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => { return true; }
            };

            Client = new HttpClient(handler)
            {
                BaseAddress = new Uri(ApiEndpoints.BaseUrl)
            };
        }

        public void SetToken(string token)
        {
            Token = token;
            Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        public void ClearToken()
        {
            Token = string.Empty;
            Client.DefaultRequestHeaders.Authorization = null;
        }
    }
}
