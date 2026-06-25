"use client";

import { useState, useEffect } from "react";
import { Loader2, TrainFront } from "lucide-react";
import { stationService, Station } from "@/services/station.service";
import { TicketFare, ticketFareService } from "@/services/ticket-fare.service";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function SchedulePage() {
    // --- STATE ĐIỀU HƯỚNG TABS CHÍNH ---
    // 'schedule': Bảng thời gian chạy tàu | 'fare': Bảng giá vé
    const [activeMainTab, setActiveMainTab] = useState<'schedule' | 'fare'>('schedule');

    // --- STATE DỮ LIỆU ---
    const [stations, setStations] = useState<Station[]>([]);
    const [activeStationId, setActiveStationId] = useState<string | null>(null);
    const [ticketFares, setTicketFares] = useState<TicketFare[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // GỌI API LẤY DỮ LIỆU NHÀ GA VÀ GIÁ VÉ
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy dữ liệu Lịch chạy tàu của các Ga
                const scheduleRes = await stationService.getSchedule();
                const scheduleData = scheduleRes.data ? scheduleRes.data : scheduleRes;

                if (Array.isArray(scheduleData)) {
                    const sortedStations = scheduleData.sort((a, b) => a.display_order - b.display_order);
                    setStations(sortedStations);
                    if (sortedStations.length > 0) {
                        setActiveStationId(sortedStations[0].id);
                    }
                }

                // 2. Lấy dữ liệu Bảng giá vé
                const fareRes = await ticketFareService.getAllPublic();
                const fareData = fareRes.data ? fareRes.data : fareRes;

                if (Array.isArray(fareData)) {
                    // Lọc các vé đang active và sắp xếp theo thứ tự
                    const activeFares = fareData
                        .filter(fare => fare.is_active !== false)
                        .sort((a, b) => a.display_order - b.display_order);
                    setTicketFares(activeFares);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu lịch trình/giá vé:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Hàm phụ trợ lấy đường dẫn ảnh hoàn chỉnh
    const getImageUrl = (media: any) => {
        if (!media) return null;
        const imgPath = media.url || media.path;
        if (!imgPath) return null;
        if (imgPath.startsWith('http')) return imgPath;
        return `${BACKEND_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    // Lấy dữ liệu của nhà ga đang được chọn
    const activeStation = stations.find(s => s.id === activeStationId);

    return (
        <div className="w-full bg-white min-h-[75vh] pb-16 md:pb-24 max-w-[120rem] mx-auto px-4 lg:px-[56px] pt-8 md:pt-12">
            {/* Ẩn thanh cuộn cho khu vực Tab trên Mobile */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

            {/* ========================================= */}
            {/* KHU VỰC TABS CHUYỂN ĐỔI CHÍNH */}
            {/* ========================================= */}
            <div className="flex items-center justify-center gap-8 md:gap-16 mb-10">

                <button
                    onClick={() => setActiveMainTab('schedule')}
                    className={`pb-4 text-[16px] md:text-[18px] font-bold transition-all relative cursor-pointer
              ${activeMainTab === 'schedule'
                            ? 'text-[#005596]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    Bảng thời gian chạy tàu
                    {/* Gạch chân màu xanh khi active */}
                    {activeMainTab === 'schedule' && (
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#005596] rounded-t-md"></span>
                    )}
                </button>

                <button
                    onClick={() => setActiveMainTab('fare')}
                    className={`pb-4 text-[16px] md:text-[18px] font-bold transition-all relative cursor-pointer
              ${activeMainTab === 'fare'
                            ? 'text-[#005596]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    Bảng giá vé
                    {/* Gạch chân màu xanh khi active */}
                    {activeMainTab === 'fare' && (
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#005596] rounded-t-md"></span>
                    )}
                </button>

            </div>

            {/* ========================================= */}
            {/* KHU VỰC HIỂN THỊ NỘI DUNG */}
            {/* ========================================= */}
            <div className="w-full p-4 md:p-8 min-h-[400px]">

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <Loader2 className="w-10 h-10 text-[#005596] animate-spin mb-4" />
                        <p className="text-slate-500">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        {/* === TAB 1: BẢNG THỜI GIAN CHẠY TÀU === */}
                        {activeMainTab === 'schedule' && (
                            <div className="animate-in fade-in duration-500">
                                {/* 1. GIAO DIỆN MOBILE: SELECT BOX */}
                                <div className="md:hidden pb-4 w-full max-w-sm mx-auto">
                                    <div className="relative w-full">
                                        <select
                                            value={activeStationId || ""}
                                            onChange={(e) => setActiveStationId(e.target.value)}
                                            className="w-full appearance-none bg-white border-[1.5px] border-[#005596] text-[#005596] text-[15px] font-medium py-2 pl-4 rounded-xl outline-none focus:ring-2 focus:ring-[#005596]/20 transition-all cursor-pointer shadow-sm"
                                        >
                                            {stations.map((station) => (
                                                <option key={station.id} value={station.id}>
                                                    {station.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#005596]">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Danh sách các nút chọn nhà ga (Giống trang chủ) */}
                                <div className="hidden md:flex flex-wrap gap-2 md:gap-3 pb-6">
                                    {stations.map((station) => (
                                        <button
                                            key={station.id}
                                            onClick={() => setActiveStationId(station.id)}
                                            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[14px] rounded-full whitespace-nowrap transition-all duration-300 border-[1.5] font-medium shrink-0 cursor-pointer
                          ${activeStationId === station.id
                                                    ? 'bg-[#005596] text-white border-[#005596] shadow-md'
                                                    : 'bg-white text-[#005596] border-[#005596] hover:bg-blue-50'
                                                }`}
                                        >
                                            <TrainFront className="w-4 h-4" />
                                            {station.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Hiển thị hình ảnh lịch chạy tàu của ga được chọn */}
                                <div className="p-2 md:p-4 min-h-[300px] flex items-center justify-center">
                                    {activeStation?.schedule_image ? (
                                        <img
                                            src={getImageUrl(activeStation.schedule_image) as string}
                                            alt={`Lịch chạy tàu ga ${activeStation.name}`}
                                            className="w-full max-w-[60rem] mx-auto h-auto object-contain rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-slate-500 flex flex-col items-center py-10">
                                            <TrainFront className="w-12 h-12 text-slate-300 mb-3" />
                                            <p>Lịch chạy tàu của ga {activeStation?.name} đang được cập nhật.</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                        {/* === TAB 2: BẢNG GIÁ VÉ === */}
                        {activeMainTab === 'fare' && (
                            <div className="animate-in fade-in duration-500 flex flex-col gap-6">

                                {ticketFares.length > 0 ? (
                                    ticketFares.map((fare) => (
                                        <div key={fare.id} className="p-2 md:p-4">
                                            {fare.image ? (
                                                <img
                                                    src={getImageUrl(fare.image) as string}
                                                    alt={fare.title || "Bảng giá vé Metro"}
                                                    className="w-full max-w-[60rem] mx-auto h-auto object-contain rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-center py-6 text-slate-500">
                                                    Không có hình ảnh cho: {fare.title}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 flex items-center justify-center text-slate-500">
                                        Chưa có dữ liệu bảng giá vé.
                                    </div>
                                )}

                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}