import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

/**
 * Global Logout Proxy
 * Revokes the Sanctum token in Laravel database.
 */
export async function POST(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/auth/logout");
}
