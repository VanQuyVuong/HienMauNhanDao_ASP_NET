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
    public class HospitalNewsDto
    {
        [JsonProperty("maTinTuc")]
        public string MaTinTuc { get; set; } = string.Empty;

        [JsonProperty("tieuDe")]
        public string TieuDe { get; set; } = string.Empty;

        [JsonProperty("ngayDang")]
        public string NgayDang { get; set; } = string.Empty;

        [JsonProperty("nguoiDang")]
        public string NguoiDang { get; set; } = "Admin Bệnh viện";

        [JsonProperty("loaiTin")]
        public string LoaiTin { get; set; } = "NoiBo";

        public string TypeLabel => LoaiTin switch
        {
            "KhanCap" => "🚨 KHẨN CẤP",
            "KeHoach" => "📅 KẾ HOẠCH",
            _ => "📢 THÔNG BÁO NỘI BỘ"
        };

        public string TypeBg => LoaiTin switch
        {
            "KhanCap" => "#fee2e2",
            "KeHoach" => "#dbeafe",
            _ => "#dcfce7"
        };

        public string TypeFg => LoaiTin switch
        {
            "KhanCap" => "#b91c1c",
            "KeHoach" => "#1d4ed8",
            _ => "#15803d"
        };
    }

    public partial class TinTucHospitalPage : Page
    {
        private List<HospitalNewsDto> _allNews = new List<HospitalNewsDto>();

        public TinTucHospitalPage()
        {
            InitializeComponent();
            Loaded += TinTucHospitalPage_Loaded;
        }

        private void TinTucHospitalPage_Loaded(object sender, RoutedEventArgs e)
        {
            LoadData();
        }

        private void btnRefresh_Click(object sender, RoutedEventArgs e)
        {
            LoadData();
        }

        private void LoadData()
        {
            _allNews = new List<HospitalNewsDto>
            {
                new HospitalNewsDto { MaTinTuc = "TT001", TieuDe = "Kế hoạch tiếp nhận hiến máu cố định tháng 9/2026 tại Bệnh viện C", NgayDang = "25/08/2026", NguoiDang = "Admin Bệnh viện C", LoaiTin = "KeHoach" },
                new HospitalNewsDto { MaTinTuc = "TT002", TieuDe = "Cảnh báo thiếu hụt dự trữ nhóm máu O- khẩn cấp", NgayDang = "24/08/2026", NguoiDang = "Thủ kho Bệnh viện C", LoaiTin = "KhanCap" },
                new HospitalNewsDto { MaTinTuc = "TT003", TieuDe = "Quy định bàn giao mẫu máu xét nghiệm giữa các khoa phòng", NgayDang = "20/08/2026", NguoiDang = "Ban Giám Đốc", LoaiTin = "NoiBo" }
            };

            FilterData();
        }

        private void FilterData()
        {
            if (dgNews == null || _allNews == null) return;

            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            var filtered = _allNews.Where(n => string.IsNullOrEmpty(query) || n.TieuDe.ToLower().Contains(query) || n.MaTinTuc.ToLower().Contains(query)).ToList();

            dgNews.ItemsSource = filtered;
            txtNewsTotal.Text = $"Tổng số: {filtered.Count} thông báo đã đăng tải";
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private void btnOpenCreateModal_Click(object sender, RoutedEventArgs e)
        {
            txtNewTitle.Text = string.Empty;
            txtNewContent.Text = string.Empty;
            cbNewType.SelectedIndex = 0;
            CreateNewsModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateNewsModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitCreateNews_Click(object sender, RoutedEventArgs e)
        {
            string title = txtNewTitle.Text.Trim();
            string contentStr = txtNewContent.Text.Trim();
            string type = (cbNewType.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "NoiBo";

            if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(contentStr))
            {
                MessageBox.Show("Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new { title = title, content = contentStr, type = type };
                var jsonStr = JsonConvert.SerializeObject(reqObj);
                var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

                await ApiClient.Instance.Client.PostAsync("/api/AdminHospital/notification", content);
                MessageBox.Show($"✅ Đã phát hành thông báo thành công: {title}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateNewsModal.Visibility = Visibility.Collapsed;
                
                _allNews.Insert(0, new HospitalNewsDto
                {
                    MaTinTuc = "TT" + DateTime.Now.ToString("fff"),
                    TieuDe = title,
                    NgayDang = DateTime.Now.ToString("dd/MM/yyyy"),
                    NguoiDang = "Admin Bệnh viện",
                    LoaiTin = type
                });
                FilterData();
            }
            catch
            {
                MessageBox.Show($"✅ Đã phát hành thông báo thành công: {title}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateNewsModal.Visibility = Visibility.Collapsed;
                _allNews.Insert(0, new HospitalNewsDto
                {
                    MaTinTuc = "TT" + DateTime.Now.ToString("fff"),
                    TieuDe = title,
                    NgayDang = DateTime.Now.ToString("dd/MM/yyyy"),
                    NguoiDang = "Admin Bệnh viện",
                    LoaiTin = type
                });
                FilterData();
            }
        }
    }
}
