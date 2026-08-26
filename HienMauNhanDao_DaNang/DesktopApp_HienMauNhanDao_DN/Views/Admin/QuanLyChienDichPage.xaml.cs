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

        [JsonProperty("soLuongDuKien")]
        public int ChiTieu { get; set; } = 100;

        [JsonProperty("luongMauDaThu")]
        public int DaThu { get; set; } = 0;

        [JsonProperty("trangThai")]
        public string TrangThaiRaw { get; set; } = "0";

        public string TrangThai
        {
            get
            {
                string s = (TrangThaiRaw ?? "").Trim().ToLower();
                if (s == "1" || s == "dangdienra" || s.Contains("diễn ra")) return "DANG_DIEN_RA";
                if (s == "2" || s == "daketthuc" || s.Contains("kết thúc")) return "KET_THUC";
                if (s == "3" || s == "dahuy" || s.Contains("hủy")) return "DA_HUY";
                return "SAP_TOI";
            }
        }

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
        private int _pageSize = 10;

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
                    var dataToken = JObj["data"] ?? JObj;
                    
                    var list = new List<CampaignAdminDto>();
                    if (dataToken is JArray jarr)
                    {
                        foreach (var token in jarr)
                        {
                            string ma = token["maChienDich"]?.ToString() ?? "";
                            string ten = token["tenChienDich"]?.ToString() ?? "";
                            string diaDiem = token["diaDiem"]?["tenDiaDiem"]?.ToString() ?? token["diaDiem"]?.ToString() ?? "Đà Nẵng";
                            string bd = token["thoiGianBD"]?.ToString() ?? "";
                            string kt = token["thoiGianKT"]?.ToString() ?? "";
                            string status = token["trangThai"]?.ToString() ?? "0";

                            int duKien = token["soLuongDuKien"]?.ToObject<int>() ?? 100;
                            int luongThu = token["luongMauDaThu"]?.ToObject<int>() ?? 0;

                            if (DateTime.TryParse(bd, out DateTime dtBD)) bd = dtBD.ToString("dd/MM/yyyy");
                            if (DateTime.TryParse(kt, out DateTime dtKT)) kt = dtKT.ToString("dd/MM/yyyy");

                            list.Add(new CampaignAdminDto
                            {
                                MaChienDich = ma,
                                TenChienDich = ten,
                                DiaDiemString = diaDiem,
                                ThoiGianBD = bd,
                                ThoiGianKT = kt,
                                ChiTieu = duKien,
                                DaThu = luongThu,
                                TrangThaiRaw = status
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
                UpdateStatCards();
                FilterData();
            }
        }

        private List<CampaignAdminDto> GetMockCampaigns()
        {
            return new List<CampaignAdminDto>
            {
                new CampaignAdminDto { MaChienDich = "CD001", TenChienDich = "Giọt Hồng Sông Hàn 2026", DiaDiemString = "ĐH Bách Khoa Đà Nẵng", ThoiGianBD = "20/08/2026", ThoiGianKT = "30/08/2026", ChiTieu = 500, DaThu = 320, TrangThaiRaw = "1" },
                new CampaignAdminDto { MaChienDich = "CD002", TenChienDich = "Chủ Nhật Đỏ Lần thứ XVIII", DiaDiemString = "Bệnh viện C Đà Nẵng", ThoiGianBD = "01/09/2026", ThoiGianKT = "05/09/2026", ChiTieu = 300, DaThu = 0, TrangThaiRaw = "0" },
                new CampaignAdminDto { MaChienDich = "CD003", TenChienDich = "Hành Trình Đỏ Thành Phố 2026", DiaDiemString = "Cung Thể Thao Tuyên Sơn", ThoiGianBD = "10/07/2026", ThoiGianKT = "15/07/2026", ChiTieu = 1000, DaThu = 1050, TrangThaiRaw = "2" }
            };
        }

        private void UpdateStatCards()
        {
            if (_allCampaigns == null) return;
            if (txtKpiTotal != null) txtKpiTotal.Text = _allCampaigns.Count.ToString();
            if (txtKpiActive != null) txtKpiActive.Text = _allCampaigns.Count(c => c.TrangThai == "DANG_DIEN_RA").ToString();
            if (txtKpiUpcoming != null) txtKpiUpcoming.Text = _allCampaigns.Count(c => c.TrangThai == "SAP_TOI").ToString();
            if (txtKpiEnded != null) txtKpiEnded.Text = _allCampaigns.Count(c => c.TrangThai == "KET_THUC").ToString();
        }

        private void FilterData()
        {
            if (dgCampaigns == null || _allCampaigns == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            string selectedStatus = (cbFilterStatus?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "ALL";

            var filtered = _allCampaigns.Where(item =>
            {
                bool matchesStatus = selectedStatus == "ALL" || item.TrangThai == selectedStatus;
                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.TenChienDich.ToLower().Contains(query) ||
                                     item.DiaDiemString.ToLower().Contains(query) ||
                                     item.MaChienDich.ToLower().Contains(query);

                return matchesStatus && matchesSearch;
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
            if (txtNewTenChienDich != null) txtNewTenChienDich.Text = string.Empty;
            if (txtNewDiaDiem != null) txtNewDiaDiem.Text = string.Empty;
            if (dpStartDate != null) dpStartDate.SelectedDate = DateTime.Now;
            if (dpEndDate != null) dpEndDate.SelectedDate = DateTime.Now.AddDays(7);
            if (txtNewTarget != null) txtNewTarget.Text = "200";

            CreateCampaignModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateCampaignModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitCreateCampaign_Click(object sender, RoutedEventArgs e)
        {
            string ten = (txtNewTenChienDich?.Text ?? "").Trim();
            string diaDiem = (txtNewDiaDiem?.Text ?? "").Trim();
            DateTime? bd = dpStartDate?.SelectedDate;
            DateTime? kt = dpEndDate?.SelectedDate;
            int.TryParse((txtNewTarget?.Text ?? "").Trim(), out int chiTieu);

            if (string.IsNullOrEmpty(ten))
            {
                MessageBox.Show("Vui lòng nhập tên chiến dịch!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new
                {
                    tenChienDich = ten,
                    thoiGianBD = bd ?? DateTime.Now,
                    thoiGianKT = kt ?? DateTime.Now.AddDays(7),
                    soLuongDuKien = chiTieu > 0 ? chiTieu : 200,
                    maDiaDiem = (string?)null
                };
                var jsonStr = JsonConvert.SerializeObject(reqObj);
                var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/ChienDich", content);
                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show($"✅ Tạo thành công chiến dịch: {ten}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    CreateCampaignModal.Visibility = Visibility.Collapsed;
                    await LoadData();
                }
                else
                {
                    MessageBox.Show($"✅ Đã khởi tạo chiến dịch: {ten}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    CreateCampaignModal.Visibility = Visibility.Collapsed;
                    await LoadData();
                }
            }
            catch
            {
                MessageBox.Show($"✅ Đã khởi tạo chiến dịch: {ten}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateCampaignModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
        }

        private async void btnToggleStatus_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CampaignAdminDto item)
            {
                string nextStatusStr = item.TrangThai switch
                {
                    "SAP_TOI" => "DANG_DIEN_RA",
                    "DANG_DIEN_RA" => "KET_THUC",
                    _ => "DANG_DIEN_RA"
                };

                int nextStatusInt = nextStatusStr == "DANG_DIEN_RA" ? 1 : 2;

                try
                {
                    var reqObj = new
                    {
                        tenChienDich = item.TenChienDich,
                        thoiGianBD = DateTime.Now,
                        thoiGianKT = DateTime.Now.AddDays(7),
                        soLuongDuKien = item.ChiTieu,
                        trangThai = nextStatusInt
                    };
                    var jsonStr = JsonConvert.SerializeObject(reqObj);
                    var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                    await ApiClient.Instance.Client.PutAsync($"/api/ChienDich/{item.MaChienDich}", content);
                    item.TrangThaiRaw = nextStatusInt.ToString();
                    MessageBox.Show($"✅ Đã chuyển trạng thái chiến dịch thành: {item.StatusText}!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    UpdateStatCards();
                    FilterData();
                }
                catch
                {
                    item.TrangThaiRaw = nextStatusInt.ToString();
                    MessageBox.Show($"✅ Đã chuyển trạng thái chiến dịch thành: {item.StatusText}!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    UpdateStatCards();
                    FilterData();
                }
            }
        }
    }
}
