"use client";

import { useState } from "react";
import { TrainFront } from "lucide-react";
import { Station } from "@/services/station.service";
import { TicketFare } from "@/services/ticket-fare.service";



export default function ScheduleClient({
    initialStations,
    initialFares
}: {
    initialStations: Station[],
    initialFares: TicketFare[]
}) {
    // --- STATE ĐIỀU HƯỚNG TABS CHÍNH ---
    const [activeMainTab, setActiveMainTab] = useState<'schedule' | 'fare'>('schedule');

    // --- STATE DỮ LIỆU ---
    // Khởi tạo state thẳng từ dữ liệu mớm sẵn, không cần isLoading nữa
    const [stations] = useState<Station[]>(initialStations);
    const [activeStationId, setActiveStationId] = useState<string | null>(
        initialStations.length > 0 ? initialStations[0].id : null
    );
    const [ticketFares] = useState<TicketFare[]>(initialFares);

    // Hàm phụ trợ lấy đường dẫn ảnh hoàn chỉnh
    const getImageUrl = (media: any) => {
        if (!media) return null;
        const imgPath = media.url || media.path;
        if (!imgPath) return null;
        if (imgPath.startsWith('http')) return imgPath;
        return `${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    const activeStation = stations.find(s => s.id === activeStationId);

    // ==========================================
    // TOÀN BỘ PHẦN RETURN (UI) GIỮ NGUYÊN NHƯ CŨ (Chỉ bỏ cục loader đi)
    // ==========================================
    return (
        <div className="w-full bg-white min-h-[75vh] pb-16 md:pb-24 max-w-[120rem] mx-auto px-4 lg:px-[56px] pt-8 md:pt-12">
            <style dangerouslySetInnerHTML={{
                __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`
            }} />

            {/* TABS */}
            <div className="flex items-center justify-center gap-8 md:gap-16 mb-10">
                <button onClick={() => setActiveMainTab('schedule')} className={`pb-4 text-[16px] md:text-[18px] font-bold transition-all relative cursor-pointer ${activeMainTab === 'schedule' ? 'text-[#005596]' : 'text-slate-500 hover:text-slate-800'}`}>
                    Bảng thời gian chạy tàu
                    {activeMainTab === 'schedule' && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#005596] rounded-t-md"></span>}
                </button>
                <button onClick={() => setActiveMainTab('fare')} className={`pb-4 text-[16px] md:text-[18px] font-bold transition-all relative cursor-pointer ${activeMainTab === 'fare' ? 'text-[#005596]' : 'text-slate-500 hover:text-slate-800'}`}>
                    Bảng giá vé
                    {activeMainTab === 'fare' && <span className="absolute bottom-0 left-0 w-full h-1 bg-[#005596] rounded-t-md"></span>}
                </button>
            </div>

            <div className="w-full p-4 md:p-8 min-h-[400px]">
                {/* === TAB 1: BẢNG THỜI GIAN CHẠY TÀU === */}
                {activeMainTab === 'schedule' && (
                    <div className="animate-in fade-in duration-500">
                        {/* SELECT MOBILE */}
                        <div className="md:hidden pb-4 w-full max-w-sm mx-auto">
                            <div className="relative w-full">
                                <select value={activeStationId || ""} onChange={(e) => setActiveStationId(e.target.value)} className="w-full appearance-none bg-white border-[1.5px] border-[#005596] text-[#005596] text-[15px] font-medium py-2 pl-4 rounded-xl outline-none focus:ring-2 focus:ring-[#005596]/20 transition-all cursor-pointer shadow-sm">
                                    {stations.map((station) => (
                                        <option key={station.id} value={station.id}>{station.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#005596]">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* BUTTONS DESKTOP */}
                        <div className="hidden md:flex flex-wrap gap-2 md:gap-3 pb-6">
                            {stations.map((station) => (
                                <button key={station.id} onClick={() => setActiveStationId(station.id)} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[14px] rounded-full whitespace-nowrap transition-all duration-300 border-[1.5px] font-medium shrink-0 cursor-pointer ${activeStationId === station.id ? 'bg-[#005596] text-white border-[#005596] shadow-md' : 'bg-white text-[#005596] border-[#005596] hover:bg-blue-50'}`}>
                                    <TrainFront className="w-4 h-4" />{station.name}
                                </button>
                            ))}
                        </div>

                        {/* ẢNH LỊCH */}
                        <div className="p-2 md:p-4 min-h-[300px] flex items-center justify-center">
                            {activeStation?.schedule_image ? (
                                <img src={getImageUrl(activeStation.schedule_image) as string} alt={`Lịch chạy tàu ga ${activeStation.name}`} className="w-full max-w-[60rem] mx-auto h-auto object-contain rounded-lg" />
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
                                        <img src={getImageUrl(fare.image) as string} alt={fare.title || "Bảng giá vé Metro"} className="w-full max-w-[60rem] mx-auto h-auto object-contain rounded-lg" />
                                    ) : (
                                        <div className="text-center py-6 text-slate-500">Không có hình ảnh cho: {fare.title}</div>
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
            </div>
        </div>
    );
}