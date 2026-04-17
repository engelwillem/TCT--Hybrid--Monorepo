import { NextRequest } from "next/server";
import { proxyLaravel } from "@/lib/proxy-laravel";
import { guardSharePrepareRequest } from "@/lib/share-prepare-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const guard = guardSharePrepareRequest(request, "renungan");
  if (guard) return guard;

  const { token } = await params;
  return proxyLaravel(request, `/api/v1/renungan/share/${token}/prepare`);
}
