import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

const normalizeQuarter = (value: string): string => value.replace(/^q/i, "");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; quarter: string; lessonNumber: string; dayKey: string }> },
) {
  const { year, quarter, lessonNumber, dayKey } = await params;
  return proxyLaravel(
    request,
    `/api/v1/sabbath-school/${encodeURIComponent(year)}/q${encodeURIComponent(normalizeQuarter(quarter))}/lesson/${encodeURIComponent(lessonNumber)}/${encodeURIComponent(dayKey)}`,
  );
}
