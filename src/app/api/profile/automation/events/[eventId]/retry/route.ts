import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

type Params = { params: Promise<{ eventId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxyLaravel(request, `/api/v1/profile/automation/events/${encodeURIComponent(eventId)}/retry`);
}

