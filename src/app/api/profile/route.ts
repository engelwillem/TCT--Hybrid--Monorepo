import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

/**
 * GET Profile Data
 */
export async function GET(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

/**
 * POST Profile Update
 * Required for Multipart Avatar Upload (Laravel patterns usually use POST + _method spoofing)
 */
export async function POST(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

/**
 * PATCH Profile Data
 */
export async function PATCH(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}

/**
 * DELETE Account
 */
export async function DELETE(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile");
}
