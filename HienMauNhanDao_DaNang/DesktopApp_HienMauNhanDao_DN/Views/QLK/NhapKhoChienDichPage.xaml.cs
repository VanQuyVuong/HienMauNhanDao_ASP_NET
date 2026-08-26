using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DesktopApp_HienMauNhanDao_DN.Views.QLK
{
    public partial class NhapKhoChienDichPage : Page
    {
        private List<ChienDichHienMau> _allCampaigns = new List<ChienDichHienMau>();

        public NhapKhoChienDichPage()
        {
            InitializeComponent();
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadData();
        }

        private async void btnRefresh_Click(object sender, RoutedEventArgs e)
        {
            await LoadData();
        }

        private async Task LoadData()
        {
            try
            {
                btnRefresh.IsEnabled = false;
                btnRefresh.Content = "Đang tải...";

                var response = await ApiClient.Instance.Client.GetAsync("/api/ChienDichHienMau/tat-ca");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    List<ChienDichHienMau> list = null;

                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<ChienDichHienMau>>>(json);
                        if (apiRes != null && apiRes.Data != null) list = apiRes.Data;
                    }
                    catch { }

                    if (list == null)
                    {
                        try { list = JsonConvert.DeserializeObject<List<ChienDichHienMau>>(json); } catch { }
                    }

                    if (list != null) _allCampaigns = list;
                }

                FilterData();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải danh sách chiến dịch: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "LÀM MỚI";
            }
        }

        private void FilterData()
        {
            if (dgCampaigns == null || _allCampaigns == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();

            var filtered = _allCampaigns.Where(c =>
                string.IsNullOrEmpty(query) ||
                (c.MaChienDich ?? "").ToLower().Contains(query) ||
                (c.TenChienDich ?? "").ToLower().Contains(query) ||
                (c.DiaDiem ?? "").ToLower().Contains(query)
            ).ToList();

            dgCampaigns.ItemsSource = filtered;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private async void btnViewBags_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is ChienDichHienMau camp)
            {
                txtModalTitle.Text = $"📋 CHI TIẾT TÚI MÁU: {camp.TenChienDich}";
                txtModalSubtitle.Text = $"Mã đợt hiến: {camp.MaChienDich} | Địa điểm: {camp.DiaDiem}";

                try
                {
                    var response = await ApiClient.Instance.Client.GetAsync($"/api/tuimau/blood-units?maChienDich={camp.MaChienDich}&size=100");
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        var JObj = JObject.Parse(json);
                        if (JObj["content"] != null)
                        {
                            var units = JsonConvert.DeserializeObject<List<BloodUnitInventoryDto>>(JObj["content"]!.ToString());
                            dgModalBags.ItemsSource = units;
                        }
                        else
                        {
                            dgModalBags.ItemsSource = new List<BloodUnitInventoryDto>();
                        }
                    }
                }
                catch { }

                BagsModal.Visibility = Visibility.Visible;
            }
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            BagsModal.Visibility = Visibility.Collapsed;
        }
    }
}
