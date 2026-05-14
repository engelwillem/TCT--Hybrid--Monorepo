import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function GET(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile/notification-preferences");
}

export async function PUT(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile/notification-preferences");
}

export async function PATCH(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile/notification-preferences");
}

