"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, TrainFront } from "lucide-react";
import Link from "next/link";
import { Banner } from "@/services/banner.service";
import { Station } from "@/services/station.service";
import { Article } from "@/services/article.service";
import ArticleCard from "@/components/ArticleCard";

// Nhận dữ liệu đã được Server lấy sẵn thông qua Props
export default function HomeClient({
    initialBanners,
    initialStations,
    initialArticles
}: {
    initialBanners: Banner[];
    initialStations: Station[];
    initialArticles: Article[];
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Chọn luôn nhà ga đầu tiên từ dữ liệu có sẵn
    const [activeStationId, setActiveStationId] = useState<string | null>(
        initialStations.length > 0 ? initialStations[0].id : null
    );

    const articlesScrollRef = useRef<HTMLDivElement>(null);
    const [articlesScrollProgress, setArticlesScrollProgress] = useState(0);

    const scrollArticles = (direction: 'left' | 'right') => {
        if (articlesScrollRef.current) {
            const { clientWidth } = articlesScrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            articlesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleArticlesScroll = () => {
        if (articlesScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = articlesScrollRef.current;
            const maxScroll = scrollWidth - clientWidth;
            const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
            setArticlesScrollProgress(progress);
        }
    };

    // TỰ ĐỘNG CHUYỂN SLIDE
    useEffect(() => {
        if (initialBanners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % initialBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex, initialBanners.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + initialBanners.length) % initialBanners.length);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % initialBanners.length);
    };

    const getBannerUrl = (banner: Banner) => {
        if (!banner.image) return '/hero-metro.png';
        const imgPath = (banner.image as any).url || (banner.image as any).path;
        if (!imgPath) return '/hero-metro.png';
        if (imgPath.startsWith('http')) return imgPath;
        return `${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    const activeStation = initialStations.find(s => s.id === activeStationId);

    return (
        <div className="w-full bg-white">
            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

            {/* AREA 1: BANNER SLIDER */}
            <section className="relative w-full aspect-[16/7] md:aspect-[21/9] lg:aspect-[2.6/1] group overflow-hidden">
                <div className="flex w-full h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {initialBanners.map((banner, index) => (
                        <div key={banner.id || index} className="w-full h-full shrink-0 relative">
                            <Link href={banner.redirect_url || "#"} className="block w-full h-full cursor-pointer">
                                <img
                                    src={getBannerUrl(banner)}
                                    alt={banner.title || `HCMC Metro Banner ${index + 1}`}
                                    className="w-full h-full"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/hero-metro.png'; }}
                                />
                            </Link>
                        </div>
                    ))}
                </div>

                {initialBanners.length > 1 && (
                    <button onClick={prevSlide} className="absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 bg-white/50 hover:bg-white text-slate-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                        <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                )}
                {initialBanners.length > 1 && (
                    <button onClick={nextSlide} className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 bg-white/50 hover:bg-white text-slate-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                        <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                )}
                {initialBanners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {initialBanners.map((_, index) => (
                            <button key={index} onClick={() => setCurrentIndex(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-6 lg:w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white'}`} />
                        ))}
                    </div>
                )}
            </section>

            {/* AREA 2: TẢI ỨNG DỤNG */}
            <section className="py-8 md:py-12">
                <div className="flex flex-col items-center justify-center text-center">
                    <h2 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-[#1e293b] mb-6 md:mb-8">
                        Tải ngay ứng dụng Metro tại đây
                    </h2>
                    <div className="flex flex-row items-center justify-center gap-4">
                        <Link href="https://apps.apple.com/vn/app/hcmc-metro-hurc/id6449395180" target="_blank" className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg">
                            <img src="/app-store.svg" alt="Download on the App Store" className="h-[40px] md:h-[48px] w-auto object-contain block" />
                        </Link>
                        <Link href="https://play.google.com/store/apps/details?id=com.fts.metro" target="_blank" className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg">
                            <img src="/google-play.svg" alt="Get it on Google Play" className="h-[40px] md:h-[48px] w-auto object-contain block" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* AREA 3: THÔNG TIN NHÀ GA */}
            <section className="max-w-[120rem] mx-auto px-8 lg:px-[112px]">
                <h2 className="text-[22px] md:text-[26px] lg:text-[28px] font-bold text-[#005596] mb-6 text-center">
                    Tuyến Bến Thành - Suối Tiên
                </h2>

                {/* MOBILE SELECT */}
                <div className="md:hidden pb-4 w-full max-w-sm mx-auto">
                    <div className="relative w-full">
                        <select value={activeStationId || ""} onChange={(e) => setActiveStationId(e.target.value)} className="w-full appearance-none bg-white border-[1.5px] border-[#005596] text-[#005596] text-[15px] font-medium py-2 pl-4 rounded-xl outline-none focus:ring-2 focus:ring-[#005596]/20 transition-all cursor-pointer shadow-sm">
                            {initialStations.map((station) => (
                                <option key={station.id} value={station.id}>{station.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#005596]">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* DESKTOP BUTTONS */}
                <div className="hidden md:flex flex-wrap justify-center gap-2 md:gap-3 pb-6">
                    {initialStations.map((station) => (
                        <button key={station.id} onClick={() => setActiveStationId(station.id)} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[14px] rounded-full whitespace-nowrap transition-all duration-300 border-[1.5px] font-medium shrink-0 cursor-pointer ${activeStationId === station.id ? 'bg-[#005596] text-white border-[#005596] shadow-md' : 'bg-white text-[#005596] border-[#005596] hover:bg-blue-50'}`}>
                            <TrainFront className="w-4 h-4" />{station.name}
                        </button>
                    ))}
                </div>

                {/* NỘI DUNG GA */}
                <div className="lg:w-[60vw] lg:max-w-5xl mx-auto min-h-[300px] overflow-hidden">
                    {activeStation?.content ? (
                        <div className="flex flex-col gap-2 w-full">
                            <h3 className="text-[20px] md:text-[24px] font-bold text-[#005596] mb-4 text-center">{activeStation.name}</h3>
                            <div className="text-slate-800 text-[15px] md:text-[16px] leading-relaxed w-full whitespace-pre-wrap break-words overflow-x-hidden [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul>li]:mb-2 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol>li]:mb-2 [&>strong]:font-bold [&>b]:font-bold [&_a]:text-blue-600 [&_a]:underline [&_a]:break-all" dangerouslySetInnerHTML={{ __html: activeStation.content.replace(/&nbsp;/g, ' ') }} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10"><p>Nội dung nhà ga đang được cập nhật.</p></div>
                    )}
                </div>
            </section>

            {/* AREA 4: TẦM NHÌN */}
            <section className="py-10 md:py-16 max-w-[120rem] mx-auto px-8 lg:px-[112px]">
                <h2 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-center text-[#005596] mb-16 md:mb-24 tracking-wide">Tầm nhìn - Sứ mệnh - Giá trị cốt lõi</h2>
                <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 px-4 lg:px-0">
                    <div className="flex flex-col items-start text-left group">
                        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm mb-6 border border-slate-100"><img src="/anh-1.png" alt="Tầm nhìn HCMC Metro" className="w-full h-full object-cover" /></div>
                        <h3 className="text-[20px] md:text-[22px] font-bold text-slate-800 relative pb-3 mb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#005596]">Tầm nhìn</h3>
                        <p className="text-slate-600 text-[15px] md:text-[16px] leading-relaxed">Chung sức xây dựng thành phố xanh, văn minh, hiện đại và phát triển bền vững.</p>
                    </div>
                    <div className="flex flex-col items-start text-left group">
                        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm mb-6 border border-slate-100"><img src="/anh-2.png" alt="Sứ mệnh HCMC Metro" className="w-full h-full object-cover" /></div>
                        <h3 className="text-[20px] md:text-[22px] font-bold text-slate-800 relative pb-3 mb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#005596]">Sứ mệnh</h3>
                        <p className="text-slate-600 text-[15px] md:text-[16px] leading-relaxed">Chúng tôi cam kết cung cấp cho bạn một trải nghiệm di chuyển tốt nhất có thể nhằm tạo ra sự kết nối và phục vụ chất lượng, đồng thời góp phần vào sự phát triển bền vững của thành phố.</p>
                    </div>
                    <div className="flex flex-col items-start text-left group">
                        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm mb-6 border border-slate-100"><img src="/anh-3.png" alt="Giá trị cốt lõi HCMC Metro" className="w-full h-full object-cover" /></div>
                        <h3 className="text-[20px] md:text-[22px] font-bold text-slate-800 relative pb-3 mb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#005596]">Giá trị cốt lõi</h3>
                        <p className="text-slate-600 text-[15px] md:text-[16px] leading-relaxed">Tin cậy trong vận hành - Chất lượng trong dịch vụ - Tận tâm trong công việc - Đồng hành cùng phát triển.</p>
                    </div>
                </div>
            </section>

            {/* AREA 5: TIN TỨC MỚI */}
            <section className="py-12 md:py-16 bg-[#eef4f9]">
                <div className="max-w-[120rem] mx-auto px-8 lg:px-[112px] lg:ml-20 relative">
                    <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-[#005596] mb-6 md:mb-8">Tin tức</h2>

                    {initialArticles.length > 0 ? (
                        <div className="relative group/slider">
                            {/* Nút bấm Trái (Desktop) */}
                            <button
                                onClick={() => scrollArticles('left')}
                                className="hidden md:flex absolute -left-5 top-[100px] z-10 w-10 h-10 bg-white/90 hover:bg-white text-slate-400 hover:text-[#e04a32] rounded-full items-center justify-center shadow-md transition-all opacity-0 group-hover/slider:opacity-100"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Khung cuộn ngang (Swipeable) */}
                            <div
                                ref={articlesScrollRef}
                                onScroll={handleArticlesScroll}
                                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
                            >
                                {initialArticles.slice(0, 6).map((article) => (
                                    <div key={article.id} className="w-[85vw] md:w-[calc(33.3333%-1rem)] shrink-0 snap-start bg-white rounded-2xl shadow-sm transition-transform duration-700 ease-in-out hover:shadow-md">
                                        <ArticleCard article={article} />
                                    </div>
                                ))}
                            </div>

                            {/* Nút bấm Phải (Desktop) */}
                            <button
                                onClick={() => scrollArticles('right')}
                                className="hidden md:flex absolute -right-5 top-[100px] z-10 w-10 h-10 bg-white/90 hover:bg-white text-slate-400 hover:text-[#e04a32] rounded-full items-center justify-center shadow-md transition-all opacity-0 group-hover/slider:opacity-100"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Dấu chấm điều hướng (Pagination Dots) */}
                            <div className="hidden md:flex justify-center items-center gap-2 mt-6">
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${articlesScrollProgress < 0.5 ? 'bg-[#e04a32]' : 'bg-slate-300'}`}></div>
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${articlesScrollProgress >= 0.5 ? 'bg-[#e04a32]' : 'bg-slate-300'}`}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-6">Chưa có tin tức nào được cập nhật.</div>
                    )}
                </div>
            </section>

            {/* AREA 6: ĐỐI TÁC */}
            <section className="py-6 md:py-12 max-w-[120rem] mx-auto px-8 lg:px-[112px] lg:ml-20">
                <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-[#005596] mb-8 md:mb-12">Đối tác thương hiệu</h2>
                <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-8 lg:gap-16 items-center justify-items-center max-w-8xl mx-auto">
                    <div className="w-full flex justify-center"><img src="/hitachi.jpg" alt="Hitachi" className="h-[60px] md:h-[120px] lg:h-[180px] w-auto object-contain block" /></div>
                    <div className="w-full flex justify-center"><img src="/tokyoMetro.jpg" alt="TokyoMetro" className="h-[60px] md:h-[120px] lg:h-[180px] w-auto object-contain block" /></div>
                    <div className="w-full flex justify-center"><img src="/masterCard.jpg" alt="Mastercard" className="h-[60px] md:h-[120px] lg:h-[180px] w-auto object-contain block" /></div>
                    <div className="w-full flex justify-center"><img src="/Logo-FPT.png" alt="FPT" className="h-[60px] md:h-[120px] lg:h-[180px] w-auto object-contain block" /></div>
                </div>
            </section>
        </div>
    );
}