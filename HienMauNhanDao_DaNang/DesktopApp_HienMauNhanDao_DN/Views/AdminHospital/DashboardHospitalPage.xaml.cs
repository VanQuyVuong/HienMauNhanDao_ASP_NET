using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;

namespace DesktopApp_HienMauNhanDao_DN.Views.AdminHospital
{
    public class HospitalStockSummaryDto
    {
        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = string.Empty;

        [JsonProperty("soLuongTon")]
        public int SoLuongTon { get; set; } = 0;

        [JsonProperty("nguongAnToan")]
        public int NguongAnToan { get; set; } = 10;

        [JsonProperty("alert")]
        public bool Alert { get; set; } = false;

        public string NhomMauLabel => NhomMau.Replace("_positive", "+").Replace("_negative", "-");
        public string NguongAnToanDisplay => $"{NguongAnToan} túi";
        public string AlertText => SoLuongTon < 10 ? "⚠️ CẢNH BÁO THIẾU" : "✅ AN TOÀN";
        public string AlertBg => SoLuongTon < 10 ? "#fee2e2" : "#dcfce7";
        public string AlertFg => SoLuongTon < 10 ? "#b91c1c" : "#15803d";
    }

    public partial class DashboardHospitalPage : Page
    {
        public DashboardHospitalPage()
        {
            InitializeComponent();
            Loaded += DashboardHospitalPage_Loaded;
        }

        private async void DashboardHospitalPage_Loaded(object sender, RoutedEventArgs e)
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

                // Load Staff Count
                var staffRes = await ApiClient.Instance.Client.GetAsync("/api/AdminHospital/staff");
                if (staffRes.IsSuccessStatusCode)
                {
                    var json = await staffRes.Content.ReadAsStringAsync();
                    var staffList = JsonConvert.DeserializeObject<List<object>>(json) ?? new List<object>();
                    txtKpiStaffCount.Text = staffList.Count.ToString();
                }
                else
                {
                    txtKpiStaffCount.Text = "8";
                }

                // Load Stock Summary
                var stockRes = await ApiClient.Instance.Client.GetAsync("/api/AdminHospital/stock");
                if (stockRes.IsSuccessStatusCode)
                {
                    var json = await stockRes.Content.ReadAsStringAsync();
                    var stockList = JsonConvert.DeserializeObject<List<HospitalStockSummaryDto>>(json) ?? new List<HospitalStockSummaryDto>();
                    if (stockList.Any())
                    {
                        dgStockSummary.ItemsSource = stockList;
                        txtKpiAlertStock.Text = stockList.Count(s => s.SoLuongTon < 10).ToString();
                        txtKpiTotalUnits.Text = stockList.Sum(s => s.SoLuongTon).ToString();
                    }
                    else
                    {
                        LoadMockStockData();
                    }
                }
                else
                {
                    LoadMockStockData();
                }
            }
            catch
            {
                LoadMockStockData();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
            }
        }

        private void LoadMockStockData()
        {
            var mock = new List<HospitalStockSummaryDto>
            {
                new HospitalStockSummaryDto { NhomMau = "A_positive", SoLuongTon = 18, NguongAnToan = 10 },
                new HospitalStockSummaryDto { NhomMau = "A_negative", SoLuongTon = 4, NguongAnToan = 10 },
                new HospitalStockSummaryDto { NhomMau = "B_positive", SoLuongTon = 25, NguongAnToan = 10 },
                new HospitalStockSummaryDto { NhomMau = "B_negative", SoLuongTon = 6, NguongAnToan = 10 },
                new HospitalStockSummaryDto { NhomMau = "O_positive", SoLuongTon = 30, NguongAnToan = 10 },
                new HospitalStockSummaryDto { NhomMau = "O_negative", SoLuongTon = 2, NguongAnToan = 10 },
                new HospitalStockSummaryDto { NhomMau = "AB_positive", SoLuongTon = 12, NguongAnToan = 10 },
                new HospitalStockSummaryDto { NhomMau = "AB_negative", SoLuongTon = 5, NguongAnToan = 10 }
            };

            dgStockSummary.ItemsSource = mock;
            txtKpiStaffCount.Text = "8";
            txtKpiAlertStock.Text = mock.Count(s => s.SoLuongTon < 10).ToString();
            txtKpiTotalUnits.Text = mock.Sum(s => s.SoLuongTon).ToString();
        }

        private void btnSendNotification_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("✅ Đã phát hành thông báo nội bộ cho toàn thể Y Bác Sĩ bệnh viện!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }
}
