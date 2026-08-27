using System;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.AdminHospital
{
    public partial class AdminHospitalDashboard : Window
    {
        private Button _currentActiveNav;

        public AdminHospitalDashboard()
        {
            InitializeComponent();
            txtAdminEmail.Text = string.IsNullOrEmpty(ApiClient.Instance.Email) 
                ? "adminbv@bvdn.vn" 
                : ApiClient.Instance.Email;
            
            _currentActiveNav = btnNavDashboard;
            NavigateToPage(new DashboardHospitalPage(), btnNavDashboard);
        }

        private void SetActiveButton(Button activeBtn)
        {
            if (_currentActiveNav != null)
            {
                _currentActiveNav.Background = System.Windows.Media.Brushes.Transparent;
                _currentActiveNav.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#ccfbf1")!;
                _currentActiveNav.FontWeight = FontWeights.SemiBold;
            }

            _currentActiveNav = activeBtn;
            _currentActiveNav.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#14b8a6")!;
            _currentActiveNav.Foreground = System.Windows.Media.Brushes.White;
            _currentActiveNav.FontWeight = FontWeights.Bold;
        }

        private void NavigateToPage(Page page, Button navBtn)
        {
            SetActiveButton(navBtn);
            MainFrame.Navigate(page);
        }

        private void btnNavDashboard_Click(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new DashboardHospitalPage(), btnNavDashboard);
        }

        private void btnNavNhanSu_Click(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new QuanLyNhanSuBVPage(), btnNavNhanSu);
        }

        private void btnNavKhoMau_Click(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new KhoMauHospitalPage(), btnNavKhoMau);
        }

        private void btnNavTinTuc_Click(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new TinTucHospitalPage(), btnNavTinTuc);
        }

        private void btnLogout_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Bạn có chắc chắn muốn đăng xuất khỏi quyền Admin Bệnh viện?", "Xác nhận đăng xuất", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (result == MessageBoxResult.Yes)
            {
                ApiClient.Instance.Logout();
                LoginWindow loginWindow = new LoginWindow();
                loginWindow.Show();
                this.Close();
            }
        }
    }
}
