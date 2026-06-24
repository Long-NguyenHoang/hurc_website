"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, TrainFront } from "lucide-react";
import { bannerService, Banner } from "@/services/banner.service";
import Link from "next/link";
import { Station, stationService } from "@/services/station.service";
import { Article, articleService } from "@/services/article.service";
import ArticleCard from "@/components/ArticleCard";

// Cấu hình URL Backend
const BACKEND_URL = "http://localhost:3000";

export default function Home() {
  // --- STATE BANNER ---
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE NHÀ GA ---
  const [stations, setStations] = useState<Station[]>([]);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [isStationLoading, setIsStationLoading] = useState(true);

  // --- STATE TIN TỨC ---
  const [articles, setArticles] = useState<Article[]>([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);

  // 1. GỌI API LẤY DATA
  useEffect(() => {
    // Tải Banner
    const fetchBanners = async () => {
      try {
        const response = await bannerService.getAllPublic();
        const data = response.data ? response.data : response;

        const sortedBanners = Array.isArray(data)
          ? data.sort((a, b) => a.display_order - b.display_order)
          : [];

        setBanners(sortedBanners);
      } catch (error) {
        console.error("Lỗi khi tải banner:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Tải Nhà Ga
    const fetchStations = async () => {
      try {
        const response = await stationService.getContent();
        const data = response.data ? response.data : response;

        if (Array.isArray(data)) {
          // Sắp xếp theo thứ tự display_order bạn đã định nghĩa ở backend
          const sortedStations = data.sort((a, b) => a.display_order - b.display_order);
          setStations(sortedStations);

          // Mặc định chọn nhà ga đầu tiên cho sáng lên
          if (sortedStations.length > 0) {
            setActiveStationId(sortedStations[0].id);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu nhà ga:", error);
      } finally {
        setIsStationLoading(false);
      }
    };

    // Tải tin tức trang chủ (8 bài mới nhất)
    const fetchLatestArticles = async () => {
      try {
        // Truyền params giới hạn 8 bài viết, sắp xếp mới nhất thường xử lý ở Backend
        const response = await articleService.getAllPublic({ page: 1, limit: 8 });
        const resData = response.data ? response.data : response;

        // Vì NestJS sử dụng thư viện phân trang có thể bọc dữ liệu trong field .data hoặc .items
        const list = Array.isArray(resData)
          ? resData
          : (resData.data || resData.items || []);

        setArticles(list.slice(0, 8)); // Đảm bảo an toàn chỉ lấy tối đa 8 bài
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
      } finally {
        setIsArticlesLoading(false);
      }
    };

    fetchBanners();
    fetchStations();
    fetchLatestArticles();
  }, []);

  // 2. TỰ ĐỘNG CHUYỂN SLIDE (5 giây)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // 3. HIỂN THỊ LOADING THEO ĐÚNG KHUNG MỚI
  if (isLoading) {
    return (
      <div className="w-full bg-white py-4 lg:py-6">
        <div className="max-w-[120rem] mx-auto px-4 lg:px-[56px]">
          <div className="w-full aspect-[16/7] md:aspect-[21/9] lg:aspect-[2.5/1] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const getBannerUrl = (banner: Banner) => {
    if (!banner.image) return '/hero-metro.png';
    const imgPath = (banner.image as any).url || (banner.image as any).path;
    if (!imgPath) return '/hero-metro.png';
    if (imgPath.startsWith('http')) return imgPath;
    return `${BACKEND_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const activeStation = stations.find(s => s.id === activeStationId);

  return (
    <div className="w-full bg-white py-4 lg:py-6">
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      {/* ĐƯA BANNER VÀO BỘ KHUNG CHUẨN ĐỂ THẲNG LỀ HEADER/FOOTER */}
      <div className="max-w-[120rem] mx-auto px-4 lg:px-[56px]">

        {/* KHỐI SLIDER (Thay chiều cao tĩnh bằng Aspect Ratio) */}
        {/* Tỷ lệ aspect-[2.5/1] trên Desktop giúp ảnh trải dài giống hình chữ nhật ngang, không bị quá to cao */}
        <section className="relative w-full aspect-[16/7] md:aspect-[21/9] lg:aspect-[2.5/1] rounded-lg overflow-hidden group shadow-sm">

          {/* THẺ LINK BỌC HÌNH ẢNH (Bấm vào ảnh chuyển trang) */}
          <div
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner, index) => (
              // Mỗi slide là một khối (shrink-0) bắt buộc rộng bằng đúng 100% khung hình
              <div key={banner.id || index} className="w-full h-full shrink-0 relative">
                <Link href={banner.redirect_url || "#"} className="block w-full h-full cursor-pointer">
                  <img
                    src={getBannerUrl(banner)}
                    alt={banner.title || `HCMC Metro Banner ${index + 1}`}
                    className="w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/hero-metro.png';
                    }}
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* NÚT ĐIỀU HƯỚNG BÊN TRÁI */}
          {banners.length > 1 && (
            <button
              onClick={(e) => { e.preventDefault(); prevSlide(); }}
              className="absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 bg-white/50 hover:bg-white text-slate-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          )}

          {/* NÚT ĐIỀU HƯỚNG BÊN PHẢI */}
          {banners.length > 1 && (
            <button
              onClick={(e) => { e.preventDefault(); nextSlide(); }}
              className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 bg-white/50 hover:bg-white text-slate-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          )}

          {/* DẤU CHẤM PHÂN TRANG Ở ĐÁY ẢNH */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-6 lg:w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                  onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                />
              ))}
            </div>
          )}
        </section>
        {/* AREA 2: KÊU GỌI TẢI ỨNG DỤNG */}
        <section className="py-8 md:py-12">
          {/* Vẫn giữ bộ khung chuẩn để phòng hờ sau này bạn muốn thêm nội dung gì đó ở 2 bên */}
          <div>

            {/* Flexbox canh giữa toàn bộ nội dung */}
            <div className="flex flex-col items-center justify-center text-center">

              {/* Tiêu đề chính */}
              <h2 className="text-[20px] md:text-[24px] lg:text-[26px] font-bold text-[#1e293b] mb-6 md:mb-8">
                Tải ngay ứng dụng Metro tại đây
              </h2>

              {/* Khối chứa 2 nút tải app (hiển thị nằm ngang) */}
              <div className="flex flex-row items-center justify-center gap-4">

                {/* Nút App Store */}
                <Link
                  href="https://apps.apple.com/vn/app/hcmc-metro-hurc/id6449395180"
                  target="_blank"
                  className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg"
                >
                  <img
                    src="/app-store.svg"
                    alt="Download on the App Store"
                    className="h-[40px] md:h-[48px] w-auto object-contain block"
                  />
                </Link>

                {/* Nút Google Play */}
                <Link
                  href="https://play.google.com/store/apps/details?id=com.fts.metro"
                  target="_blank"
                  className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg"
                >
                  <img
                    src="/google-play.svg"
                    alt="Get it on Google Play"
                    className="h-[40px] md:h-[48px] w-auto object-contain block"
                  />
                </Link>

              </div>
            </div>
          </div>
        </section>
        {/* AREA 3: THÔNG TIN NHÀ GA (Dạng Tabs) */}
        <section>
          <div>
            {/* Tiêu đề chính giống thiết kế gốc */}
            <h2 className="text-[22px] md:text-[26px] lg:text-[28px] font-bold text-[#005596] mb-6">
              Tuyến Bến Thành - Suối Tiên
            </h2>

            {isStationLoading ? (
              <div className="flex justify-center my-10"><Loader2 className="w-8 h-8 text-[#005596] animate-spin" /></div>
            ) : (
              <>
                {/* KHỐI NÚT ĐIỀU HƯỚNG NHÀ GA */}
                {/* Sửa thành flex-wrap để các nút tự động rớt xuống dòng khi hết chỗ */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 pb-6">
                  {stations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => setActiveStationId(station.id)}
                      className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[13px] md:text-[14px] font-medium transition-all duration-200 ${activeStationId === station.id
                        ? 'bg-[#005596] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      {station.name}
                    </button>
                  ))}
                </div>

                {/* KHỐI HIỂN THỊ NỘI DUNG NHÀ GA */}
                {/* Tái tạo chính xác max-width: 60vw của bản gốc, canh giữa (mx-auto) */}
                <div className="lg:w-[60vw] lg:max-w-5xl mx-auto min-h-[300px] overflow-hidden">
                  {activeStation?.content ? (
                    <div className="flex flex-col gap-4 w-full">

                      <h3 className="text-[20px] md:text-[24px] font-bold text-[#005596] mb-2">
                        {activeStation.name}
                      </h3>
                      <div
                        className="text-slate-800 text-[15px] md:text-[16px] leading-relaxed w-full
                                 whitespace-pre-wrap break-words overflow-x-hidden
                                 [&>p]:mb-4 
                                 [&>ul]:list-disc [&>ul]:ml-6 [&>ul>li]:mb-2 
                                 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol>li]:mb-2
                                 [&>strong]:font-bold [&>b]:font-bold
                                 [&_a]:text-blue-600 [&_a]:underline [&_a]:break-all"
                        dangerouslySetInnerHTML={{
                          __html: activeStation.content.replace(/&nbsp;/g, ' ')
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                      <p>Nội dung nhà ga đang được cập nhật.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
        {/* AREA 4: TẦM NHÌN - SỨ MỆNH - GIÁ TRỊ CỐT LÕI */}
        <section className="py-10 md:py-16">
          {/* Khung lớn ngoài cùng để đồng bộ lề 56px */}
          <div>

            {/* Tiêu đề lớn của cả phân đoạn */}
            <h2 className="text-[22px] md:text-[26px] lg:text-[28px] font-bold text-center text-[#005596] mb-16 md:mb-24 tracking-wide">
              Tầm nhìn - Sứ mệnh - Giá trị cốt lõi
            </h2>

            <div className="max-w-5xl mx-auto flex flex-col gap-16 md:gap-24">

              {/* KHỐI 1: TẦM NHÌN (Chữ trái - Ảnh phải) */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                {/* Bên chữ */}
                <div className="w-full md:w-1/2 space-y-4 text-left">
                  <h3 className="text-[20px] md:text-[24px] font-bold text-slate-800 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#005596]">
                    Tầm nhìn
                  </h3>
                  <p className="text-slate-600 text-[16px] md:text-[18px] leading-relaxed font-medium">
                    Chung sức xây dựng thành phố xanh, văn minh, hiện đại và phát triển bền vững.
                  </p>
                </div>
                {/* Bên ảnh */}
                <div className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                  <img
                    src="/anh-1.png"
                    alt="Tầm nhìn HCMC Metro"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/hero-metro.png'; }}
                  />
                </div>
              </div>

              {/* KHỐI 2: SỨ MỆNH (Ảnh trái - Chữ phải trên Desktop, nhưng tự xếp chữ lên trước trên Mobile) */}
              {/* Bí quyết: Dùng md:flex-row-reverse */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
                {/* Bên chữ */}
                <div className="w-full md:w-1/2 space-y-4 text-left">
                  <h3 className="text-[20px] md:text-[24px] font-bold text-slate-800 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#005596]">
                    Sứ mệnh
                  </h3>
                  <p className="text-slate-600 text-[16px] md:text-[18px] leading-relaxed font-medium">
                    Chúng tôi cam kết cung cấp cho bạn một trải nghiệm di chuyển tốt nhất có thể nhằm tạo ra sự kết nối và phục vụ chất lượng, đồng thời góp phần vào sự phát triển bền vững của thành phố.
                  </p>
                </div>
                {/* Bên ảnh */}
                <div className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                  <img
                    src="/anh-2.png"
                    alt="Sứ mệnh HCMC Metro"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/hero-metro.png'; }}
                  />
                </div>
              </div>

              {/* KHỐI 3: GIÁ TRỊ CỐT LÕI (Chữ trái - Ảnh phải) */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                {/* Bên chữ */}
                <div className="w-full md:w-1/2 space-y-4 text-left">
                  <h3 className="text-[20px] md:text-[24px] font-bold text-slate-800 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#005596]">
                    Giá trị cốt lõi
                  </h3>
                  <p className="text-slate-600 text-[16px] md:text-[18px] leading-relaxed font-medium">
                    Tin cậy trong vận hành - Chất lượng trong dịch vụ - Tận tâm trong công việc - Đồng hành cùng phát triển.
                  </p>
                </div>
                {/* Bên ảnh */}
                <div className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                  <img
                    src="/anh-3.png"
                    alt="Giá trị cốt lõi HCMC Metro"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/hero-metro.png'; }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* AREA 5: KHUNG TIN TỨC MỚI CẬP NHẬT */}
        <section className="py-6 md:py-10">
          {/* Bộ khung tỷ lệ vàng 120rem và lề px-56px cố định */}
          <div className="max-w-[120rem] mx-auto px-4 lg:px-[56px]">

            {/* Tiêu đề lệch trái màu xanh giống hệt ảnh chụp */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-[22px] md:text-[26px] lg:text-[28px] font-bold text-[#005596]">
                Tin tức
              </h2>
            </div>

            {/* Khối hiển thị danh sách tin tức */}
            {isArticlesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3 w-full">
                    <div className="w-full aspect-[16/10] bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              /* LƯỚI TIN TỨC: Chia 4 cột tăm tắp trên Desktop, khoảng cách hàng rộng rãi (gap-y-10) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-left text-slate-500 py-6">
                Chưa có tin tức nào được cập nhật.
              </div>
            )}
          </div>
        </section>
        {/* AREA 6: ĐỐI TÁC THƯƠNG HIỆU */}
        <section className="py-4 md:py-8">
          <div>

            {/* Tiêu đề */}
            <h2 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-center text-[#005596] mb-10 md:mb-14">
              Đối tác thương hiệu
            </h2>

            {/* Lưới Logo Đối Tác */}
            <div className="flex flex-wrap items-center justify-center gap-32 md:gap-40 lg:gap-48">

              {/* Logo 1: Hitachi */}
              <div>
                <img
                  src="/hitachi.jpg"
                  alt="Hitachi"
                  className="h-[150px] md:h-[200px] w-auto object-contain block"
                />
              </div>

              {/* Logo 2: Tokyo Metro */}
              <div>
                <img
                  src="/tokyoMetro.jpg"
                  alt="TokyoMetro"
                  className="h-[150px] md:h-[200px] w-auto object-contain block"
                />
              </div>

              {/* Logo 3: Mastercard */}
              <div>
                <img
                  src="/masterCard.jpg"
                  alt="Mastercard"
                  className="h-[150px] md:h-[200px] w-auto object-contain block"
                />
              </div>

              {/* Logo 4: FPT */}
              <div>
                <img
                  src="/Logo-FPT.png"
                  alt="FPT"
                  className="h-[150px] md:h-[200px] w-auto object-contain block"
                />
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}