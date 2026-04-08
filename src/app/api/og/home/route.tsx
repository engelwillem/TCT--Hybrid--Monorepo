import { generateHomeOGImage } from "@/features/og/home/generate-home-og-image";

export const runtime = "edge";
export const alt = "The Chosen Talks - Renungan Harian Kristen";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export async function GET() {
  return generateHomeOGImage();
}

