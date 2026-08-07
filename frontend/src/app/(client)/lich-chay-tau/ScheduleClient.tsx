"use client";

import { useEffect, useState } from "react";
import { ArrowRightLeft, CreditCard, Loader2, MapPin, Search, TrainFront } from "lucide-react";
import { Station } from "@/services/station.service";
import { TicketFare, ticketFareService } from "@/services/ticket-fare.service";

export default function ScheduleClient({
    initialStations,
    initialFares
}: {
    initialStations: Station[],
    initialFares: TicketFare[]
}) {
    // --- STATE ĐIỀU HƯỚNG TABS CHÍNH ---
    const [activeMainTab, setActiveMainTab] = useState<'schedule' | 'fare'>('schedule');

    // --- STATE LỊCH TRÌNH ---
    const [stations] = useState<Station[]>(initialStations);
    const [activeStationId, setActiveStationId] = useState<string | null>(
        initialStations.length > 0 ? initialStations[0].id : null
    );

    // --- STATE GIÁ VÉ ---
    const [fromStationId, setFromStationId] = useState<string>('');
    const [toStationId, setToStationId] = useState<string>('');
    const [fareResult, setFareResult] = useState<{ price: number, pathStations?: Station[] } | null>(null);
    const [isLoadingFare, setIsLoadingFare] = useState<boolean>(false);
    const [fareError, setFareError] = useState<string>('');

    useEffect(() => {
        const fetchFare = async () => {
            if (!fromStationId || !toStationId) {
                setFareResult(null);
                setFareError('');
                return;
            }
            if (fromStationId === toStationId) {
                setFareResult({ price: 0 });
                setFareError('');
                return;
            }

            try {
                setIsLoadingFare(true);
                setFareError('');
                const res = await ticketFareService.getTicketFare(fromStationId, toStationId);
                const data = res.data ? res.data : res;
                setFareResult(data);
            } catch (err: any) {
                console.error(err);
                setFareError(err.response?.data?.message || 'Có lỗi xảy ra khi tra cứu giá vé');
                setFareResult(null);
            } finally {
                setIsLoadingFare(false);
            }
        };
        fetchFare();
    }, [fromStationId, toStationId]);

    const handleSwapStations = () => {
        const temp = fromStationId;
        setFromStationId(toStationId);
        setToStationId(temp);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm phụ trợ lấy đường dẫn ảnh hoàn chỉnh
    const getImageUrl = (media: any) => {
        if (!media) return null;
        const imgPath = media.url || media.path;
        if (!imgPath) return null;
        if (imgPath.startsWith('http')) return imgPath;
        return `${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    const activeStation = stations.find(s => s.id === activeStationId);

    return (
        <div className="w-full bg-white min-h-[75vh] pb-16 md:pb-24 max-w-[120rem] mx-auto px-4 lg:px-[65px] pt-8 md:pt-12">
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
                                    {stations.map((station, idx) => (
                                        <option key={`${station.id}-${idx}`} value={station.id}>{station.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#005596]">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* BUTTONS DESKTOP */}
                        <div className="hidden md:flex flex-wrap gap-2 md:gap-3 pb-6">
                            {stations.map((station, idx) => (
                                <button key={`${station.id}-${idx}`} onClick={() => setActiveStationId(station.id)} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[14px] rounded-full whitespace-nowrap transition-all duration-300 border-[1.5px] font-medium shrink-0 cursor-pointer ${activeStationId === station.id ? 'bg-[#005596] text-white border-[#005596] shadow-md' : 'bg-white text-[#005596] border-[#005596] hover:bg-blue-50'}`}>
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
                    <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* CỘT TRÁI: FORM TÌM KIẾM & BẢNG GIÁ KHÁC */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Hộp Tra cứu */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                                <h3 className="font-bold text-xl md:text-2xl flex items-center gap-2 mb-4 border-b pb-3">
                                    Tra cứu giá vé
                                </h3>

                                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                                    {/* Điểm đi */}
                                    <div className="w-full flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Ga đi</label>
                                        <div className="relative">
                                            <select
                                                value={fromStationId}
                                                onChange={(e) => setFromStationId(e.target.value)}
                                                className="w-full appearance-none bg-slate-50 border-[1.5px] border-slate-200 text-slate-700 text-[14px] font-medium py-3 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-[#005596]/20 focus:border-[#005596] transition-all cursor-pointer"
                                            >
                                                <option value="">-- Chọn ga đi --</option>
                                                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nút Đảo chiều */}
                                    <button
                                        onClick={handleSwapStations}
                                        className="mt-6 p-3 rounded-full bg-[#005596]/10 text-[#005596] hover:bg-[#005596] hover:text-white transition-all transform hover:scale-110 flex-shrink-0"
                                        title="Đổi chiều đi/đến"
                                    >
                                        <ArrowRightLeft className="w-5 h-5" />
                                    </button>

                                    {/* Điểm đến */}
                                    <div className="w-full flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Ga đến</label>
                                        <div className="relative">
                                            <select
                                                value={toStationId}
                                                onChange={(e) => setToStationId(e.target.value)}
                                                className="w-full appearance-none bg-slate-50 border-[1.5px] border-slate-200 text-slate-700 text-[14px] font-medium py-3 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-[#005596]/20 focus:border-[#005596] transition-all cursor-pointer"
                                            >
                                                <option value="">-- Chọn ga đến --</option>
                                                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hộp Bảng giá vé khác */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 border-b pb-3">
                                    💳 Các loại vé khác
                                </h3>
                                <div className="space-y-4 text-[16px]">
                                    <div className="flex justify-between font-medium">
                                        <span className="text-slate-600">Vé 01 ngày</span>
                                        <span className="font-bold">40.000đ</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span className="text-slate-600">Vé 03 ngày</span>
                                        <span className="font-bold">90.000đ</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span className="text-slate-600">Vé tháng phổ thông</span>
                                        <span className="font-bold">300.000đ</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span className="text-slate-600">Vé tháng học sinh, sinh viên</span>
                                        <span className="font-bold">150.000đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: KẾT QUẢ GIÁ VÉ & LỘ TRÌNH */}
                        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 relative min-h-[400px]">
                            {isLoadingFare ? (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                                    <div className="flex flex-col items-center text-[#005596]">
                                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                        <p className="font-medium">Đang tính toán giá vé...</p>
                                    </div>
                                </div>
                            ) : fareError ? (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100 flex items-center justify-center h-full">
                                    {fareError}
                                </div>
                            ) : fareResult ? (
                                <div className="animate-in fade-in duration-300 h-full flex flex-col">

                                    {/* Header Kết quả */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                                {stations.find(s => s.id === fromStationId)?.name || 'Ga đi'}
                                                <span className="text-slate-300">→</span>
                                                {stations.find(s => s.id === toStationId)?.name || 'Ga đến'}
                                            </h1>
                                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                                                <TrainFront className="w-4 h-4" /> Tuyến Metro số 1 (Bến Thành - Suối Tiên)
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Giá vé lượt</p>
                                            <p className="text-4xl font-bold text-[#005596]">
                                                {formatCurrency(fareResult.price)}
                                            </p>
                                            <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wide pt-2">Giá vé lượt thanh toán không dùng tiền mặt sẽ được giảm 1.000 đồng</p>
                                        </div>
                                    </div>

                                    {/* Lộ trình đi qua */}
                                    {fareResult.pathStations && fareResult.pathStations.length > 0 && (
                                        <div className="flex-1 mt-4">
                                            <h3 className="font-bold text-slate-500 flex items-center gap-2 mb-6 text-[13px] uppercase tracking-wide border-t border-slate-100 pt-6">
                                                📍 Lộ trình đi qua ({fareResult.pathStations.length} ga)
                                            </h3>

                                            <div className="relative pl-3 border-l-2 border-slate-100 space-y-6 ml-2">
                                                {fareResult.pathStations.map((s: any, idx: number) => {
                                                    const isFirst = idx === 0;
                                                    const isLast = idx === fareResult.pathStations!.length - 1;

                                                    if (isFirst) {
                                                        return (
                                                            <div key={`path-${s.id}-${idx}`} className="relative">
                                                                <div className="absolute -left-[21px] top-0.5 w-4 h-4 rounded-full bg-white border-[4px] border-[#005596] ring-4 ring-blue-50"></div>
                                                                <div className="pl-6 flex items-center gap-3">
                                                                    <span className="bg-[#005596] text-white text-[11px] font-bold px-2 py-0.5 rounded">{s.code || `Ga ${idx + 1}`}</span>
                                                                    <span className="font-bold text-[#005596]">{s.name}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (isLast) {
                                                        return (
                                                            <div key={`path-${s.id}-${idx}`} className="relative bg-red-50 -ml-3 pl-3 p-3 rounded-r-lg mt-6">
                                                                <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-white border-[4px] border-red-600 ring-4 ring-red-50"></div>
                                                                <div className="pl-6 flex items-center gap-3">
                                                                    <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">{s.code || `Ga ${idx + 1}`}</span>
                                                                    <span className="font-bold text-red-600">{s.name}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div key={`path-${s.id}-${idx}`} className="relative">
                                                            <div className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300"></div>
                                                            <div className="pl-6 flex items-center gap-3">
                                                                <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded">{s.code || `Ga ${idx + 1}`}</span>
                                                                <span className="font-medium text-slate-600">{s.name}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                                    <TrainFront className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Vui lòng chọn Ga đi và Ga đến để xem giá vé</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}