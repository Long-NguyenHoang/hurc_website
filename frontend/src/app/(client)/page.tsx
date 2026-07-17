import { articleService } from "@/services/article.service";
import { bannerService } from "@/services/banner.service";
import { stationService } from "@/services/station.service";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  try {
    // 1. Fetch dữ liệu trực tiếp trên Server (Chạy đồng thời cả 3 API cho nhanh)
    const [bannersRes, stationsRes, articlesRes] = await Promise.all([
      bannerService.getAllPublic(),
      stationService.getContent(),
      articleService.getAllPublic({ page: 1, limit: 8 })
    ]);

    // 2. Trích xuất và sắp xếp Banner
    let initialBanners = [];
    const bData = bannersRes.data ? bannersRes.data : bannersRes;
    if (Array.isArray(bData)) {
      initialBanners = bData.sort((a: any, b: any) => a.display_order - b.display_order);
    }

    // 3. Trích xuất và sắp xếp Trạm ga
    let initialStations = [];
    const sData = stationsRes.data ? stationsRes.data : stationsRes;
    if (Array.isArray(sData)) {
      initialStations = sData.sort((a: any, b: any) => a.display_order - b.display_order);
    }

    // 4. Trích xuất Tin tức (tối đa 8 bài)
    let initialArticles = [];
    const aData = articlesRes.data ? articlesRes.data : articlesRes;
    initialArticles = Array.isArray(aData) ? aData : (aData.data || aData.items || []);
    initialArticles = initialArticles.slice(0, 8);

    // 5. Trả về Component Client và "mớm" sẵn dữ liệu vào
    return (
      <HomeClient
        initialBanners={initialBanners}
        initialStations={initialStations}
        initialArticles={initialArticles}
      />
    );
  } catch (error) {
    console.error("Lỗi khi fetch data trên Server Component:", error);
    // Nếu Backend có lỡ sập lúc đang nướng bánh, thì trả về mảng rỗng để không bị sập theo
    return <HomeClient initialBanners={[]} initialStations={[]} initialArticles={[]} />;
  }
}