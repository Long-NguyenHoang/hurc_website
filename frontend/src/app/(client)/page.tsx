import { articleService } from "@/services/article.service";
import { bannerService } from "@/services/banner.service";
import { stationService } from "@/services/station.service";
import HomeClient from "./HomeClient";

export const dynamic = 'force-dynamic'; // TẮT CACHE HOÀN TOÀN ĐỂ FIX BUG

export default async function HomePage() {
  try {
    // 1. Fetch dữ liệu trực tiếp trên Server (Chạy đồng thời cả 3 API cho nhanh)
    const [bannersRes, stationsRes, articlesRes] = await Promise.all([
      bannerService.getAllPublic(),
      stationService.getContent(),
      articleService.getAllPublic({ page: 1, limit: 8 })
    ]);

    console.log("=== DEBUG SSR HOME PAGE ===");
    console.log("Banners:", bannersRes);
    console.log("Stations:", stationsRes);
    console.log("Articles:", articlesRes);
    console.log("===========================");

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
  } catch (error: any) {
    console.error("Lỗi khi fetch data trên Server Component:", error);

    // TRẢ VỀ LỖI LÊN MÀN HÌNH ĐỂ DEBUG!
    return (
      <div style={{ color: 'red', padding: '50px', background: '#fee', minHeight: '50vh' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>⚠️ LỖI KẾT NỐI NEXT.JS SERVER ĐẾN BACKEND ⚠️</h1>
        <p>Hệ thống đang gặp trục trặc khi gọi API nội bộ trong Docker.</p>
        <p><strong>URL đang gọi:</strong> {process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</p>
        <pre style={{ marginTop: '20px', whiteSpace: 'pre-wrap', background: '#fff', padding: '15px' }}>
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
      </div>
    );
  }
}