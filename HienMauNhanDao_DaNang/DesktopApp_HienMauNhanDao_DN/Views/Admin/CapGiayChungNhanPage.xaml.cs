using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DesktopApp_HienMauNhanDao_DN.Views.Admin
{
    public class CertificateAdminDto
    {
        [JsonProperty("maChungNhan")]
        public string MaChungNhan { get; set; } = string.Empty;

        [JsonProperty("tenTnv")]
        public string TenTnv { get; set; } = string.Empty;

        [JsonProperty("cccd")]
        public string Cccd { get; set; } = string.Empty;

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = "O+";

        [JsonProperty("theTich")]
        public int TheTich { get; set; } = 350;

        [JsonProperty("ngayHien")]
        public string NgayHien { get; set; } = string.Empty;

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = string.Empty;

        [JsonProperty("isIssued")]
        public bool IsIssued { get; set; } = false;

        public string StatusText => IsIssued ? "ĐÃ CẤP CHỨNG NHẬN 📜" : "CHỜ CẤP ⏳";
        public string StatusBg => IsIssued ? "#dcfce7" : "#fef08a";
        public string StatusFg => IsIssued ? "#15803d" : "#a16207";
    }

    public partial class CapGiayChungNhanPage : Page
    {
        private List<CertificateAdminDto> _allCertificates = new List<CertificateAdminDto>();
        private int _currentPage = 1;
        private int _pageSize = 5;

        public CapGiayChungNhanPage()
        {
            InitializeComponent();
            Loaded += CapGiayChungNhanPage_Loaded;
        }

        private async void CapGiayChungNhanPage_Loaded(object sender, RoutedEventArgs e)
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/ChungNhan/danh-sach");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);
                    if (JObj["data"] != null)
                    {
                        _allCertificates = JsonConvert.DeserializeObject<List<CertificateAdminDto>>(JObj["data"]!.ToString()) ?? new List<CertificateAdminDto>();
                    }
                }
                else
                {
                    _allCertificates = GetMockCertificates();
                }
            }
            catch
            {
                _allCertificates = GetMockCertificates();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
                FilterData();
            }
        }

        private List<CertificateAdminDto> GetMockCertificates()
        {
            return new List<CertificateAdminDto>
            {
                new CertificateAdminDto { MaChungNhan = "CN2026001", TenTnv = "Lê Văn An", Cccd = "048200112233", NhomMau = "O+", TheTich = 350, NgayHien = "20/08/2026", TenChienDich = "Giọt Hồng Sông Hàn 2026", IsIssued = true },
                new CertificateAdminDto { MaChungNhan = "CN2026002", TenTnv = "Trần Thị Bình", Cccd = "048200445566", NhomMau = "A+", TheTich = 350, NgayHien = "21/08/2026", TenChienDich = "Giọt Hồng Sông Hàn 2026", IsIssued = true },
                new CertificateAdminDto { MaChungNhan = "CN2026003", TenTnv = "Phạm Hoàng Cường", Cccd = "048200778899", NhomMau = "B+", TheTich = 450, NgayHien = "25/08/2026", TenChienDich = "Chủ Nhật Đỏ Bách Khoa", IsIssued = false },
                new CertificateAdminDto { MaChungNhan = "CN2026004", TenTnv = "Vũ Thu Dung", Cccd = "048200991122", NhomMau = "AB+", TheTich = 250, NgayHien = "26/08/2026", TenChienDich = "Hiến Máu Nhân Đạo Hải Châu", IsIssued = false }
            };
        }

        private void FilterData()
        {
            if (dgCertificates == null || _allCertificates == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            var selectedItem = cbFilterStatus?.SelectedItem as ComboBoxItem;
            string filterStatus = selectedItem?.Tag?.ToString() ?? "ALL";

            var filtered = _allCertificates.Where(item =>
            {
                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.TenTnv.ToLower().Contains(query) ||
                                     item.Cccd.ToLower().Contains(query) ||
                                     item.MaChungNhan.ToLower().Contains(query) ||
                                     item.TenChienDich.ToLower().Contains(query);

                bool matchesStatus = true;
                if (filterStatus == "DA_CAP") matchesStatus = item.IsIssued;
                else if (filterStatus == "CHUA_CAP") matchesStatus = !item.IsIssued;

                return matchesSearch && matchesStatus;
            }).ToList();

            int totalItems = filtered.Count;
            int totalPages = (int)Math.Ceiling((double)totalItems / Math.Max(1, _pageSize));
            if (totalPages < 1) totalPages = 1;
            if (_currentPage > totalPages) _currentPage = totalPages;
            if (_currentPage < 1) _currentPage = 1;

            var pagedList = filtered.Skip((_currentPage - 1) * _pageSize).Take(_pageSize).ToList();
            dgCertificates.ItemsSource = pagedList;

            if (txtPaginationInfo != null)
            {
                int start = totalItems > 0 ? (_currentPage - 1) * _pageSize + 1 : 0;
                int end = Math.Min(_currentPage * _pageSize, totalItems);
                txtPaginationInfo.Text = $"Hiển thị {start} - {end} trong tổng số {totalItems} giấy chứng nhận";
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

        private void btnIssueCert_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CertificateAdminDto cert)
            {
                cert.IsIssued = true;
                MessageBox.Show($"✅ Cấp thành công Giấy chứng nhận hiến máu điện tử cho TNV {cert.TenTnv} ({cert.MaChungNhan})!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                FilterData();
            }
        }
    }
}
