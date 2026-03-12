import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";

export async function DELETE(request: NextRequest) {
  return proxyLaravel(request, "/api/v1/profile/two-factor");
}

