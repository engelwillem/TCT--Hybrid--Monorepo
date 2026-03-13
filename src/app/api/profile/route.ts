import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function GET(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

export async function PATCH(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

/**
 * Mendukung POST untuk upload file yang menggunakan _method PATCH (Laravel pattern)
 */
export async function POST(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

export async function DELETE(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}