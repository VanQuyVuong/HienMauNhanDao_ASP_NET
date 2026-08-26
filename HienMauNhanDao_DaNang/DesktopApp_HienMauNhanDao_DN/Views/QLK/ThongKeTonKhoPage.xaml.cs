using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
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

                await Task.WhenAll(FetchInventory(), FetchStats(), FetchCharts());

                FilterData();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải thống kê: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "LÀM MỚI";
            }
        }

        private async Task FetchCharts()
        {
            // 1. Fetch Bar Chart 12 Months
            try
            {
                var barRes = await ApiClient.Instance.Client.GetAsync("/api/tuimau/charts/bar?year=2026");
                if (barRes.IsSuccessStatusCode)
                {
                    var json = await barRes.Content.ReadAsStringAsync();
                    JArray monthsArray = null;

                    try { monthsArray = JArray.Parse(json); } catch { }
                    if (monthsArray == null)
                    {
                        try { monthsArray = JObject.Parse(json)["months"] as JArray; } catch { }
                    }

                    if (monthsArray != null && ugBarChart != null)
                    {
                        ugBarChart.Children.Clear();
                        int maxVal = 1;
                        foreach (var item in monthsArray)
                        {
                            int val = Convert.ToInt32(item["totalUnits"] ?? item["count"] ?? 0);
                            if (val > maxVal) maxVal = val;
                        }

                        int mIdx = 1;
                        foreach (var item in monthsArray)
                        {
                            int count = Convert.ToInt32(item["totalUnits"] ?? item["count"] ?? 0);
                            string monthLabel = item["month"]?.ToString() ?? $"T.{mIdx}";
                            double heightRatio = (double)count / Math.Max(1, maxVal);
                            double barHeight = Math.Max(10, heightRatio * 85);

                            var colBorder = new Border
                            {
                                Margin = new Thickness(2, 0, 2, 0),
                                VerticalAlignment = VerticalAlignment.Bottom
                            };

                            var stack = new StackPanel { HorizontalAlignment = HorizontalAlignment.Center };
                            
                            var txtCount = new TextBlock
                            {
                                Text = count.ToString(),
                                FontSize = 9,
                                FontWeight = FontWeights.Black,
                                Foreground = (Brush)new BrushConverter().ConvertFrom("#c2410c")!,
                                HorizontalAlignment = HorizontalAlignment.Center,
                                Margin = new Thickness(0, 0, 0, 2)
                            };

                            var pillar = new Border
                            {
                                Height = barHeight,
                                CornerRadius = new CornerRadius(4, 4, 0, 0),
                                Background = (Brush)new BrushConverter().ConvertFrom("#ea580c")!
                            };

                            var txtMonth = new TextBlock
                            {
                                Text = monthLabel.Replace("T.", "T"),
                                FontSize = 8,
                                FontWeight = FontWeights.Bold,
                                Foreground = (Brush)new BrushConverter().ConvertFrom("#64748b")!,
                                HorizontalAlignment = HorizontalAlignment.Center,
                                Margin = new Thickness(0, 3, 0, 0)
                            };

                            stack.Children.Add(txtCount);
                            stack.Children.Add(pillar);
                            stack.Children.Add(txtMonth);
                            colBorder.Child = stack;

                            ugBarChart.Children.Add(colBorder);
                            mIdx++;
                        }
                    }
                }
            }
            catch { }

            // 2. Fetch Pie Chart Blood Group Allocation
            try
            {
                var pieRes = await ApiClient.Instance.Client.GetAsync("/api/khomau/charts/pie");
                if (pieRes.IsSuccessStatusCode && spPieChart != null)
                {
                    var json = await pieRes.Content.ReadAsStringAsync();
                    JArray dataArray = null;
                    try { dataArray = JArray.Parse(json); } catch { }
                    if (dataArray == null)
                    {
                        try { dataArray = JObject.Parse(json)["data"] as JArray; } catch { }
                    }

                    if (dataArray != null)
                    {
                        spPieChart.Children.Clear();
                        string[] colors = { "#ea580c", "#2563eb", "#16a34a", "#9333ea" };
                        int colorIdx = 0;

                        foreach (var item in dataArray)
                        {
                            string group = item["nhomMau"]?.ToString() ?? "Khác";
                            double percent = Convert.ToDouble(item["percent"] ?? 0);
                            int value = Convert.ToInt32(item["value"] ?? 0);
                            string color = colors[colorIdx % colors.Length];
                            colorIdx++;

                            var itemGrid = new Grid { Margin = new Thickness(0, 0, 0, 8) };
                            itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(50) });
                            itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                            itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(60) });

                            var lblGroup = new TextBlock { Text = group, FontWeight = FontWeights.Black, FontSize = 12, Foreground = (Brush)new BrushConverter().ConvertFrom("#0f172a")! };
                            
                            var pbBorder = new Border { Background = (Brush)new BrushConverter().ConvertFrom("#f1f5f9")!, CornerRadius = new CornerRadius(4), Height = 10, VerticalAlignment = VerticalAlignment.Center };
                            var pbFill = new Border { Background = (Brush)new BrushConverter().ConvertFrom(color)!, CornerRadius = new CornerRadius(4), HorizontalAlignment = HorizontalAlignment.Left, Width = Math.Max(6, percent * 1.5) };
                            pbBorder.Child = pbFill;

                            var lblVal = new TextBlock { Text = $"{percent:F0}% ({value})", FontWeight = FontWeights.Bold, FontSize = 11, Foreground = (Brush)new BrushConverter().ConvertFrom("#64748b")!, HorizontalAlignment = HorizontalAlignment.Right };

                            Grid.SetColumn(lblGroup, 0);
                            Grid.SetColumn(pbBorder, 1);
                            Grid.SetColumn(lblVal, 2);

                            itemGrid.Children.Add(lblGroup);
                            itemGrid.Children.Add(pbBorder);
                            itemGrid.Children.Add(lblVal);

                            spPieChart.Children.Add(itemGrid);
                        }
                    }
                }
            }
            catch { }
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
            if (dgKhoMau == null || _allInventory == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            var selectedItem = cbFilterStatus?.SelectedItem as ComboBoxItem;
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
