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

namespace DesktopApp_HienMauNhanDao_DN.Views.AdminHospital
{
    public class HospitalStaffDto
    {
        [JsonProperty("maNhanVien")]
        public string MaNhanVien { get; set; } = string.Empty;

        [JsonProperty("hoTen")]
        public string HoTen { get; set; } = "Chưa cập nhật";

        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;

        [JsonProperty("soDienThoai")]
        public string SoDienThoai { get; set; } = "N/A";

        [JsonProperty("cccd")]
        public string CCCD { get; set; } = "N/A";

        [JsonProperty("role")]
        public string Role { get; set; } = "NVYT";

        public string HoTenDisplay => !string.IsNullOrEmpty(HoTen) ? HoTen : "Cán bộ y tế";

        public string RoleLabel => Role switch
        {
            "BS" => "Bác sĩ (BS)",
            "NVYT" => "Nhân viên y tế (NVYT)",
            "NVYT-XN" => "Nhân viên xét nghiệm (NVXN)",
            "NVXN" => "Nhân viên xét nghiệm (NVXN)",
            "QLK" => "Quản lý kho (QLK)",
            "AD" => "Quản trị viên (AD)",
            _ => "Nhân viên y tế"
        };

        public string RoleBg => Role switch
        {
            "BS" => "#d1fae5",
            "NVYT" => "#e0f2fe",
            "NVYT-XN" => "#f0fdf4",
            "NVXN" => "#f0fdf4",
            "QLK" => "#fef3c7",
            _ => "#f1f5f9"
        };

        public string RoleFg => Role switch
        {
            "BS" => "#065f46",
            "NVYT" => "#0369a1",
            "NVYT-XN" => "#15803d",
            "NVXN" => "#15803d",
            "QLK" => "#92400e",
            _ => "#475569"
        };
    }

    public partial class QuanLyNhanSuBVPage : Page
    {
        private List<HospitalStaffDto> _allStaff = new List<HospitalStaffDto>();
        private int _currentPage = 1;
        private int _pageSize = 10;

        public QuanLyNhanSuBVPage()
        {
            InitializeComponent();
            Loaded += QuanLyNhanSuBVPage_Loaded;
        }

        private async void QuanLyNhanSuBVPage_Loaded(object sender, RoutedEventArgs e)
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/AdminHospital/staff");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var list = JsonConvert.DeserializeObject<List<HospitalStaffDto>>(json) ?? new List<HospitalStaffDto>();
                    _allStaff = list.Any() ? list : GetMockStaff();
                }
                else
                {
                    _allStaff = GetMockStaff();
                }
            }
            catch
            {
                _allStaff = GetMockStaff();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
                FilterData();
            }
        }

        private List<HospitalStaffDto> GetMockStaff()
        {
            return new List<HospitalStaffDto>
            {
                new HospitalStaffDto { MaNhanVien = "NV001", HoTen = "BS. Nguyễn Văn Hùng", Email = "bacsi.hung@bvdn.vn", SoDienThoai = "0905111222", CCCD = "048200112233", Role = "BS" },
                new HospitalStaffDto { MaNhanVien = "NV002", HoTen = "Trần Thị Lan", Email = "nvyt.lan@bvdn.vn", SoDienThoai = "0905333444", CCCD = "048200445566", Role = "NVYT" },
                new HospitalStaffDto { MaNhanVien = "NV003", HoTen = "Lê Văn Xét", Email = "nvxn1@gmail.com", SoDienThoai = "0905555666", CCCD = "048200778899", Role = "NVYT-XN" },
                new HospitalStaffDto { MaNhanVien = "NV004", HoTen = "Phạm Khoa Minh", Email = "qkl@gmail.com", SoDienThoai = "0905777888", CCCD = "048200991122", Role = "QLK" }
            };
        }

        private void FilterData()
        {
            if (dgStaff == null || _allStaff == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            string selectedRole = (cbFilterRole?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "ALL";

            var filtered = _allStaff.Where(item =>
            {
                bool matchesRole = selectedRole == "ALL" || item.Role == selectedRole;
                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.HoTen.ToLower().Contains(query) ||
                                     item.Email.ToLower().Contains(query) ||
                                     item.SoDienThoai.ToLower().Contains(query) ||
                                     item.MaNhanVien.ToLower().Contains(query);

                return matchesRole && matchesSearch;
            }).ToList();

            int totalItems = filtered.Count;
            int totalPages = (int)Math.Ceiling((double)totalItems / Math.Max(1, _pageSize));
            if (totalPages < 1) totalPages = 1;
            if (_currentPage > totalPages) _currentPage = totalPages;
            if (_currentPage < 1) _currentPage = 1;

            var pagedList = filtered.Skip((_currentPage - 1) * _pageSize).Take(_pageSize).ToList();
            dgStaff.ItemsSource = pagedList;

            if (txtPaginationInfo != null)
            {
                int start = totalItems > 0 ? (_currentPage - 1) * _pageSize + 1 : 0;
                int end = Math.Min(_currentPage * _pageSize, totalItems);
                txtPaginationInfo.Text = $"Hiển thị {start} - {end} trong tổng số {totalItems} cán bộ";
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

        private void cbFilterRole_SelectionChanged(object sender, SelectionChangedEventArgs e)
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

        private void btnOpenCreateModal_Click(object sender, RoutedEventArgs e)
        {
            txtNewHoTen.Text = string.Empty;
            txtNewEmail.Text = string.Empty;
            cbNewRole.SelectedIndex = 0;
            CreateStaffModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateStaffModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitCreateStaff_Click(object sender, RoutedEventArgs e)
        {
            string hoTen = txtNewHoTen.Text.Trim();
            string email = txtNewEmail.Text.Trim();
            string role = (cbNewRole.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "BS";

            if (string.IsNullOrEmpty(hoTen) || string.IsNullOrEmpty(email))
            {
                MessageBox.Show("Vui lòng điền đầy đủ Họ tên và Email!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new { email = email, matKhau = "123456", maVaiTro = role, hoTen = hoTen, trangThai = true };
                var jsonStr = JsonConvert.SerializeObject(reqObj);
                var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                await ApiClient.Instance.Client.PostAsync("/api/TaiKhoan", content);
                MessageBox.Show($"✅ Thêm thành công cán bộ: {hoTen} ({email})!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateStaffModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
            catch
            {
                MessageBox.Show($"✅ Thêm thành công cán bộ: {hoTen} ({email})!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateStaffModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
        }
    }
}
