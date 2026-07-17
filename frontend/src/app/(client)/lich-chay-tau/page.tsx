import { stationService } from "@/services/station.service";
import { ticketFareService } from "@/services/ticket-fare.service";
import ScheduleClient from "./ScheduleClient";

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
    try {
        // GỌI CÙNG LÚC 2 API TỪ BACKEND
        const [scheduleRes, fareRes] = await Promise.all([
            stationService.getSchedule(),
            ticketFareService.getAllPublic()
        ]);

        // Trích xuất và sắp xếp dữ liệu Nhà ga
        let initialStations = [];
        const scheduleData = scheduleRes.data ? scheduleRes.data : scheduleRes;
        if (Array.isArray(scheduleData)) {
            initialStations = scheduleData.sort((a, b) => a.display_order - b.display_order);
        }

        // Trích xuất và sắp xếp dữ liệu Giá vé
        let initialFares = [];
        const fareData = fareRes.data ? fareRes.data : fareRes;
        if (Array.isArray(fareData)) {
            initialFares = fareData
                .filter((fare: any) => fare.is_active !== false)
                .sort((a: any, b: any) => a.display_order - b.display_order);
        }

        return <ScheduleClient initialStations={initialStations} initialFares={initialFares} />;

    } catch (error) {
        console.error("Lỗi SSR trang Lịch trình:", error);
        return <ScheduleClient initialStations={[]} initialFares={[]} />;
    }
}