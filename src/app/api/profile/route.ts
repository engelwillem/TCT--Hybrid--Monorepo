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
 * Essential for Multipart Avatar Upload (Laravel _method: PATCH pattern)
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
