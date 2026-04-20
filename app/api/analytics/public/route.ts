import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const snap = await adminDb.collection("analytics_daily").get();
    const today = new Date().toISOString().split("T")[0];
    
    let totalCount = 0;
    let todayCount = 0;

    snap.forEach((doc) => {
      const data = doc.data();
      const count = data.count || 0;
      totalCount += count;
      if (doc.id === today) {
        todayCount += count;
      }
    });

    return NextResponse.json({
      total: totalCount,
      today: todayCount,
    }, {
      headers: {
        // Cache data for 60 seconds at CDN, revalidate in background
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      }
    });
  } catch (error) {
    console.error("Public analytics API Error:", error);
    return NextResponse.json({ total: 0, today: 0 }, { status: 500 });
  }
}
