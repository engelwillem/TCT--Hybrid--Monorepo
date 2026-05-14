import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

type Params = { params: Promise<{ workflow: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { workflow } = await params;
  return proxyLaravel(request, `/api/v1/profile/automation/workflows/${encodeURIComponent(workflow)}/resume`);
}

