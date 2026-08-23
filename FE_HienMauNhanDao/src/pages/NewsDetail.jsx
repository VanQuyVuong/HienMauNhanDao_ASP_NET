import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get(ENDPOINTS.TIN_TUC.GET_BY_ID(id));
        setNews(res.data);
      } catch (err) {
        setError("Không tìm thấy bài viết hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">article</span>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy bài viết</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/" className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">
          <Link to="/" className="hover:text-red-500 transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Tin Tức & Sự Kiện</span>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
            {news.loaiTin === "ChienDich" && "Chiến dịch"}
            {news.loaiTin === "LoiKhuyen" && "Lời khuyên y tế"}
            {news.loaiTin === "NoiBo" && "Tin nội bộ"}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
            {news.tieuDe}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              {new Date(news.ngayDang).toLocaleDateString('vi-VN')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">person</span>
              {news.nguoiDang}
            </div>
          </div>
        </div>

        {/* Image */}
        {news.hinhAnh && (
          <div className="w-full rounded-3xl overflow-hidden shadow-lg mb-12">
            <img 
              src={`/images/${news.hinhAnh}`} 
              alt={news.tieuDe} 
              className="w-full h-auto max-h-[500px] object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x500?text=News+Image'; }}
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 prose prose-slate max-w-none prose-headings:font-black prose-a:text-red-500 hover:prose-a:text-red-600">
          <p className="whitespace-pre-line text-slate-700 leading-relaxed text-lg">
            {news.noiDung}
          </p>
        </div>
      </div>
    </div>
  );
}
