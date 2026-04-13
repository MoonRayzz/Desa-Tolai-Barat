import { NextRequest, NextResponse } from "next/server";
import { logVisit } from "@/lib/firebase/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const page = body.page || "/";

    // Ambil IP dari header (Vercel otomatis set x-forwarded-for)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Ambil User-Agent untuk deteksi Bot & Crawler (sumber traffic dari California/bot sosial media)
    const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";
    const botKeywords = [
      "bot", "crawler", "spider", "whatsapp", "telegram", 
      "vercel", "headless", "lighthouse", "postman"
    ];
    const isBot = botKeywords.some((keyword) => userAgent.includes(keyword));

    // Lewati IP lokal / development
    const isLocal =
      ip === "unknown" ||
      ip === "::1"     ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168") ||
      ip.startsWith("10.");

    // FOKUS MASALAH: Jika pengunjung adalah Dev (Local) atau Bot, BERHENTI di sini.
    // Jangan panggil logVisit agar database tetap bersih.
    if (isLocal || isBot) {
      return NextResponse.json(
        { ok: true, message: "Ignored: Localhost or Bot traffic" }, 
        { status: 200 }
      );
    }

    // --- Logika di bawah ini hanya dieksekusi untuk pengunjung MANUSIA/ORGANIK ---

    let city    = "Tidak Diketahui";
    let region  = "Tidak Diketahui";
    let country = "Indonesia";

    try {
      // ip-api.com — gratis, tidak perlu API key, 45 req/menit
      const geoRes = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,city,regionName,country&lang=id`,
        { next: { revalidate: 0 }, signal: AbortSignal.timeout(3000) }
      );
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.status === "success") {
          city    = geo.city       || "Tidak Diketahui";
          region  = geo.regionName || "Tidak Diketahui";
          country = geo.country    || "Indonesia";
        }
      }
    } catch {
      // Gagal geo → tetap log dengan nilai default
    }

    // Simpan data ke Firebase
    await logVisit({ page, city, region, country });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}