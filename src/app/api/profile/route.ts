import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

/**
 * Profile API Proxy
 * Supporting standard profile management and binary avatar uploads.
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
