namespace HienMauNhanDao_DaNang.Models.Enums
{

    //Nhóm máu
    public enum NhomMau
    {
        A_positive,
        A_negative,
        B_positive,
        B_negative,
        AB_positive,
        AB_negative,
        O_positive,
        O_negative
    }

    //Trạng thái chiến dịch
    public enum TrangThaiChienDich
    {
        ChuaBatDau,
        DangDienRa,
        DaKetThuc,
        DaHuy
    }

    //Mức độ ưu tiên chiến dịch
    public enum MucDoUuTienChienDich
    {
        BinhThuong,
        KhanCap
    }

    //trạng thái đơn đăng ký hiến máu
    public enum TrangThaiDonDangKy
    {
        ChoDuyet,
        DaDuyet,
        DaTuChoi,
        DaHoanThanh,
        DaHuy
    }

    //Trạng thái túi máu
    public enum TrangThaiTuiMau
    {
        ChuaXuLy,
        DaXetNghiem,
        DaLuuKho,
        DaSuDung,
        HetHan,
        DaHuy
    }

    //Loại địa điêm
    public enum LoaiDiaDiem
    {
        BenhVien,
        TramYTe,
        TruongHoc,
        CoQuan,
        KhuDanCu
    }

    //LoaiPhieuKhoMau
    public enum LoaiPhieuNhapXuat
    {
        Nhap,
        Xuat
    }

    //Trạng thái thông báo
    public enum TrangThaiThongBao
    {
        ChuaDoc,
        DaDoc
    }

    //trạng thái tin tức 
    public enum TrangThaiTinTuc
    {
        NhapLieu,
        DanDang,
        DaAn
    }
}
