using System.Windows;
using System.Windows.Media;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class NVYTDashboard : Window
    {
        public NVYTDashboard()
        {
            InitializeComponent();
            btnDonDangKy.Click += (s, e) => NavigateTo(new DonDangKyPage(), btnDonDangKy);
            btnKhaiBaoYTe.Click += (s, e) => NavigateTo(new KhaiBaoYTePage(), btnKhaiBaoYTe);
            btnThuNhanMau.Click += (s, e) => NavigateTo(new ThuNhanMauPage(), btnThuNhanMau);
            btnCapNhatXetNghiem.Click += (s, e) => NavigateTo(new CapNhatXetNghiemPage(), btnCapNhatXetNghiem);
            
            // Default page
            NavigateTo(new DonDangKyPage(), btnDonDangKy);
        }

        private void NavigateTo(Page page, Button activeBtn)
        {
            // Reset all buttons
            btnDonDangKy.Background = Brushes.Transparent;
            btnKhaiBaoYTe.Background = Brushes.Transparent;
            btnThuNhanMau.Background = Brushes.Transparent;
            btnCapNhatXetNghiem.Background = Brushes.Transparent;
            
            // Set active button
            activeBtn.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#ffe6e8"));
            
            MainFrame.Navigate(page);
        }

        private void btnLogout_Click(object sender, RoutedEventArgs e)
        {
            ApiClient.Instance.ClearToken();
            var login = new LoginWindow();
            login.Show();
            this.Close();
        }
    }
}
