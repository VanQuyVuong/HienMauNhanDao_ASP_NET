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
                txtError.Text = "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!";
                txtError.Visibility = Visibility.Visible;
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
                        ApiClient.Instance.SetToken(result.Data.Token, result.Data.Role, result.Data.Email);
                        
                        string role = (result.Data.Role ?? "").Trim();
                        if (role == "AD" || role == "Admin")
                        {
                            var adminDashboard = new DesktopApp_HienMauNhanDao_DN.Views.Admin.AdminDashboard();
                            adminDashboard.Show();
                        }
                        else if (role == "ADMIN_BV")
                        {
                            var adminHospitalDashboard = new DesktopApp_HienMauNhanDao_DN.Views.AdminHospital.AdminHospitalDashboard();
                            adminHospitalDashboard.Show();
                        }
                        else if (role == "BS")
                        {
                            var bacSiDashboard = new DesktopApp_HienMauNhanDao_DN.Views.BacSi.BacSiDashboard();
                            bacSiDashboard.Show();
                        }
                        else if (role == "QLK" || role.Contains("Kho"))
                        {
                            var qlkDashboard = new DesktopApp_HienMauNhanDao_DN.Views.QLK.QLKDashboard();
                            qlkDashboard.Show();
                        }
                        else
                        {
                            var dashboard = new NVYTDashboard();
                            dashboard.Show();
                        }
                        

                        this.Close();
                    }
                    else
                    {
                        txtError.Text = "Không nhận được token hợp lệ từ máy chủ!";
                        txtError.Visibility = Visibility.Visible;
                    }
                }
                else
                {
                    string errStr = await response.Content.ReadAsStringAsync();
                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<object>>(errStr);
                        if (apiRes != null && !string.IsNullOrEmpty(apiRes.Message))
                        {
                            errStr = apiRes.Message;
                        }
                    }
                    catch { }

                    txtError.Text = "Sai tài khoản hoặc mật khẩu!";
                    txtError.Visibility = Visibility.Visible;
                }
            }
            catch (Exception ex)
            {
                txtError.Text = "Lỗi kết nối máy chủ. Vui lòng thử lại!";
                txtError.Visibility = Visibility.Visible;
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

        private bool isPasswordVisible = false;

        private void btnTogglePassword_Click(object sender, RoutedEventArgs e)
        {
            isPasswordVisible = !isPasswordVisible;
            if (isPasswordVisible)
            {
                txtPasswordVisible.Text = txtPassword.Password;
                txtPasswordVisible.Visibility = Visibility.Visible;
                txtPassword.Visibility = Visibility.Collapsed;
                btnTogglePassword.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(225, 29, 72));
            }
            else
            {
                txtPassword.Password = txtPasswordVisible.Text;
                txtPassword.Visibility = Visibility.Visible;
                txtPasswordVisible.Visibility = Visibility.Collapsed;
                btnTogglePassword.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(153, 153, 153));
            }
        }

        private void txtPassword_PasswordChanged(object sender, RoutedEventArgs e)
        {
            if (!isPasswordVisible) txtPasswordVisible.Text = txtPassword.Password;
            if (txtError != null) txtError.Visibility = Visibility.Collapsed;
        }

        private void txtPasswordVisible_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
        {
            if (isPasswordVisible) txtPassword.Password = txtPasswordVisible.Text;
            if (txtError != null) txtError.Visibility = Visibility.Collapsed;
        }
        
        private void txtUsername_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
        {
            if (txtError != null) txtError.Visibility = Visibility.Collapsed;
        }
    }
}
