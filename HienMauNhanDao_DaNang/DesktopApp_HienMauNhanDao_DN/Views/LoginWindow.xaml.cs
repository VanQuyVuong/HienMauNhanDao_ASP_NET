using System;
using System.Net.Http;
using System.Text;
using System.Windows;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Constants;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;
using DesktopApp_HienMauNhanDao_DN.Views.NVYT;

namespace DesktopApp_HienMauNhanDao_DN.Views
{
    public partial class LoginWindow : Window
    {
        public LoginWindow()
        {
            InitializeComponent();
        }

        private async void btnLogin_Click(object sender, RoutedEventArgs e)
        {
            var username = txtUsername.Text;
            var password = txtPassword.Password;

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                MessageBox.Show("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            btnLogin.IsEnabled = false;
            btnLogin.Content = "ĐANG XỬ LÝ...";

            try
            {
                var loginRequest = new LoginRequest { Email = username, MatKhau = password };
                var json = JsonConvert.SerializeObject(loginRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync(ApiEndpoints.Auth.Login, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var result = JsonConvert.DeserializeObject<ApiResponse<LoginResponse>>(responseString);
                    if (result != null && result.Success && result.Data != null && !string.IsNullOrEmpty(result.Data.Token))
                    {
                        // Lưu Token và Role vào ApiClient (Singleton)
                        ApiClient.Instance.SetToken(result.Data.Token, result.Data.Role);
                        
                        // Ở đây mặc định hướng tới màn hình NVYT theo luồng nghiệp vụ hiện tại
                        var dashboard = new NVYTDashboard();
                        dashboard.Show();
                        this.Close();
                    }
                    else
                    {
                        MessageBox.Show("Đăng nhập thất bại: Không nhận được token hợp lệ.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
                else
                {
                    MessageBox.Show("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối máy chủ: {ex.Message}", "Lỗi hệ thống", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnLogin.IsEnabled = true;
                btnLogin.Content = "ĐĂNG NHẬP";
            }
        }

        private void btnClose_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }
    }
}
