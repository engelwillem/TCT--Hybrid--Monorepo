import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function GET(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/community/bookmark-categories");
}

export async function POST(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/community/bookmark-categories");
}

