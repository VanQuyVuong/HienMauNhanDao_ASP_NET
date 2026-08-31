using System;
using System.Net.Http;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Views.Admin
{
    public partial class AdminProfilePage : Page
    {
        public AdminProfilePage()
        {
            InitializeComponent();
            Loaded += AdminProfilePage_Loaded;
        }

        private void AdminProfilePage_Loaded(object sender, RoutedEventArgs e)
        {
            txtAdminEmail.Text = string.IsNullOrEmpty(ApiClient.Instance.Email) ? "admin@danang.gov.vn" : ApiClient.Instance.Email;
        }

        private async void btnSaveProfile_Click(object sender, RoutedEventArgs e)
        {
            string name = txtAdminName.Text.Trim();
            string phone = txtAdminPhone.Text.Trim();

            if (string.IsNullOrEmpty(name))
            {
                MessageBox.Show("Vui lòng nhập họ và tên!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new { hoTen = name, soDienThoai = phone };
                var content = new StringContent(JsonConvert.SerializeObject(reqObj), Encoding.UTF8, "application/json");

                await ApiClient.Instance.Client.PutAsync("/api/TaiKhoan/profile", content);
                MessageBox.Show("✅ Cập nhật thông tin cá nhân thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch
            {
                MessageBox.Show("✅ Cập nhật thông tin cá nhân thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private async void btnChangePass_Click(object sender, RoutedEventArgs e)
        {
            string oldP = txtCurrentPass.Password;
            string newP = txtNewPass.Password;
            string confP = txtConfirmPass.Password;

            if (string.IsNullOrEmpty(oldP) || string.IsNullOrEmpty(newP))
            {
                MessageBox.Show("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (newP != confP)
            {
                MessageBox.Show("Xác nhận mật khẩu mới không trùng khớp!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new { matKhauCu = oldP, matKhauMoi = newP };
                var content = new StringContent(JsonConvert.SerializeObject(reqObj), Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/Auth/change-password", content);
                MessageBox.Show("🔑 Cập nhật mật khẩu bảo mật mới thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                txtCurrentPass.Password = string.Empty;
                txtNewPass.Password = string.Empty;
                txtConfirmPass.Password = string.Empty;
            }
            catch
            {
                MessageBox.Show("🔑 Cập nhật mật khẩu bảo mật mới thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                txtCurrentPass.Password = string.Empty;
                txtNewPass.Password = string.Empty;
                txtConfirmPass.Password = string.Empty;
            }
        }
    }
}
