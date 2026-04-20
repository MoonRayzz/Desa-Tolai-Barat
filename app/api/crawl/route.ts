import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return "";
}

function extractTitle(html: string): string {
  const og = extractMeta(html, "og:title");
  if (og) return og;

  const twitter = extractMeta(html, "twitter:title");
  if (twitter) return twitter;

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTag) return titleTag[1].trim();

  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].replace(/<[^>]+>/g, "").trim();

  return "";
}

function extractImage(html: string, baseUrl: string): string {
  const og = extractMeta(html, "og:image");
  if (og) return og.startsWith("http") ? og : baseUrl + og;

  const twitter = extractMeta(html, "twitter:image");
  if (twitter) return twitter.startsWith("http") ? twitter : baseUrl + twitter;

  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) {
    const src = imgMatch[1];
    if (src.startsWith("data:")) return "";
    return src.startsWith("http") ? src : baseUrl + src;
  }

  return "";
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+(class|id|style|onclick|onload|data-[^=]*)=["'][^"']*["']/gi, (match) =>
      match.replace(/(class|id|style|onclick|onload|data-[^=]*)=["'][^"']*["']/gi, "")
    );
}

function extractContent(html: string): string {
  const selectors = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class=["'][^"']*(?:article|content|post|entry|body|detail)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*id=["'][^"']*(?:content|article|post|entry)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const re of selectors) {
    const m = html.match(re);
    if (m && m[1] && m[1].length > 200) {
      return m[1];
    }
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

function stripToCleanHtml(raw: string): string {
  const allowedTags = ["p", "h1", "h2", "h3", "h4", "strong", "em", "b", "i", "ul", "ol", "li", "blockquote", "br"];
  const tagPattern  = new RegExp(
    "<(?!\\/?(" + allowedTags.join("|") + ")(?=[^a-z]|$))[^>]+>",
    "gi"
  );

  return raw
    .replace(tagPattern, " ")
    .replace(/<(p|h[1-4]|li|blockquote)[^>]*>/gi, (_, tag) => "<" + tag.toLowerCase() + ">")
    .replace(/<\/(p|h[1-4]|li|blockquote)>/gi, (_, tag) => "</" + tag.toLowerCase() + ">")
    .replace(/<(strong|em|b|i)[^>]*>/gi, (_, tag) => "<" + tag.toLowerCase() + ">")
    .replace(/<\/(strong|em|b|i)>/gi, (_, tag) => "</" + tag.toLowerCase() + ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, " ")
    .replace(/(<\/p>|<\/h[1-4]>|<\/li>)\s*(<(?:p|h[1-4]|li)>)/gi, "$1\n$2")
    .trim();
}

function extractExcerpt(cleanedContent: string): string {
  const textOnly  = cleanedContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sentences = textOnly.match(/[^.!?]+[.!?]/g) || [];
  const excerpt   = sentences.slice(0, 3).join(" ").trim();
  return excerpt.length > 20 ? excerpt.slice(0, 300) : textOnly.slice(0, 300);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const url: string = body.url?.trim();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
    }

    const urlObj  = new URL(url);
    const baseUrl = urlObj.origin;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gagal mengakses URL. Status: " + response.status },
        { status: 400 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL bukan halaman HTML." },
        { status: 400 }
      );
    }

    const rawHtml    = await response.text();
    const title      = extractTitle(rawHtml);
    const image      = extractImage(rawHtml, baseUrl);
    const cleaned    = cleanHtml(rawHtml);
    const rawContent = extractContent(cleaned);
    const content    = stripToCleanHtml(rawContent);
    const excerpt    = extractExcerpt(content);
    const slug       = generateSlug(title);

    if (!title && !content) {
      return NextResponse.json(
        { error: "Konten tidak dapat diekstrak dari halaman ini." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      title,
      slug,
      excerpt,
      content,
      coverImage: image,
      sourceUrl:  url,
      sourceDomain: urlObj.hostname,
    });
  } catch (err: any) {
    const msg = err?.message || "Terjadi kesalahan.";
    if (msg.includes("timeout") || msg.includes("abort")) {
      return NextResponse.json(
        { error: "Waktu permintaan habis. URL terlalu lambat diakses." },
        { status: 408 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}