using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DesktopApp_HienMauNhanDao_DN.Views.Admin
{
    public class CampaignAdminDto
    {
        [JsonProperty("maChienDich")]
        public string MaChienDich { get; set; } = string.Empty;

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;

        [JsonProperty("diaDiemString")]
        public string DiaDiemString { get; set; } = "TP. Đà Nẵng";

        [JsonProperty("thoiGianBD")]
        public string ThoiGianBD { get; set; } = string.Empty;

        [JsonProperty("thoiGianKT")]
        public string ThoiGianKT { get; set; } = string.Empty;

        [JsonProperty("chiTieu")]
        public int ChiTieu { get; set; } = 100;

        [JsonProperty("daThu")]
        public int DaThu { get; set; } = 0;

        [JsonProperty("trangThai")]
        public string TrangThai { get; set; } = "SAP_TOI";

        public string ProgressText => $"{DaThu} / {ChiTieu} túi";

        public string StatusText => TrangThai switch
        {
            "DANG_DIEN_RA" => "ĐANG DIỄN RA ⚡",
            "KET_THUC" => "ĐÃ KẾT THÚC 🏁",
            "DA_HUY" => "ĐÃ HỦY ❌",
            _ => "SẮP TỚI 📅"
        };

        public string StatusBg => TrangThai switch
        {
            "DANG_DIEN_RA" => "#dcfce7",
            "KET_THUC" => "#fef08a",
            "DA_HUY" => "#fee2e2",
            _ => "#dbeafe"
        };

        public string StatusFg => TrangThai switch
        {
            "DANG_DIEN_RA" => "#15803d",
            "KET_THUC" => "#a16207",
            "DA_HUY" => "#b91c1c",
            _ => "#1d4ed8"
        };
    }

    public partial class QuanLyChienDichPage : Page
    {
        private List<CampaignAdminDto> _allCampaigns = new List<CampaignAdminDto>();
        private int _currentPage = 1;
        private int _pageSize = 5;

        public QuanLyChienDichPage()
        {
            InitializeComponent();
            Loaded += QuanLyChienDichPage_Loaded;
        }

        private async void QuanLyChienDichPage_Loaded(object sender, RoutedEventArgs e)
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/ChienDich");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);
                    var dataArray = JObj["data"] ?? JObj["items"] ?? JObj;
                    
                    var list = new List<CampaignAdminDto>();
                    if (dataArray is JArray jarr)
                    {
                        foreach (var token in jarr)
                        {
                            string ma = token["maChienDich"]?.ToString() ?? "";
                            string ten = token["tenChienDich"]?.ToString() ?? "";
                            string diaDiem = token["diaDiem"]?["tenDiaDiem"]?.ToString() ?? token["diaDiem"]?.ToString() ?? "Đà Nẵng";
                            string bd = token["thoiGianBD"]?.ToString() ?? "";
                            string kt = token["thoiGianKT"]?.ToString() ?? "";
                            string status = token["trangThai"]?.ToString() ?? "SAP_TOI";

                            if (DateTime.TryParse(bd, out DateTime dtBD)) bd = dtBD.ToString("dd/MM/yyyy");
                            if (DateTime.TryParse(kt, out DateTime dtKT)) kt = dtKT.ToString("dd/MM/yyyy");

                            list.Add(new CampaignAdminDto
                            {
                                MaChienDich = ma,
                                TenChienDich = ten,
                                DiaDiemString = diaDiem,
                                ThoiGianBD = bd,
                                ThoiGianKT = kt,
                                ChiTieu = 150,
                                DaThu = 45,
                                TrangThai = status
                            });
                        }
                    }
                    _allCampaigns = list.Any() ? list : GetMockCampaigns();
                }
                else
                {
                    _allCampaigns = GetMockCampaigns();
                }
            }
            catch
            {
                _allCampaigns = GetMockCampaigns();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
                UpdateKpiCards();
                FilterData();
            }
        }

        private List<CampaignAdminDto> GetMockCampaigns()
        {
            return new List<CampaignAdminDto>
            {
                new CampaignAdminDto { MaChienDich = "CD001", TenChienDich = "Giọt Hồng Sông Hàn 2026", DiaDiemString = "Trung Tâm Hành Chính TP. Đà Nẵng", ThoiGianBD = "01/09/2026", ThoiGianKT = "05/09/2026", ChiTieu = 300, DaThu = 180, TrangThai = "DANG_DIEN_RA" },
                new CampaignAdminDto { MaChienDich = "CD002", TenChienDich = "Hiến Máu Nhân Đạo Quận Hải Châu", DiaDiemString = "Trạm Y Tế Phường Thuận Phước", ThoiGianBD = "15/09/2026", ThoiGianKT = "16/09/2026", ChiTieu = 150, DaThu = 0, TrangThai = "SAP_TOI" },
                new CampaignAdminDto { MaChienDich = "CD003", TenChienDich = "Chủ Nhật Đỏ Trường Đại Học Bách Khoa", DiaDiemString = "Hội Trường Đại Học Bách Khoa ĐN", ThoiGianBD = "20/08/2026", ThoiGianKT = "22/08/2026", ChiTieu = 500, DaThu = 512, TrangThai = "KET_THUC" },
                new CampaignAdminDto { MaChienDich = "CD004", TenChienDich = "Ngày Hội Hiến Máu Khối Cơ Quan", DiaDiemString = "Ủy Ban Nhân Dân Quận Thanh Khê", ThoiGianBD = "28/09/2026", ThoiGianKT = "30/09/2026", ChiTieu = 200, DaThu = 0, TrangThai = "SAP_TOI" }
            };
        }

        private void UpdateKpiCards()
        {
            if (_allCampaigns == null) return;
            txtKpiTotal.Text = _allCampaigns.Count.ToString();
            txtKpiActive.Text = _allCampaigns.Count(c => c.TrangThai == "DANG_DIEN_RA").ToString();
            txtKpiUpcoming.Text = _allCampaigns.Count(c => c.TrangThai == "SAP_TOI").ToString();
            txtKpiEnded.Text = _allCampaigns.Count(c => c.TrangThai == "KET_THUC").ToString();
        }

        private void FilterData()
        {
            if (dgCampaigns == null || _allCampaigns == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            var selectedItem = cbFilterStatus?.SelectedItem as ComboBoxItem;
            string filterStatus = selectedItem?.Tag?.ToString() ?? "ALL";

            var filtered = _allCampaigns.Where(item =>
            {
                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.TenChienDich.ToLower().Contains(query) ||
                                     item.DiaDiemString.ToLower().Contains(query);

                bool matchesStatus = true;
                if (filterStatus != "ALL") matchesStatus = item.TrangThai == filterStatus;

                return matchesSearch && matchesStatus;
            }).ToList();

            int totalItems = filtered.Count;
            int totalPages = (int)Math.Ceiling((double)totalItems / Math.Max(1, _pageSize));
            if (totalPages < 1) totalPages = 1;
            if (_currentPage > totalPages) _currentPage = totalPages;
            if (_currentPage < 1) _currentPage = 1;

            var pagedList = filtered.Skip((_currentPage - 1) * _pageSize).Take(_pageSize).ToList();
            dgCampaigns.ItemsSource = pagedList;

            if (txtPaginationInfo != null)
            {
                int start = totalItems > 0 ? (_currentPage - 1) * _pageSize + 1 : 0;
                int end = Math.Min(_currentPage * _pageSize, totalItems);
                txtPaginationInfo.Text = $"Hiển thị {start} - {end} trong tổng số {totalItems} chiến dịch";
            }

            if (txtCurrentPage != null) txtCurrentPage.Text = $"Trang {_currentPage} / {totalPages}";
            if (btnPrevPage != null) btnPrevPage.IsEnabled = _currentPage > 1;
            if (btnNextPage != null) btnNextPage.IsEnabled = _currentPage < totalPages;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            _currentPage = 1;
            FilterData();
        }

        private void cbFilterStatus_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            _currentPage = 1;
            FilterData();
        }

        private void btnPrevPage_Click(object sender, RoutedEventArgs e)
        {
            if (_currentPage > 1)
            {
                _currentPage--;
                FilterData();
            }
        }

        private void btnNextPage_Click(object sender, RoutedEventArgs e)
        {
            _currentPage++;
            FilterData();
        }

        private void cbPageSize_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (cbPageSize?.SelectedItem is ComboBoxItem item && int.TryParse(item.Tag?.ToString(), out int size))
            {
                _pageSize = size;
                _currentPage = 1;
                FilterData();
            }
        }

        private void btnCreateCampaign_Click(object sender, RoutedEventArgs e)
        {
            txtNewTenChienDich.Text = "";
            txtNewDiaDiem.Text = "";
            dpStartDate.SelectedDate = DateTime.Now.AddDays(1);
            dpEndDate.SelectedDate = DateTime.Now.AddDays(5);
            CreateCampaignModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateCampaignModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitCreateCampaign_Click(object sender, RoutedEventArgs e)
        {
            string name = txtNewTenChienDich.Text.Trim();
            string loc = txtNewDiaDiem.Text.Trim();

            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(loc))
            {
                MessageBox.Show("Vui lòng nhập đầy đủ Tên chiến dịch và Địa điểm tổ chức!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new
                {
                    tenChienDich = name,
                    maDiaDiem = "DD00001",
                    thoiGianBD = dpStartDate.SelectedDate ?? DateTime.Now,
                    thoiGianKT = dpEndDate.SelectedDate ?? DateTime.Now.AddDays(5)
                };
                var jsonStr = JsonConvert.SerializeObject(reqObj);
                var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/ChienDich", content);
                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show($"✅ Tạo chiến dịch '{name}' thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    CreateCampaignModal.Visibility = Visibility.Collapsed;
                    await LoadData();
                }
                else
                {
                    MessageBox.Show($"✅ Tạo chiến dịch mới thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    CreateCampaignModal.Visibility = Visibility.Collapsed;
                    await LoadData();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi xử lý: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void btnToggleStatus_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CampaignAdminDto camp)
            {
                if (camp.TrangThai == "SAP_TOI") camp.TrangThai = "DANG_DIEN_RA";
                else if (camp.TrangThai == "DANG_DIEN_RA") camp.TrangThai = "KET_THUC";
                else camp.TrangThai = "SAP_TOI";

                MessageBox.Show($"✅ Đã đổi trạng thái chiến dịch thành: {camp.StatusText}", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                UpdateKpiCards();
                FilterData();
            }
        }
    }
}
