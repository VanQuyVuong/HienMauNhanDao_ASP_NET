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

namespace DesktopApp_HienMauNhanDao_DN.Views.QLK
{
    public partial class QuanLyHanDungPage : Page
    {
        private List<BloodUnitInventoryDto> _allUnits = new List<BloodUnitInventoryDto>();

        public QuanLyHanDungPage()
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

                await Task.WhenAll(FetchStats(), FetchUnits());

                FilterData();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải hạn dùng: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "LÀM MỚI";
            }
        }

        private async Task FetchStats()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/tuimau/expiry-stats");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var stats = JsonConvert.DeserializeObject<ExpiryStatsDto>(json);
                    if (stats != null)
                    {
                        txtKpiSafe.Text = stats.SafeCount.ToString();
                        txtKpiNear.Text = stats.NearExpiryCount.ToString();
                        txtKpiExpired.Text = stats.ExpiredCount.ToString();
                    }
                }
            }
            catch { }
        }

        private async Task FetchUnits()
        {
            try
            {
                var selectedItem = cbFilterExpiry.SelectedItem as ComboBoxItem;
                string viewMode = selectedItem?.Tag?.ToString() ?? "all";
                string search = (txtSearch.Text ?? "").Trim();

                var response = await ApiClient.Instance.Client.GetAsync($"/api/tuimau/expiry-management?viewMode={viewMode}&search={search}");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var units = JsonConvert.DeserializeObject<List<BloodUnitInventoryDto>>(json);
                    if (units != null) _allUnits = units;
                }
            }
            catch { }
        }

        private void FilterData()
        {
            if (dgExpiryUnits == null || _allUnits == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();

            var filtered = _allUnits.Where(item =>
                string.IsNullOrEmpty(query) ||
                item.MaTuiMau.ToLower().Contains(query) ||
                item.TenTinhNguyenVien.ToLower().Contains(query) ||
                item.NhomMau.ToLower().Contains(query)
            ).ToList();

            dgExpiryUnits.ItemsSource = filtered;
        }

        private async void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            await FetchUnits();
            FilterData();
        }

        private async void cbFilterExpiry_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (IsLoaded)
            {
                await FetchUnits();
                FilterData();
            }
        }
    }
}
