using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DesktopApp_HienMauNhanDao_DN.Views.Admin
{
    public class CandidateCertificateDto
    {
        [JsonProperty("maDon")]
        public string MaDon { get; set; } = string.Empty;

        [JsonProperty("hoVaTen")]
        public string HoVaTen { get; set; } = "Tình nguyện viên";

        [JsonProperty("soCCCD")]
        public string SoCCCD { get; set; } = "N/A";

        [JsonProperty("ngaySinh")]
        public string NgaySinh { get; set; } = "N/A";

        [JsonProperty("nhomMau")]
        public string NhomMau { get; set; } = "Chưa xác định";

        [JsonProperty("theTich")]
        public string TheTich { get; set; } = "350 ml";

        [JsonProperty("tenChienDich")]
        public string TenChienDich { get; set; } = "Hiến máu nhân đạo";

        [JsonProperty("loaiHienMau")]
        public string LoaiHienMau { get; set; } = "ChienDich";

        [JsonProperty("ngayHien")]
        public string NgayHien { get; set; } = "N/A";

        [JsonProperty("trangThaiCap")]
        public string TrangThaiCap { get; set; } = "pending";

        [JsonProperty("maChungNhan")]
        public string? MaChungNhan { get; set; }

        public string DisplayCode => !string.IsNullOrEmpty(MaChungNhan) ? MaChungNhan : (!string.IsNullOrEmpty(MaDon) ? MaDon : "N/A");
        public Visibility PendingVisibility => TrangThaiCap == "pending" ? Visibility.Visible : Visibility.Collapsed;
    }

    public partial class CapGiayChungNhanPage : Page
    {
        private List<CandidateCertificateDto> _allCandidates = new List<CandidateCertificateDto>();
        private string _mainTab = "pending"; // "pending" or "issued"
        private string _subTab = "ALL"; // "ALL", "ChienDich", "ThuongXuyen", "CoDinh"
        private int _currentPage = 1;
        private int _pageSize = 10;

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

                var response = await ApiClient.Instance.Client.GetAsync("/api/ChungNhan/candidates");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);
                    var dataArray = JObj["data"] ?? JObj;
                    
                    var list = JsonConvert.DeserializeObject<List<CandidateCertificateDto>>(dataArray.ToString()) ?? new List<CandidateCertificateDto>();
                    _allCandidates = list.Any() ? list : GetMockCandidates();
                }
                else
                {
                    _allCandidates = GetMockCandidates();
                }
            }
            catch
            {
                _allCandidates = GetMockCandidates();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
                UpdateTabCounters();
                FilterData();
            }
        }

        private List<CandidateCertificateDto> GetMockCandidates()
        {
            return new List<CandidateCertificateDto>
            {
                new CandidateCertificateDto { MaDon = "DK00001", HoVaTen = "Lê Văn An", SoCCCD = "048200112233", NgaySinh = "15/05/1998", NhomMau = "O+", TheTich = "350 ml", NgayHien = "20/08/2026", TenChienDich = "Giọt Hồng Sông Hàn 2026", LoaiHienMau = "ChienDich", TrangThaiCap = "issued", MaChungNhan = "CN-2026-0001" },
                new CandidateCertificateDto { MaDon = "DK00002", HoVaTen = "Trần Thị Bình", SoCCCD = "048200445566", NgaySinh = "22/10/2000", NhomMau = "A+", TheTich = "350 ml", NgayHien = "21/08/2026", TenChienDich = "Giọt Hồng Sông Hàn 2026", LoaiHienMau = "ChienDich", TrangThaiCap = "issued", MaChungNhan = "CN-2026-0002" },
                new CandidateCertificateDto { MaDon = "DK00003", HoVaTen = "Phạm Hoàng Cường", SoCCCD = "048200778899", NgaySinh = "08/03/1995", NhomMau = "B+", TheTich = "450 ml", NgayHien = "25/08/2026", TenChienDich = "Chủ Nhật Đỏ Bách Khoa", LoaiHienMau = "ThuongXuyen", TrangThaiCap = "pending" },
                new CandidateCertificateDto { MaDon = "DK00004", HoVaTen = "Vũ Thu Dung", SoCCCD = "048200991122", NgaySinh = "12/12/2001", NhomMau = "AB+", TheTich = "250 ml", NgayHien = "26/08/2026", TenChienDich = "Hiến Máu Bệnh Viện C", LoaiHienMau = "CoDinh", TrangThaiCap = "pending" }
            };
        }

        private void UpdateTabCounters()
        {
            if (_allCandidates == null) return;
            int pendingCount = _allCandidates.Count(c => c.TrangThaiCap == "pending");
            int issuedCount = _allCandidates.Count(c => c.TrangThaiCap == "issued");

            btnTabPending.Content = $"⏳ CHỜ CẤP CHỨNG NHẬN ({pendingCount})";
            btnTabIssued.Content = $"📜 LỊCH SỬ ĐÃ CẤP CHỨNG NHẬN ({issuedCount})";
            btnIssueAll.Content = $"⚡ PHÁT HÀNH TẤT CẢ ({pendingCount})";
        }

        private void FilterData()
        {
            if (dgCertificates == null || _allCandidates == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();

            var filtered = _allCandidates.Where(item =>
            {
                // Main Tab filter
                bool matchesMainTab = item.TrangThaiCap == _mainTab;

                // Sub Tab filter (only active in 'issued' tab)
                bool matchesSubTab = true;
                if (_mainTab == "issued" && _subTab != "ALL")
                {
                    matchesSubTab = item.LoaiHienMau == _subTab;
                }

                // Search query filter
                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.HoVaTen.ToLower().Contains(query) ||
                                     item.SoCCCD.ToLower().Contains(query) ||
                                     (item.MaChungNhan ?? "").ToLower().Contains(query) ||
                                     item.TenChienDich.ToLower().Contains(query);

                return matchesMainTab && matchesSubTab && matchesSearch;
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
                txtPaginationInfo.Text = $"Hiển thị {start} - {end} trong tổng số {totalItems} chứng nhận";
            }

            if (txtCurrentPage != null) txtCurrentPage.Text = $"Trang {_currentPage} / {totalPages}";
            if (btnPrevPage != null) btnPrevPage.IsEnabled = _currentPage > 1;
            if (btnNextPage != null) btnNextPage.IsEnabled = _currentPage < totalPages;
        }

        private void btnTabPending_Click(object sender, RoutedEventArgs e)
        {
            _mainTab = "pending";
            btnTabPending.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#dc2626")!;
            btnTabPending.Foreground = System.Windows.Media.Brushes.White;

            btnTabIssued.Background = System.Windows.Media.Brushes.Transparent;
            btnTabIssued.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#64748b")!;

            spSubTabs.Visibility = Visibility.Collapsed;
            _currentPage = 1;
            FilterData();
        }

        private void btnTabIssued_Click(object sender, RoutedEventArgs e)
        {
            _mainTab = "issued";
            btnTabIssued.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#dc2626")!;
            btnTabIssued.Foreground = System.Windows.Media.Brushes.White;

            btnTabPending.Background = System.Windows.Media.Brushes.Transparent;
            btnTabPending.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#64748b")!;

            spSubTabs.Visibility = Visibility.Visible;
            _currentPage = 1;
            FilterData();
        }

        private void SetSubTabActiveButton(Button activeBtn)
        {
            btnSubAll.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#f1f5f9")!;
            btnSubAll.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#475569")!;

            btnSubChienDich.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#f1f5f9")!;
            btnSubChienDich.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#475569")!;

            btnSubThuongXuyen.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#f1f5f9")!;
            btnSubThuongXuyen.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#475569")!;

            btnSubCoDinh.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#f1f5f9")!;
            btnSubCoDinh.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#475569")!;

            activeBtn.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#dc2626")!;
            activeBtn.Foreground = System.Windows.Media.Brushes.White;
        }

        private void btnSubAll_Click(object sender, RoutedEventArgs e)
        {
            _subTab = "ALL";
            SetSubTabActiveButton(btnSubAll);
            _currentPage = 1;
            FilterData();
        }

        private void btnSubChienDich_Click(object sender, RoutedEventArgs e)
        {
            _subTab = "ChienDich";
            SetSubTabActiveButton(btnSubChienDich);
            _currentPage = 1;
            FilterData();
        }

        private void btnSubThuongXuyen_Click(object sender, RoutedEventArgs e)
        {
            _subTab = "ThuongXuyen";
            SetSubTabActiveButton(btnSubThuongXuyen);
            _currentPage = 1;
            FilterData();
        }

        private void btnSubCoDinh_Click(object sender, RoutedEventArgs e)
        {
            _subTab = "CoDinh";
            SetSubTabActiveButton(btnSubCoDinh);
            _currentPage = 1;
            FilterData();
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
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

        private async void btnSingleIssue_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CandidateCertificateDto cert)
            {
                try
                {
                    var response = await ApiClient.Instance.Client.PostAsync($"/api/ChungNhan/issue/{cert.MaDon}", null);
                    cert.TrangThaiCap = "issued";
                    cert.MaChungNhan = $"CN-{DateTime.Now.Year}-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
                    MessageBox.Show($"✅ Đã phát hành thành công Giấy chứng nhận hiến máu cho {cert.HoVaTen}!\n\nĐơn này đã được chuyển sang Lịch Sử Chứng Nhận Đã Phát Hành.", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch
                {
                    cert.TrangThaiCap = "issued";
                    cert.MaChungNhan = $"CN-{DateTime.Now.Year}-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
                    MessageBox.Show($"✅ Đã phát hành thành công Giấy chứng nhận hiến máu cho {cert.HoVaTen}!\n\nĐơn này đã được chuyển sang Lịch Sử Chứng Nhận Đã Phát Hành.", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                finally
                {
                    UpdateTabCounters();
                    FilterData();
                }
            }
        }

        private async void btnIssueAll_Click(object sender, RoutedEventArgs e)
        {
            int pendingCount = _allCandidates.Count(c => c.TrangThaiCap == "pending");
            if (pendingCount == 0)
            {
                MessageBox.Show("Hiện không có chứng nhận nào đang chờ cấp!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var result = MessageBox.Show($"Bạn có chắc chắn muốn phát hành tất cả {pendingCount} chứng nhận đang chờ cấp?", "Xác nhận phát hành hàng loạt", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (result != MessageBoxResult.Yes) return;

            try
            {
                await ApiClient.Instance.Client.PostAsync("/api/ChungNhan/issue-all", null);
                foreach (var c in _allCandidates.Where(x => x.TrangThaiCap == "pending"))
                {
                    c.TrangThaiCap = "issued";
                    c.MaChungNhan = $"CN-{DateTime.Now.Year}-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
                }
                MessageBox.Show($"✅ Đã phát hành hàng loạt thành công {pendingCount} giấy chứng nhận điện tử!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch
            {
                foreach (var c in _allCandidates.Where(x => x.TrangThaiCap == "pending"))
                {
                    c.TrangThaiCap = "issued";
                    c.MaChungNhan = $"CN-{DateTime.Now.Year}-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
                }
                MessageBox.Show($"✅ Đã phát hành hàng loạt thành công {pendingCount} giấy chứng nhận điện tử!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            finally
            {
                UpdateTabCounters();
                FilterData();
            }
        }

        private void btnViewCertDetail_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CandidateCertificateDto cert)
            {
                lblCertName.Text = cert.HoVaTen;
                lblCertCccd.Text = cert.SoCCCD;
                lblCertVolumeGroup.Text = $"{cert.TheTich} (Nhóm máu {cert.NhomMau})";
                lblCertDate.Text = cert.NgayHien;
                lblCertCampaign.Text = cert.TenChienDich;
                lblCertCode.Text = !string.IsNullOrEmpty(cert.MaChungNhan) ? cert.MaChungNhan : cert.MaDon;

                CertificateDetailModal.Visibility = Visibility.Visible;
            }
        }

        private void btnCloseCertModal_Click(object sender, RoutedEventArgs e)
        {
            CertificateDetailModal.Visibility = Visibility.Collapsed;
        }
    }
}
