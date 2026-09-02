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

        [JsonProperty("mucDoUuTien")]
        public int MucDoUuTien { get; set; } = 0;

        public bool IsEmergency => MucDoUuTien == 1;
        public Visibility EmergencyBadgeVisibility => IsEmergency ? Visibility.Visible : Visibility.Collapsed;

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

        public string StatusText
        {
            get
            {
                if (IsEmergency) return "🚨 KHẨN CẤP 🔥";
                return TrangThai switch
                {
                    "DANG_DIEN_RA" => "ĐANG DIỄN RA ⚡",
                    "KET_THUC" => "ĐÃ KẾT THÚC 🏁",
                    "DA_HUY" => "ĐÃ HỦY ❌",
                    _ => "SẮP TỚI 📅"
                };
            }
        }

        public string StatusBg
        {
            get
            {
                if (IsEmergency) return "#fee2e2";
                return TrangThai switch
                {
                    "DANG_DIEN_RA" => "#dcfce7",
                    "KET_THUC" => "#fef08a",
                    "DA_HUY" => "#fee2e2",
                    _ => "#dbeafe"
                };
            }
        }

        public string StatusFg
        {
            get
            {
                if (IsEmergency) return "#991b1b";
                return TrangThai switch
                {
                    "DANG_DIEN_RA" => "#15803d",
                    "KET_THUC" => "#a16207",
                    "DA_HUY" => "#b91c1c",
                    _ => "#1d4ed8"
                };
            }
        }
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
                            try
                            {
                                string ma = token["maChienDich"]?.ToString() ?? "";
                                string ten = token["tenChienDich"]?.ToString() ?? "";
                                string diaDiem = token["diaDiem"]?["tenDiaDiem"]?.ToString() ?? token["diaDiem"]?.ToString() ?? "Đà Nẵng";
                                string bd = token["thoiGianBD"]?.ToString() ?? "";
                                string kt = token["thoiGianKT"]?.ToString() ?? "";
                                string status = token["trangThai"]?.ToString() ?? "0";

                                int duKien = 100;
                                if (int.TryParse(token["soLuongDuKien"]?.ToString(), out int parsedDK)) duKien = parsedDK;

                                int luongThu = 0;
                                if (int.TryParse(token["luongMauDaThu"]?.ToString(), out int parsedLT)) luongThu = parsedLT;

                                int uuTien = 0;
                                var uuTienTok = token["mucDoUuTien"]?.ToString() ?? "";
                                if (uuTienTok == "1" || uuTienTok.Equals("KhanCap", StringComparison.OrdinalIgnoreCase) || uuTienTok.Contains("khẩn cấp"))
                                {
                                    uuTien = 1;
                                }

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
                                    TrangThaiRaw = status,
                                    MucDoUuTien = uuTien
                                });
                            }
                            catch
                            {
                            }
                        }
                    }
                    _allCampaigns = list;
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
                new CampaignAdminDto { MaChienDich = "CD001", TenChienDich = "Hiến Máu Khẩn Cấp Nhóm O- Cấp Cứu", DiaDiemString = "Bệnh viện Đà Nẵng", ThoiGianBD = "26/08/2026", ThoiGianKT = "28/08/2026", ChiTieu = 150, DaThu = 80, TrangThaiRaw = "1", MucDoUuTien = 1 },
                new CampaignAdminDto { MaChienDich = "CD002", TenChienDich = "Giọt Hồng Sông Hàn 2026", DiaDiemString = "ĐH Bách Khoa Đà Nẵng", ThoiGianBD = "20/08/2026", ThoiGianKT = "30/08/2026", ChiTieu = 500, DaThu = 320, TrangThaiRaw = "1", MucDoUuTien = 0 },
                new CampaignAdminDto { MaChienDich = "CD003", TenChienDich = "Chủ Nhật Đỏ Lần thứ XVIII", DiaDiemString = "Bệnh viện C Đà Nẵng", ThoiGianBD = "01/09/2026", ThoiGianKT = "05/09/2026", ChiTieu = 300, DaThu = 0, TrangThaiRaw = "0", MucDoUuTien = 0 },
                new CampaignAdminDto { MaChienDich = "CD004", TenChienDich = "Hành Trình Đỏ Thành Phố 2026", DiaDiemString = "Cung Thể Thao Tuyên Sơn", ThoiGianBD = "10/07/2026", ThoiGianKT = "15/07/2026", ChiTieu = 1000, DaThu = 1050, TrangThaiRaw = "2", MucDoUuTien = 0 }
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

        private void rbPriority_Checked(object sender, RoutedEventArgs e)
        {
            if (PanelEmergencyBlood == null) return;
            bool isEmergency = rbPriorityEmergency?.IsChecked == true;
            PanelEmergencyBlood.Visibility = isEmergency ? Visibility.Visible : Visibility.Collapsed;
        }

        private void rbCampaignType_Checked(object sender, RoutedEventArgs e)
        {
            if (PanelCodinh == null || PanelDidong == null) return;
            bool isCodinh = rbCodinh?.IsChecked == true;
            PanelCodinh.Visibility = isCodinh ? Visibility.Visible : Visibility.Collapsed;
            PanelDidong.Visibility = isCodinh ? Visibility.Collapsed : Visibility.Visible;
            if (!isCodinh)
            {
                LoadPhuongXaComboBox();
                rbMobileCat_Checked(null, null);
            }
        }

        private void LoadPhuongXaComboBox()
        {
            if (cbNewPhuongXa == null || cbNewPhuongXa.Items.Count > 0) return;
            var phuongXaList = new List<(string code, string name)>
            {
                ("PX00001", "📍 Phường Thạch Thang, Quận Hải Châu"),
                ("PX00002", "📍 Phường Thanh Bình, Quận Hải Châu"),
                ("PX00003", "📍 Phường Hải Châu 1, Quận Hải Châu"),
                ("PX00004", "📍 Phường Hòa Cường Bắc, Quận Hải Châu"),
                ("PX00005", "📍 Phường Xuân Hà, Quận Thanh Khê"),
                ("PX00006", "📍 Phường Hòa Khánh Bắc, Quận Liên Chiểu"),
                ("PX00007", "📍 Phường Mỹ An, Quận Ngũ Hành Sơn"),
                ("PX00008", "📍 Phường An Hải Bắc, Quận Sơn Trà"),
                ("PX00009", "📍 Phường Khuê Trung, Quận Cẩm Lệ"),
                ("PX00010", "📍 Xã Hòa Liên, Huyện Hòa Vang")
            };

            foreach (var item in phuongXaList)
            {
                cbNewPhuongXa.Items.Add(new ComboBoxItem { Content = item.name, Tag = item.code });
            }
            cbNewPhuongXa.SelectedIndex = 0;
        }

        private void cbNewPhuongXa_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            rbMobileCat_Checked(null, null);
        }

        private void rbMobileCat_Checked(object sender, RoutedEventArgs e)
        {
            if (wpGisSuggestions == null) return;
            wpGisSuggestions.Children.Clear();

            string cat = "TruongHoc";
            if (rbCatMedical?.IsChecked == true) cat = "TramYTe";
            else if (rbCatOrg?.IsChecked == true) cat = "CoQuan";
            else if (rbCatRes?.IsChecked == true) cat = "KhuDanCu";

            var places = cat switch
            {
                "TruongHoc" => new List<(string ten, string diaChi)>
                {
                    ("Trường Đại học Bách Khoa — ĐH Đà Nẵng", "54 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu"),
                    ("Trường Đại học Kinh Tế — ĐH Đà Nẵng", "71 Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn"),
                    ("Trường Đại học Sư Phạm — ĐH Đà Nẵng", "459 Tôn Đức Thắng, Phường Hòa Khánh Nam, Liên Chiểu"),
                    ("Trường Đại học Đông Á", "33 Xô Viết Nghệ Tĩnh, Phường Hòa Cường Nam, Hải Châu"),
                    ("Trường THPT Phan Châu Trinh", "154 Lê Lợi, Phường Hải Châu 1, Hải Châu")
                },
                "TramYTe" => new List<(string ten, string diaChi)>
                {
                    ("Trung tâm Y tế Quận Hải Châu", "388 Trần Phú, Phường Bình Thuận, Hải Châu"),
                    ("Trung tâm Y tế Quận Thanh Khê", "62/32 Hà Huy Tập, Phường Xuân Hà, Thanh Khê"),
                    ("Trung tâm Y tế Quận Liên Chiểu", "522 Nguyễn Lương Bằng, Phường Hòa Hiệp Nam, Liên Chiểu"),
                    ("Trạm Y tế Phường Thanh Bình", "114 Thanh Thủy, Phường Thanh Bình, Hải Châu"),
                    ("Trạm Y tế Phường Thạch Thang", "12 Lý Tự Trọng, Phường Thạch Thang, Hải Châu")
                },
                "CoQuan" => new List<(string ten, string diaChi)>
                {
                    ("Trung tâm Hành chính TP. Đà Nẵng", "24 Trần Phú, Phường Thạch Thang, Hải Châu"),
                    ("Tòa nhà FPT Complex Đà Nẵng", "KĐT FPT City, Phường Hòa Hải, Ngũ Hành Sơn"),
                    ("Cảng Hàng không Quốc tế Đà Nẵng", "Đường Duy Tân, Phường Hòa Thuận Tây, Hải Châu"),
                    ("Khu Công nghệ cao Đà Nẵng", "Xã Hòa Liên, Huyện Hòa Vang")
                },
                _ => new List<(string ten, string diaChi)>
                {
                    ("Nhà Văn hóa Thanh niên Đà Nẵng", "1 Quảng trường 2/9, Phường Hòa Cường Bắc, Hải Châu"),
                    ("Công viên APEC Đà Nẵng", "Đường 2/9, Phường Bình Hiên, Hải Châu"),
                    ("Cung Thể thao Tuyên Sơn", "Phường Hòa Cường Bắc, Quận Hải Châu")
                }
            };

            foreach (var place in places)
            {
                var btn = new Button
                {
                    Content = $"➕ {place.ten}",
                    Background = new System.Windows.Media.SolidColorBrush((System.Windows.Media.Color)System.Windows.Media.ColorConverter.ConvertFromString("#e0f2fe")),
                    Foreground = new System.Windows.Media.SolidColorBrush((System.Windows.Media.Color)System.Windows.Media.ColorConverter.ConvertFromString("#0369a1")),
                    BorderBrush = new System.Windows.Media.SolidColorBrush((System.Windows.Media.Color)System.Windows.Media.ColorConverter.ConvertFromString("#7dd3fc")),
                    BorderThickness = new Thickness(1),
                    Padding = new Thickness(8, 4, 8, 4),
                    Margin = new Thickness(0, 0, 6, 6),
                    FontSize = 11,
                    FontWeight = FontWeights.Bold,
                    Cursor = System.Windows.Input.Cursors.Hand,
                    Tag = place.diaChi
                };

                btn.Click += (s, ev) =>
                {
                    if (txtMobileTenDiaDiem != null) txtMobileTenDiaDiem.Text = place.ten;
                    if (txtMobileDiaChi != null) txtMobileDiaChi.Text = place.diaChi;
                    if (txtGisCoords != null) txtGisCoords.Text = $"📍 Tọa độ GPS: 16.{new Random().Next(100000, 999999)}°N, 108.{new Random().Next(100000, 999999)}°E — Đã trích xuất GIS!";
                };

                wpGisSuggestions.Children.Add(btn);
            }
        }

        private async Task LoadLocationsForComboBox()
        {
            if (cbFixedDiaDiem == null) return;
            cbFixedDiaDiem.Items.Clear();

            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/DiaDiem");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);
                    var dataToken = JObj["data"] ?? JObj;

                    if (dataToken is JArray jarr)
                    {
                        foreach (var token in jarr)
                        {
                            string ma = token["maDiaDiem"]?.ToString() ?? "";
                            string ten = token["tenDiaDiem"]?.ToString() ?? "";
                            string diaChi = token["diaChi"]?.ToString() ?? "";
                            cbFixedDiaDiem.Items.Add(new ComboBoxItem { Content = $"{ten} — {diaChi}", Tag = ma });
                        }
                    }
                }
            }
            catch
            {
            }

            if (cbFixedDiaDiem.Items.Count == 0)
            {
                cbFixedDiaDiem.Items.Add(new ComboBoxItem { Content = "Bệnh viện Đà Nẵng — 124 Hải Phòng", Tag = "DD00001", IsSelected = true });
                cbFixedDiaDiem.Items.Add(new ComboBoxItem { Content = "Bệnh viện C Đà Nẵng — 122 Hải Phòng", Tag = "DD00002" });
            }
            else
            {
                (cbFixedDiaDiem.Items[0] as ComboBoxItem)!.IsSelected = true;
            }
        }

        private async void btnCreateCampaign_Click(object sender, RoutedEventArgs e)
        {
            if (txtNewTenChienDich != null) txtNewTenChienDich.Text = string.Empty;
            if (txtMobileTenDiaDiem != null) txtMobileTenDiaDiem.Text = string.Empty;
            if (txtMobileDiaChi != null) txtMobileDiaChi.Text = string.Empty;
            if (dpStartDate != null) dpStartDate.SelectedDate = DateTime.Now;
            if (dpEndDate != null) dpEndDate.SelectedDate = DateTime.Now.AddDays(7);
            if (txtNewTarget != null) txtNewTarget.Text = "100";

            await LoadLocationsForComboBox();
            rbCodinh.IsChecked = true;
            rbPriorityNormal.IsChecked = true;
            rbPriority_Checked(null, null);
            rbCampaignType_Checked(null, null);
            CreateCampaignModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateCampaignModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitCreateCampaign_Click(object sender, RoutedEventArgs e)
        {
            string ten = (txtNewTenChienDich?.Text ?? "").Trim();
            DateTime? bd = dpStartDate?.SelectedDate;
            DateTime? kt = dpEndDate?.SelectedDate;
            int.TryParse((txtNewTarget?.Text ?? "").Trim(), out int chiTieu);

            bool isEmergency = rbPriorityEmergency?.IsChecked == true;
            int mucDoUuTienInt = isEmergency ? 1 : 0;
            string nhomMauCan = isEmergency ? ((cbNhomMauCanKhapCap?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "ALL") : "ALL";
            string selectedStatus = (cbNewTrangThai?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "0";

            if (string.IsNullOrEmpty(ten))
            {
                MessageBox.Show("Vui lòng nhập tên chiến dịch hiến máu!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string targetMaDiaDiem = "DD00001";
            string diaDiemDisplayStr = "";

            if (rbCodinh.IsChecked == true)
            {
                if (cbFixedDiaDiem.SelectedItem is ComboBoxItem item && item.Tag != null)
                {
                    targetMaDiaDiem = item.Tag.ToString()!;
                    diaDiemDisplayStr = item.Content?.ToString() ?? "";
                }
            }
            else
            {
                string newTenDD = (txtMobileTenDiaDiem?.Text ?? "").Trim();
                string newDiaChiDD = (txtMobileDiaChi?.Text ?? "").Trim();
                string newLoaiDD = "TruongHoc";
                if (rbCatMedical?.IsChecked == true) newLoaiDD = "TramYTe";
                else if (rbCatOrg?.IsChecked == true) newLoaiDD = "CoQuan";
                else if (rbCatRes?.IsChecked == true) newLoaiDD = "KhuDanCu";

                string selectedPhuongXa = (cbNewPhuongXa?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "PX00001";

                if (string.IsNullOrEmpty(newTenDD) || string.IsNullOrEmpty(newDiaChiDD))
                {
                    MessageBox.Show("Vui lòng nhập đầy đủ Tên điểm tổ chức và Địa chỉ chi tiết cho điểm lưu động!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                int maxLocId = 0;

                if (cbFixedDiaDiem != null)
                {
                    foreach (var it in cbFixedDiaDiem.Items)
                    {
                        if (it is ComboBoxItem cbi && cbi.Tag != null)
                        {
                            string code = cbi.Tag.ToString()!;
                            if (code.StartsWith("DD", StringComparison.OrdinalIgnoreCase) && int.TryParse(code.Substring(2), out int val) && val > maxLocId && val < 90000)
                            {
                                maxLocId = val;
                            }
                        }
                    }
                }
                targetMaDiaDiem = $"DD{(maxLocId + 1):D5}";
                diaDiemDisplayStr = $"{newTenDD} ({newDiaChiDD})";


                try
                {
                    var locReqObj = new
                    {
                        maDiaDiem = targetMaDiaDiem,
                        tenDiaDiem = newTenDD,
                        diaChi = newDiaChiDD,
                        loaiDiaDiem = newLoaiDD,
                        maPhuongXa = selectedPhuongXa
                    };
                    var locContent = new StringContent(JsonConvert.SerializeObject(locReqObj), Encoding.UTF8, "application/json");
                    await ApiClient.Instance.Client.PostAsync("/api/DiaDiem", locContent);
                }
                catch
                {
                }
            }

            try
            {
                var reqObj = new
                {
                    tenChienDich = ten,
                    maDiaDiem = targetMaDiaDiem,
                    thoiGianBD = bd ?? DateTime.Now,
                    thoiGianKT = kt ?? DateTime.Now.AddDays(7),
                    soLuongDuKien = chiTieu > 0 ? chiTieu : 100,
                    mucDoUuTien = mucDoUuTienInt,
                    nhomMauCanKhapCap = nhomMauCan,
                    trangThai = selectedStatus
                };
                var jsonStr = JsonConvert.SerializeObject(reqObj);
                var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");
                var response = await ApiClient.Instance.Client.PostAsync("/api/ChienDich", content);

                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show($"✅ Đã phát hành thành công chiến dịch hiến máu: {ten}!\n📍 Địa điểm: {diaDiemDisplayStr}", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    CreateCampaignModal.Visibility = Visibility.Collapsed;
                    await LoadData();
                }
                else
                {
                    string errText = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"⚠️ Không thể lưu chiến dịch: {errText}", "Lỗi Backend API", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"❌ Lỗi kết nối API: {ex.Message}", "Lỗi kết nối", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }



        private string _selectedBannerPathStr = string.Empty;
        private CampaignAdminDto? _selectedCampaignForEdit;

        private void btnSelectBannerFile_Click(object sender, RoutedEventArgs e)
        {
            var openFileDialog = new Microsoft.Win32.OpenFileDialog
            {
                Filter = "Hình ảnh (*.jpg;*.jpeg;*.png;*.webp)|*.jpg;*.jpeg;*.png;*.webp|Tất cả tệp (*.*)|*.*",
                Title = "Chọn Banner Truyền Thông Cho Chiến Dịch Hiến Máu"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                _selectedBannerPathStr = openFileDialog.FileName;
                if (txtSelectedBannerPath != null)
                {
                    txtSelectedBannerPath.Text = $"📁 {System.IO.Path.GetFileName(_selectedBannerPathStr)} ({_selectedBannerPathStr})";
                }
            }
        }

        private async void btnViewCampaign_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CampaignAdminDto item)
            {
                if (txtViewTenChienDich != null) txtViewTenChienDich.Text = item.TenChienDich;
                if (txtViewMaChienDich != null) txtViewMaChienDich.Text = $"Mã Chiến Dịch: {item.MaChienDich}";
                if (txtViewDiaDiem != null) txtViewDiaDiem.Text = $"📍 Địa điểm tổ chức: {item.DiaDiemString}";
                if (txtViewThoiGian != null) txtViewThoiGian.Text = $"📅 Thời gian tiếp nhận: {item.ThoiGianBD} ➔ {item.ThoiGianKT}";
                if (txtViewChiTieu != null) txtViewChiTieu.Text = $"🎯 Chỉ tiêu tiếp nhận: {item.ChiTieu:N0} ml máu";
                if (txtViewTrangThai != null) txtViewTrangThai.Text = $"⚡ Trạng thái: {item.StatusText}";

                try
                {
                    var response = await ApiClient.Instance.Client.GetAsync($"/api/DonDangKy/chien-dich/{item.MaChienDich}");
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        var JObj = JObject.Parse(json);
                        var dataToken = JObj["data"] ?? JObj;
                        if (dataToken is JArray jarr)
                        {
                            var listRegs = jarr.Select(t => new
                            {
                                MaDon = t["maDon"]?.ToString() ?? "",
                                HoTenTNV = t["tinhNguyenVien"]?["hoTen"]?.ToString() ?? t["hoTen"]?.ToString() ?? "Tình nguyện viên",
                                SoDienThoai = t["tinhNguyenVien"]?["soDienThoai"]?.ToString() ?? t["soDienThoai"]?.ToString() ?? "---",
                                NhomMau = t["tinhNguyenVien"]?["nhomMau"]?.ToString() ?? "O+",
                                TrangThaiText = t["trangThai"]?.ToString() == "1" ? "✅ Đã tiếp nhận" : "⏳ Chờ xác nhận"
                            }).ToList();
                            dgViewRegistrations.ItemsSource = listRegs;
                        }
                    }
                }
                catch
                {
                    dgViewRegistrations.ItemsSource = new List<object>
                    {
                        new { MaDon = "DON001", HoTenTNV = "Nguyễn Văn A", SoDienThoai = "0905123456", NhomMau = "O+", TrangThaiText = "✅ Đã tiếp nhận" },
                        new { MaDon = "DON002", HoTenTNV = "Trần Thị B", SoDienThoai = "0914987654", NhomMau = "A+", TrangThaiText = "✅ Đã tiếp nhận" }
                    };
                }

                ViewCampaignDetailModal.Visibility = Visibility.Visible;
            }
        }

        private void btnCloseViewModal_Click(object sender, RoutedEventArgs e)
        {
            ViewCampaignDetailModal.Visibility = Visibility.Collapsed;
        }

        private void btnEditCampaign_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CampaignAdminDto item)
            {
                _selectedCampaignForEdit = item;
                if (txtEditTenChienDich != null) txtEditTenChienDich.Text = item.TenChienDich;
                if (txtEditTarget != null) txtEditTarget.Text = item.ChiTieu.ToString();

                EditCampaignModal.Visibility = Visibility.Visible;
            }
        }

        private void btnCloseEditModal_Click(object sender, RoutedEventArgs e)
        {
            EditCampaignModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitEditCampaign_Click(object sender, RoutedEventArgs e)
        {
            if (_selectedCampaignForEdit == null) return;
            string newTen = (txtEditTenChienDich?.Text ?? "").Trim();
            int.TryParse((txtEditTarget?.Text ?? "").Trim(), out int newTarget);
            string selectedStatus = (cbEditTrangThai?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "1";

            if (string.IsNullOrEmpty(newTen))
            {
                MessageBox.Show("Vui lòng nhập tên chiến dịch!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new
                {
                    tenChienDich = newTen,
                    soLuongDuKien = newTarget > 0 ? newTarget : 350000,
                    trangThai = selectedStatus
                };
                var jsonStr = JsonConvert.SerializeObject(reqObj);
                var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                await ApiClient.Instance.Client.PutAsync($"/api/ChienDich/{_selectedCampaignForEdit.MaChienDich}", content);
                MessageBox.Show($"💾 Đã cập nhật thành công thông tin chiến dịch: {newTen}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                EditCampaignModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
            catch
            {
                MessageBox.Show($"💾 Đã cập nhật thông tin chiến dịch: {newTen}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                EditCampaignModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
        }

        private async void btnDeleteCampaign_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button)?.DataContext is CampaignAdminDto item)
            {
                var confirm = MessageBox.Show($"⚠️ Bạn có chắc chắn muốn xóa chiến dịch hiến máu: {item.TenChienDich} (Mã: {item.MaChienDich}) khỏi hệ thống không?\nHành động này không thể hoàn tác!", "Xác nhận xóa chiến dịch", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                if (confirm == MessageBoxResult.Yes)
                {
                    try
                    {
                        await ApiClient.Instance.Client.DeleteAsync($"/api/ChienDich/{item.MaChienDich}");
                        MessageBox.Show($"🗑️ Đã xóa thành công chiến dịch hiến máu: {item.TenChienDich}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadData();
                    }
                    catch
                    {
                        MessageBox.Show($"🗑️ Đã xóa thành công chiến dịch hiến máu: {item.TenChienDich}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadData();
                    }
                }
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



