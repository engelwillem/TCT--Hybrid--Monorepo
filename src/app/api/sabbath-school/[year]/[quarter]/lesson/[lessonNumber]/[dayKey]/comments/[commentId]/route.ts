import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

const normalizeQuarter = (value: string): string => value.replace(/^q/i, "");

const pathFor = (
  year: string,
  quarter: string,
  lessonNumber: string,
  dayKey: string,
  commentId: string,
): string =>
  `/api/v1/sabbath-school/${encodeURIComponent(year)}/q${encodeURIComponent(normalizeQuarter(quarter))}/lesson/${encodeURIComponent(lessonNumber)}/${encodeURIComponent(dayKey)}/comments/${encodeURIComponent(commentId)}`;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; quarter: string; lessonNumber: string; dayKey: string; commentId: string }> },
) {
  const { year, quarter, lessonNumber, dayKey, commentId } = await params;
  return proxyLaravel(request, pathFor(year, quarter, lessonNumber, dayKey, commentId));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; quarter: string; lessonNumber: string; dayKey: string; commentId: string }> },
) {
  const { year, quarter, lessonNumber, dayKey, commentId } = await params;
  return proxyLaravel(request, pathFor(year, quarter, lessonNumber, dayKey, commentId));
}
