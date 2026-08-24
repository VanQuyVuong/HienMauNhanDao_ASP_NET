using System.Windows;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class NVYTDashboard : Window
    {
        public NVYTDashboard()
        {
            InitializeComponent();
            SetupMenuByRole();
        }

        private void SetupMenuByRole()
        {
            string role = ApiClient.Instance.Role;

            if (role == "NVYT_LT" || role == "NVYT" || role == "NVYT-LT")
            {
                btnDonDangKy.Visibility = Visibility.Visible;
                btnTinhNguyenVien.Visibility = Visibility.Visible;
                btnKhaiBaoYTe.Visibility = Visibility.Visible;
                MainFrame.Navigate(new DonDangKyPage());
            }
            else if (role == "NVYT_XN" || role == "NVYT-XN")
            {
                btnThuNhanMau.Visibility = Visibility.Visible;
                btnCapNhatXetNghiem.Visibility = Visibility.Visible;
                MainFrame.Navigate(new ThuNhanMauPage());
            }
            else if (role == "BS")
            {
                // Bác sĩ sẽ có Dashboard riêng, nhưng tạm thời mượn frame này.
                // Sẽ navigate sang trang Danh Sách Chờ Khám
            }
            else
            {
                // Default fallback
                MainFrame.Navigate(new DonDangKyPage());
            }
        }

        private void btnDonDangKy_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new DonDangKyPage());
        }

        private void btnTinhNguyenVien_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new TinhNguyenVienPage());
        }

        private void btnKhaiBaoYTe_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new KhaiBaoYTePage());
        }

        private void btnThuNhanMau_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new ThuNhanMauPage());
        }

        private void btnCapNhatXetNghiem_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new CapNhatXetNghiemPage());
        }

        private void btnLogout_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Bạn có chắc chắn muốn đăng xuất?", "Xác nhận", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (result == MessageBoxResult.Yes)
            {
                ApiClient.Instance.Logout();
                var loginWindow = new LoginWindow();
                loginWindow.Show();
                this.Close();
            }
        }
    }
}
