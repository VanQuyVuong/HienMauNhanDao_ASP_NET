using System;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.Admin
{
    public partial class AdminDashboard : Window
    {
        public AdminDashboard()
        {
            InitializeComponent();
            txtAdminEmail.Text = string.IsNullOrEmpty(ApiClient.Instance.Email) 
                ? "admin@danang.gov.vn" 
                : ApiClient.Instance.Email;
            
            NavigateToPage(new QuanLyNguoiDungPage());
        }

        private void NavigateToPage(Page page)
        {
            if (MainFrame != null)
            {
                MainFrame.Navigate(page);
            }
        }

        private void rbNguoiDung_Checked(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new QuanLyNguoiDungPage());
        }

        private void rbChienDich_Checked(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new QuanLyChienDichPage());
        }

        private void rbChungNhan_Checked(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new CapGiayChungNhanPage());
        }

        private void rbBenhVien_Checked(object sender, RoutedEventArgs e)
        {
            NavigateToPage(new QuanLyBenhVienPage());
        }

        private void btnLogout_Click(object sender, RoutedEventArgs e)
        {

            var loginWindow = new LoginWindow();
            loginWindow.Show();
            this.Close();
        }
    }
}
