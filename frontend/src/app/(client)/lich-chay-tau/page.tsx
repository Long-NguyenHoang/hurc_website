import { stationService } from "@/services/station.service";
import { ticketFareService } from "@/services/ticket-fare.service";
import ScheduleClient from "./ScheduleClient";

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
    try {
        // GỌI API TỪ BACKEND CHO LỊCH CHẠY TÀU
        const scheduleRes = await stationService.getSchedule();

        // Trích xuất và sắp xếp dữ liệu Nhà ga
        let initialStations = [];
        const scheduleData = scheduleRes.data ? scheduleRes.data : scheduleRes;
        if (Array.isArray(scheduleData)) {
            initialStations = scheduleData.sort((a: any, b: any) => a.display_order - b.display_order);
        }

        let initialFares: any[] = [];

        return <ScheduleClient initialStations={initialStations} initialFares={initialFares} />;

    } catch (error) {
        console.error("Lỗi SSR trang Lịch trình:", error);
        return <ScheduleClient initialStations={[]} initialFares={[]} />;
    }
}