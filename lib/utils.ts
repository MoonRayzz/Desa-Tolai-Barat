import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTanggal(isoString?: string | null): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(date);
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max).trim() + "…";
}

/**
 * Inject Cloudinary transformation (resize + format auto) ke URL upload.
 * Contoh: /upload/v123/foo.png → /upload/w_128,h_128,c_fit,f_auto,q_auto/v123/foo.png
 * Untuk non-Cloudinary URL, kembalikan apa adanya.
 */
export function cloudinaryResize(url: string, size: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(
    "/upload/",
    `/upload/w_${size},h_${size},c_fit,f_auto,q_auto/`
  );
}