import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const snap = await adminDb.collection("analytics_daily").get();
    const today = new Date().toISOString().split("T")[0];
    const month = today.slice(0, 7);
    
    let totalCount = 0;
    let todayCount = 0;
    let monthCount = 0;
    const todayCityMap: Record<string, number> = {};

    snap.forEach((doc) => {
      const data = doc.data();
      const count = data.count || 0;
      totalCount += count;
      
      if (doc.id === today) {
        todayCount += count;
        // Collect cities for today
        Object.entries(data.cities || {}).forEach(([c, v]) => {
          todayCityMap[c] = (todayCityMap[c] || 0) + (v as number);
        });
      }
      
      if (doc.id.startsWith(month)) {
        monthCount += count;
      }
    });

    // Exclude anomaly keywords
    const excludeKeywords = ["localhost", "development", "san jose", "santa clara", "california", "madan"];
    const sortCities = Object.entries(todayCityMap)
      .filter(([city]) => !excludeKeywords.some(k => city.toLowerCase().includes(k)))
      .sort((a, b) => b[1] - a[1]);

    const topCity = sortCities.length > 0 ? sortCities[0][0] : "-";

    return NextResponse.json({
      total: totalCount,
      today: todayCount,
      thisMonth: monthCount,
      topCity: topCity,
    }, {
      headers: {
        // Cache data for 60 seconds at CDN, revalidate in background
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      }
    });
  } catch (error) {
    console.error("Public analytics API Error:", error);
    return NextResponse.json({ total: 0, today: 0, thisMonth: 0, topCity: "-" }, { status: 500 });
  }
}
