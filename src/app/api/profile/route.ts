import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

/**
 * Profile API Proxy
 * Supports GET (read), POST (upload/create), PATCH/PUT (update), and DELETE.
 * POST is essential for binary avatar uploads in PHP/Laravel environments
 * which use the _method spoofing pattern (sending POST with _method=PATCH).
 */
export async function GET(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

export async function POST(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

export async function PATCH(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

export async function PUT(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

export async function DELETE(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}
