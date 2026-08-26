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
    public partial class ThongKeTonKhoPage : Page
    {
        private List<KhoMauNhomDto> _allInventory = new List<KhoMauNhomDto>();

        public ThongKeTonKhoPage()
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

                await Task.WhenAll(FetchInventory(), FetchStats());

                FilterData();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải dữ liệu: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "LÀM MỚI";
            }
        }

        private async Task FetchInventory()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/KhoMauBenhVien/my-hospital-inventory");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);
                    if (JObj["data"] != null)
                    {
                        _allInventory = JsonConvert.DeserializeObject<List<KhoMauNhomDto>>(JObj["data"]!.ToString()) ?? new List<KhoMauNhomDto>();
                    }
                }
            }
            catch { }
        }

        private async Task FetchStats()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/tuimau/dashboard/stats");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var jobj = JObject.Parse(json);

                    txtKpiTotalUnits.Text = jobj["totalBloodUnits"]?.ToString() ?? "0";
                    txtKpiVolunteers.Text = jobj["newVolunteers"]?.ToString() ?? "0";
                    txtKpiCampaigns.Text = jobj["activeCampaigns"]?.ToString() ?? "0";

                    double passRate = jobj["screeningPassRate"] != null ? Convert.ToDouble(jobj["screeningPassRate"]) : 100.0;
                    txtKpiPassRate.Text = $"{passRate:F0}%";
                }
            }
            catch { }
        }

        private void FilterData()
        {
            string query = (txtSearch.Text ?? "").Trim().ToLower();
            var selectedItem = cbFilterStatus.SelectedItem as ComboBoxItem;
            string filterTag = selectedItem?.Tag?.ToString() ?? "ALL";

            var filtered = _allInventory.Where(item =>
            {
                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.MaKho.ToLower().Contains(query) ||
                                     item.TenKho.ToLower().Contains(query) ||
                                     item.NhomMauString.ToLower().Contains(query);

                bool matchesStatus = true;
                if (filterTag == "AN_TOAN") matchesStatus = item.IsAnToan;
                else if (filterTag == "CAN_KIET") matchesStatus = !item.IsAnToan;

                return matchesSearch && matchesStatus;
            }).ToList();

            dgKhoMau.ItemsSource = filtered;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private void cbFilterStatus_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }
    }
}
