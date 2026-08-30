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
                        MessageBox.Show("Đăng nhập thất bại: Không nhận được token hợp lệ.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
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

                    MessageBox.Show($"Đăng nhập thất bại ({response.StatusCode}):\n{errStr}", "Lỗi đăng nhập", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi chi tiết: {ex.Message}\n\nNguồn phát sinh lỗi:\n{ex.StackTrace}", "Lỗi hệ thống", MessageBoxButton.OK, MessageBoxImage.Error);
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
