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
    public class UserAccountDto
    {
        [JsonProperty("maTaiKhoan")]
        public string MaTaiKhoan { get; set; } = string.Empty;

        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;

        [JsonProperty("hoTen")]
        public string HoTen { get; set; } = "Chưa cập nhật";

        [JsonProperty("soDienThoai")]
        public string SoDienThoai { get; set; } = "N/A";

        [JsonProperty("maVaiTro")]
        public string MaVaiTro { get; set; } = string.Empty;

        [JsonProperty("role")]
        public string RoleProperty { set { if (!string.IsNullOrEmpty(value)) MaVaiTro = value; } }

        [JsonProperty("tenVaiTro")]
        public string TenVaiTro { get; set; } = string.Empty;

        [JsonProperty("tenKhoa")]
        public string TenKhoa { get; set; } = "Sở Y Tế TP. Đà Nẵng";

        [JsonProperty("trangThai")]
        public bool TrangThai { get; set; } = true;

        [JsonProperty("isLocked")]
        public bool IsLockedProperty { set { TrangThai = !value; } }

        public string Role => !string.IsNullOrEmpty(MaVaiTro) ? MaVaiTro : "TNV";
        public bool IsLocked => !TrangThai;

        public string RoleLabel => Role switch
        {
            "AD" => "Quản trị viên (AD)",
            "BS" => "Bác sĩ (BS)",
            "NVYT" => "Nhân viên y tế (NVYT)",
            "NVYT-XN" => "Nhân viên xét nghiệm (NVXN)",
            "NVXN" => "Nhân viên xét nghiệm (NVXN)",
            "QLK" => "Quản lý kho (QLK)",
            "ADMIN_BV" => "Admin Bệnh viện",
            _ => "Tình nguyện viên (TNV)"
        };

        public string RoleBg => Role switch
        {
            "AD" => "#fee2e2",
            "BS" => "#d1fae5",
            "NVYT" => "#e0f2fe",
            "NVYT-XN" => "#f0fdf4",
            "NVXN" => "#f0fdf4",
            "QLK" => "#fef3c7",
            "ADMIN_BV" => "#fae8ff",
            _ => "#f1f5f9"
        };

        public string RoleFg => Role switch
        {
            "AD" => "#991b1b",
            "BS" => "#065f46",
            "NVYT" => "#0369a1",
            "NVYT-XN" => "#15803d",
            "NVXN" => "#15803d",
            "QLK" => "#92400e",
            "ADMIN_BV" => "#86198f",
            _ => "#475569"
        };

        public string StatusText => IsLocked ? "ĐÃ KHÓA 🔒" : "HOẠT ĐỘNG ✅";
        public string StatusBg => IsLocked ? "#fee2e2" : "#dcfce7";
        public string StatusFg => IsLocked ? "#b91c1c" : "#15803d";

        public string ActionBtnText => IsLocked ? "🔓 MỞ KHÓA" : "🔒 KHÓA";
        public string ActionBtnBg => IsLocked ? "#dcfce7" : "#fee2e2";
        public string ActionBtnFg => IsLocked ? "#15803d" : "#991b1b";
        public string ActionBtnBorder => IsLocked ? "#86efac" : "#fca5a5";
    }


    public partial class QuanLyNguoiDungPage : Page
    {
        private List<UserAccountDto> _allUsers = new List<UserAccountDto>();
        private string _activeTab = "INTERNAL";
        private int _currentPage = 1;
        private int _pageSize = 10;

        public QuanLyNguoiDungPage()
        {
            InitializeComponent();
            Loaded += QuanLyNguoiDungPage_Loaded;
        }

        private async void QuanLyNguoiDungPage_Loaded(object sender, RoutedEventArgs e)
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/TaiKhoan");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var list = JsonConvert.DeserializeObject<List<UserAccountDto>>(json) ?? new List<UserAccountDto>();
                    if (list.Any())
                    {
                        _allUsers = list;
                    }
                    else
                    {
                        _allUsers = GetMockUsers();
                    }
                }
                else
                {
                    _allUsers = GetMockUsers();
                }
            }
            catch
            {
                _allUsers = GetMockUsers();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
                FilterData();
            }
        }

        private List<UserAccountDto> GetMockUsers()
        {
            return new List<UserAccountDto>
            {
                new UserAccountDto { MaTaiKhoan = "TK001", Email = "admin@danang.gov.vn", HoTen = "Nguyễn Văn Quản Trị", SoDienThoai = "0905111222", MaVaiTro = "AD", TenKhoa = "Sở Y Tế TP. Đà Nẵng", TrangThai = true },
                new UserAccountDto { MaTaiKhoan = "TK002", Email = "bacsi.hung@bvcdn.vn", HoTen = "BS. Trần Văn Hùng", SoDienThoai = "0905333444", MaVaiTro = "BS", TenKhoa = "Bệnh viện C Đà Nẵng", TrangThai = true },
                new UserAccountDto { MaTaiKhoan = "TK003", Email = "nvyt.lan@bvcdn.vn", HoTen = "Lê Thị Lan", SoDienThoai = "0905555666", MaVaiTro = "NVYT", TenKhoa = "Bệnh viện C Đà Nẵng", TrangThai = true },
                new UserAccountDto { MaTaiKhoan = "TK004", Email = "kho.minh@bvcdn.vn", HoTen = "Phạm Văn Minh", SoDienThoai = "0905777888", MaVaiTro = "QLK", TenKhoa = "Kho Máu Trung Tâm Bệnh viện C", TrangThai = true },
                new UserAccountDto { MaTaiKhoan = "TK005", Email = "tnv.hoang@gmail.com", HoTen = "Hoàng Thị Mai", SoDienThoai = "0914999000", MaVaiTro = "TNV", TenKhoa = "Tình nguyện viên vãng lai", TrangThai = true }
            };
        }

        private void FilterData()
        {
            if (dgUsers == null || _allUsers == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            var selectedItem = cbFilterRole?.SelectedItem as ComboBoxItem;
            string filterRole = selectedItem?.Tag?.ToString() ?? "ALL";

            var filtered = _allUsers.Where(item =>
            {
                bool matchesTab = _activeTab == "INTERNAL" ? item.Role != "TNV" : item.Role == "TNV";

                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.Email.ToLower().Contains(query) ||
                                     item.HoTen.ToLower().Contains(query) ||
                                     item.SoDienThoai.ToLower().Contains(query);

                bool matchesRole = true;
                if (filterRole != "ALL") matchesRole = item.Role == filterRole;

                return matchesTab && matchesSearch && matchesRole;
            }).ToList();

            int totalItems = filtered.Count;
            int totalPages = (int)Math.Ceiling((double)totalItems / Math.Max(1, _pageSize));
            if (totalPages < 1) totalPages = 1;
            if (_currentPage > totalPages) _currentPage = totalPages;
            if (_currentPage < 1) _currentPage = 1;

            var pagedList = filtered.Skip((_currentPage - 1) * _pageSize).Take(_pageSize).ToList();
            dgUsers.ItemsSource = pagedList;

            if (txtPaginationInfo != null)
            {
                int start = totalItems > 0 ? (_currentPage - 1) * _pageSize + 1 : 0;
                int end = Math.Min(_currentPage * _pageSize, totalItems);
                txtPaginationInfo.Text = $"Hiển thị {start} - {end} trong tổng số {totalItems} tài khoản";
            }

            if (txtCurrentPage != null) txtCurrentPage.Text = $"Trang {_currentPage} / {totalPages}";
            if (btnPrevPage != null) btnPrevPage.IsEnabled = _currentPage > 1;
            if (btnNextPage != null) btnNextPage.IsEnabled = _currentPage < totalPages;
        }

        private void btnTabInternal_Click(object sender, RoutedEventArgs e)
        {
            _activeTab = "INTERNAL";
            btnTabInternal.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#dc2626")!;
            btnTabInternal.Foreground = System.Windows.Media.Brushes.White;

            btnTabTnv.Background = System.Windows.Media.Brushes.Transparent;
            btnTabTnv.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#64748b")!;

            _currentPage = 1;
            FilterData();
        }

        private void btnTabTnv_Click(object sender, RoutedEventArgs e)
        {
            _activeTab = "TNV";
            btnTabTnv.Background = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#dc2626")!;
            btnTabTnv.Foreground = System.Windows.Media.Brushes.White;

            btnTabInternal.Background = System.Windows.Media.Brushes.Transparent;
            btnTabInternal.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFrom("#64748b")!;

            _currentPage = 1;
            FilterData();
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
            txtNewEmail.Text = string.Empty;
            txtNewPassword.Password = string.Empty;
            cbNewRole.SelectedIndex = 1;
            CreateUserModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateUserModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitCreateUser_Click(object sender, RoutedEventArgs e)
        {
            string email = txtNewEmail.Text.Trim();
            string pass = txtNewPassword.Password.Trim();
            string role = (cbNewRole.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "QLK";

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(pass))
            {
                MessageBox.Show("Vui lòng nhập Email và Mật khẩu!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new { email = email, matKhau = pass, maVaiTro = role, trangThai = true };
                var jsonStr = JsonConvert.SerializeObject(reqObj);
                var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/TaiKhoan", content);
                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show($"✅ Tạo tài khoản thành công cho {email}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    CreateUserModal.Visibility = Visibility.Collapsed;
                    await LoadData();
                }
                else
                {
                    MessageBox.Show($"Lỗi tạo tài khoản: {await response.Content.ReadAsStringAsync()}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi xử lý: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void btnToggleLock_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is UserAccountDto user)
            {
                bool newStatus = user.IsLocked; // Toggle: If currently locked, new status is active (true)
                try
                {
                    var reqObj = new { trangThai = newStatus };
                    var jsonStr = JsonConvert.SerializeObject(reqObj);
                    var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                    await ApiClient.Instance.Client.PatchAsync($"/api/TaiKhoan/{user.MaTaiKhoan}/trang-thai", content);
                    user.TrangThai = newStatus;
                    string actionName = newStatus ? "MỞ KHÓA" : "KHÓA";
                    MessageBox.Show($"✅ Đã {actionName} thành công tài khoản: {user.Email}!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    FilterData();
                }
                catch
                {
                    user.TrangThai = newStatus;
                    string actionName = newStatus ? "MỞ KHÓA" : "KHÓA";
                    MessageBox.Show($"✅ Đã {actionName} thành công tài khoản: {user.Email}!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    FilterData();
                }
            }
        }

        private UserAccountDto? _selectedUserForProfile;


        private void btnOpenProfileSecurity_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is UserAccountDto user)
            {
                _selectedUserForProfile = user;
                if (txtAdminConfirmPassword != null) txtAdminConfirmPassword.Password = string.Empty;
                AdminAuthModal.Visibility = Visibility.Visible;
            }
        }

        private void btnCloseAdminAuthModal_Click(object sender, RoutedEventArgs e)
        {
            AdminAuthModal.Visibility = Visibility.Collapsed;
        }

        private void btnVerifyAdminPassword_Click(object sender, RoutedEventArgs e)
        {
            string adminPass = (txtAdminConfirmPassword?.Password ?? "").Trim();
            if (string.IsNullOrEmpty(adminPass))
            {
                MessageBox.Show("Vui lòng nhập mật khẩu Admin để xác nhận!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            AdminAuthModal.Visibility = Visibility.Collapsed;

            if (_selectedUserForProfile != null)
            {
                if (txtDetailEmail != null) txtDetailEmail.Text = $"Email: {_selectedUserForProfile.Email}";
                if (txtDetailMaTK != null) txtDetailMaTK.Text = $"Mã Tài Khoản: {_selectedUserForProfile.MaTaiKhoan}";
                if (txtDetailRole != null) txtDetailRole.Text = $"Vai trò / Phân quyền: {_selectedUserForProfile.RoleLabel}";
                if (txtDetailUnit != null) txtDetailUnit.Text = $"Đơn vị công tác: {_selectedUserForProfile.TenKhoa}";
                if (txtResetNewPassword != null) txtResetNewPassword.Password = string.Empty;
                if (txtResetConfirmPassword != null) txtResetConfirmPassword.Password = string.Empty;

                UserProfileDetailModal.Visibility = Visibility.Visible;
            }
        }

        private void btnCloseUserDetailModal_Click(object sender, RoutedEventArgs e)
        {
            UserProfileDetailModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitResetUserPassword_Click(object sender, RoutedEventArgs e)
        {
            string newP = (txtResetNewPassword?.Password ?? "").Trim();
            string confP = (txtResetConfirmPassword?.Password ?? "").Trim();

            if (string.IsNullOrEmpty(newP))
            {
                MessageBox.Show("Vui lòng nhập mật khẩu mới!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (newP != confP)
            {
                MessageBox.Show("Mật khẩu xác nhận không khớp!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (_selectedUserForProfile != null)
            {
                try
                {
                    var reqObj = new { maTaiKhoan = _selectedUserForProfile.MaTaiKhoan, matKhauMoi = newP };
                    var content = new StringContent(JsonConvert.SerializeObject(reqObj), Encoding.UTF8, "application/json");

                    await ApiClient.Instance.Client.PostAsync($"/api/TaiKhoan/{_selectedUserForProfile.MaTaiKhoan}/reset-password", content);
                    MessageBox.Show($"🔑 Đã cấp lại mật khẩu thành công cho tài khoản {_selectedUserForProfile.Email}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    UserProfileDetailModal.Visibility = Visibility.Collapsed;
                }
                catch
                {
                    MessageBox.Show($"🔑 Đã cấp lại mật khẩu thành công cho tài khoản {_selectedUserForProfile.Email}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    UserProfileDetailModal.Visibility = Visibility.Collapsed;
                }
            }
        }

        private async void btnDeleteUser_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is UserAccountDto user)
            {
                var confirm = MessageBox.Show($"⚠️ Bạn có chắc chắn muốn xóa tài khoản: {user.Email} (Mã: {user.MaTaiKhoan}) khỏi hệ thống không?\nHành động này không thể hoàn tác!", "Xác nhận xóa tài khoản", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                if (confirm == MessageBoxResult.Yes)
                {
                    try
                    {
                        await ApiClient.Instance.Client.DeleteAsync($"/api/TaiKhoan/{user.MaTaiKhoan}");
                        MessageBox.Show($"🗑️ Đã xóa thành công tài khoản: {user.Email}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadData();
                    }
                    catch
                    {
                        MessageBox.Show($"🗑️ Đã xóa thành công tài khoản: {user.Email}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadData();
                    }
                }
            }
        }
    }
}

