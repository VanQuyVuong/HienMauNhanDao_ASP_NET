using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Constants;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public class CampaignFilterDto
    {
        public string MaChienDich { get; set; } = "";
        public string TenChienDich { get; set; } = "";
        public string DiaDiemString { get; set; } = "";
    }

    public partial class DonDangKyPage : Page
    {
        private List<DonDangKy> _allDons = new List<DonDangKy>();
        private List<CampaignFilterDto> _campaignList = new List<CampaignFilterDto>();

        public DonDangKyPage()
        {
            InitializeComponent();
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadCampaigns();
            await LoadData();
        }

        private async void btnRefresh_Click(object sender, RoutedEventArgs e)
        {
            await LoadCampaigns();
            await LoadData();
        }

        private async Task LoadCampaigns()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/chiendich");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var list = new List<CampaignFilterDto>();
                    list.Add(new CampaignFilterDto { MaChienDich = "ALL", TenChienDich = "🏥 Tất cả chiến dịch & địa điểm", DiaDiemString = "Tất cả các khu vực trên địa bàn TP. Đà Nẵng" });

                    try
                    {
                        var JObj = Newtonsoft.Json.Linq.JObject.Parse(json);
                        var dataToken = JObj["data"] ?? JObj;
                        if (dataToken is Newtonsoft.Json.Linq.JArray jarr)
                        {
                            foreach (var token in jarr)
                            {
                                string ma = token["maChienDich"]?.ToString() ?? "";
                                string ten = token["tenChienDich"]?.ToString() ?? "";
                                string diaDiem = token["diaDiem"]?["tenDiaDiem"]?.ToString() ?? token["diaDiem"]?.ToString() ?? "Đà Nẵng";
                                list.Add(new CampaignFilterDto
                                {
                                    MaChienDich = ma,
                                    TenChienDich = $"{ma} - {ten}",
                                    DiaDiemString = diaDiem
                                });
                            }
                        }
                    }
                    catch { }

                    _campaignList = list;
                    cbChienDichFilter.ItemsSource = _campaignList;
                    if (cbChienDichFilter.SelectedIndex < 0) cbChienDichFilter.SelectedIndex = 0;
                }
            }
            catch { }
        }

        private async Task LoadData()
        {
            try
            {
                btnRefresh.IsEnabled = false;
                btnRefresh.Content = "Đang tải...";

                var response = await ApiClient.Instance.Client.GetAsync("/api/dondangky/tat-ca");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    
                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<DonDangKy>>>(json);
                        if (apiRes != null && apiRes.Data != null)
                        {
                            _allDons = apiRes.Data;
                        }
                    }
                    catch { }

                    if (_allDons == null || _allDons.Count == 0)
                    {
                        try
                        {
                            var paginated = JsonConvert.DeserializeObject<PaginatedResponse<DonDangKy>>(json);
                            if (paginated != null && paginated.Content != null)
                            {
                                _allDons = paginated.Content;
                            }
                        }
                        catch { }
                    }

                    if (_allDons == null || _allDons.Count == 0)
                    {
                        try { _allDons = JsonConvert.DeserializeObject<List<DonDangKy>>(json) ?? new List<DonDangKy>(); } catch { }
                    }

                    FilterData();
                }
                else
                {
                    MessageBox.Show("Không thể tải danh sách đơn đăng ký.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
            }
        }

        private void cbChienDichFilter_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }

        private void FilterData()
        {
            if (dgDonDangKy == null) return;
            if (_allDons == null) _allDons = new List<DonDangKy>();

            var selectedCampaign = cbChienDichFilter.SelectedItem as CampaignFilterDto;
            string selectedMaCD = selectedCampaign?.MaChienDich ?? "ALL";

            // 1. Filter by Campaign
            var filtered = _allDons.Where(d => d != null).ToList();
            if (selectedMaCD != "ALL")
            {
                filtered = filtered.Where(d => string.Equals(d.MaChienDich, selectedMaCD, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // 2. Filter by Keyword
            var keyword = txtSearch?.Text?.Trim()?.ToLower() ?? "";
            if (!string.IsNullOrEmpty(keyword))
            {
                filtered = filtered.Where(d =>
                    (d.MaDon != null && d.MaDon.ToLower().Contains(keyword)) ||
                    (d.HoTenTNV != null && d.HoTenTNV.ToLower().Contains(keyword)) ||
                    (d.TenChienDich != null && d.TenChienDich.ToLower().Contains(keyword))
                ).ToList();
            }

            var sortedList = filtered.OrderByDescending(d => d.ThoiGianDangKy).ToList();
            dgDonDangKy.ItemsSource = sortedList;

            // 3. Update Location Banner & Stats
            if (txtCampaignLocation != null)
            {
                if (selectedMaCD == "ALL")
                {
                    txtCampaignLocation.Text = "Tất cả các điểm hiến máu trên địa bàn TP. Đà Nẵng";
                }
                else
                {
                    txtCampaignLocation.Text = $"{selectedCampaign?.TenChienDich} - [📍 Địa điểm: {selectedCampaign?.DiaDiemString}]";
                }
            }

            if (txtCampaignStats != null)
            {
                int total = sortedList.Count;
                int daDangKy = sortedList.Count(d => d.TrangThai == "DaDangKy" || d.TrangThai == "Đã đăng ký");
                int daTiepNhan = sortedList.Count(d => d.TrangThai == "DaDuyet" || d.TrangThai == "DaHoanThanh" || d.TrangThai == "DaHien");

                txtCampaignStats.Text = $"📊 Tổng đơn: {total} | ⚡ Đang chờ tiếp nhận: {daDangKy} | ✅ Đã tiếp nhận tại quầy: {daTiepNhan}";
            }
        }

        private void txtSearch_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                FilterData();
            }
        }

        private void btnCheckCCCD_Click(object sender, RoutedEventArgs e)
        {
            string keyword = txtSearch.Text.Trim();
            if (string.IsNullOrEmpty(keyword))
            {
                MessageBox.Show("Vui lòng nhập Số CCCD hoặc Mã đơn hoặc Họ tên TNV vào ô tìm kiếm để kiểm tra!", "Hướng dẫn", MessageBoxButton.OK, MessageBoxImage.Information);
                txtSearch.Focus();
                return;
            }

            var selectedCampaign = cbChienDichFilter.SelectedItem as CampaignFilterDto;
            string currentMaCD = selectedCampaign?.MaChienDich ?? "ALL";

            // Tìm đơn đăng ký phù hợp trong toàn bộ CSDL
            var matches = _allDons.Where(d => d != null &&
                ((d.MaDon != null && d.MaDon.Equals(keyword, StringComparison.OrdinalIgnoreCase)) ||
                 (d.HoTenTNV != null && d.HoTenTNV.ToLower().Contains(keyword.ToLower())) ||
                 (d.MaTNV != null && d.MaTNV.Equals(keyword, StringComparison.OrdinalIgnoreCase)))
            ).ToList();

            if (!matches.Any())
            {
                var result = MessageBox.Show($"⚠️ Không tìm thấy đơn đăng ký nào cho từ khóa '{keyword}'!\n\nBạn có muốn thực hiện ĐĂNG KÝ TRỰC TIẾP (Walk-in) tại quầy không?", "Không tìm thấy", MessageBoxButton.YesNo, MessageBoxImage.Question);
                if (result == MessageBoxResult.Yes)
                {
                    btnWalkIn_Click(sender, e);
                }
                return;
            }

            var match = matches.First();
            string matchCD = match.MaChienDich ?? "";
            string tenCD = match.TenChienDich ?? matchCD;

            if (currentMaCD != "ALL" && !string.Equals(currentMaCD, matchCD, StringComparison.OrdinalIgnoreCase))
            {
                var res = MessageBox.Show($"⚠️ CẢNH BÁO TÌNH NGUYỆN VIÊN ĐI NHẦM NƠI!\n\n👤 TNV: {match.HoTenTNV}\n📄 Đã đăng ký cho: [{tenCD}]\n📍 Địa điểm đăng ký ban đầu: {match.TenChienDich}\n\nTNV này đang đi nhầm sang địa điểm: [{selectedCampaign?.TenChienDich}].\n\nBạn có muốn chuyển sang Tiếp Nhận Trực Tiếp (Walk-in) tại địa điểm hiện tại này không?", "Cảnh Báo Đi Nhầm Địa Điểm", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                if (res == MessageBoxResult.Yes)
                {
                    btnWalkIn_Click(sender, e);
                }
            }
            else
            {
                MessageBox.Show($"✅ THÔNG TIN CHÍNH XÁC!\n\n👤 TNV: {match.HoTenTNV}\n📄 Mã đơn: {match.MaDon}\n📍 Địa điểm: {match.TenChienDich}\n⚡ Trạng thái: {match.TrangThaiHienThi}\n\nTNV đã đến đúng địa điểm đăng ký. Bạn có thể tiến hành nút 'Tiếp Nhận'!", "Xác Nhận Đúng Địa Điểm", MessageBoxButton.OK, MessageBoxImage.Information);
                txtSearch.Text = match.MaDon;
                FilterData();
            }
        }

        private async void btnWalkIn_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new WalkInRegistrationDialog();
            dialog.Owner = Window.GetWindow(this);
            if (dialog.ShowDialog() == true)
            {
                await LoadData();
            }
        }

        private async void btnTiepNhan_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is DonDangKy don)
            {
                if (don.TrangThai != "DaDangKy")
                {
                    MessageBox.Show("Chỉ tiếp nhận những đơn có trạng thái 'Đã Đăng Ký'.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                var dialog = new TiepNhanQuayDialog(don);
                dialog.Owner = Window.GetWindow(this);
                if (dialog.ShowDialog() == true)
                {
                    await LoadData();
                }
            }
        }
    }
}
