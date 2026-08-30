using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Views.TNV
{
    public partial class DangKyHienMauTNVPage : Page
    {
        private ChienDich? _selectedCampaign;

        public DangKyHienMauTNVPage()
        {
            InitializeComponent();
            LoadCampaigns();
        }

        private async void LoadCampaigns()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/ChienDich");
                if (response.IsSuccessStatusCode)
                {
                    var jsonStr = await response.Content.ReadAsStringAsync();
                    var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<ChienDich>>>(jsonStr);
                    if (apiRes != null && apiRes.Success && apiRes.Data != null)
                    {
                        lbCampaigns.ItemsSource = apiRes.Data;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải danh sách chiến dịch: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void lbCampaigns_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (lbCampaigns.SelectedItem is ChienDich cd)
            {
                _selectedCampaign = cd;
                txtSelectedCampaignName.Text = cd.TenChienDich;
            }
        }

        private async void btnSubmitRegistration_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedCampaign == null)
            {
                MessageBox.Show("Vui lòng chọn 1 chiến dịch hiến máu bên danh sách trái.", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            int volume = 350;
            if (cbVolume.SelectedItem is ComboBoxItem volItem)
            {
                var content = volItem.Content?.ToString() ?? "";
                if (content.Contains("250")) volume = 250;
                else if (content.Contains("450")) volume = 450;
            }

            try
            {
                var payload = new
                {
                    maChienDich = _selectedCampaign.MaChienDich,
                    theTich = volume
                };

                var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
                var response = await ApiClient.Instance.Client.PostAsync("/api/DonDangKy", content);

                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Đăng ký hiến máu thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    var errStr = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Đăng ký thất bại: {errStr}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi gửi đăng ký: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
