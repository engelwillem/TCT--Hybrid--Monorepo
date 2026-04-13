/**
 * og-size-check.mjs
 * Verifies that each OG image endpoint returns:
 *   - HTTP 200
 *   - Content-Type: image/png
 *   - Content-Length < 300 000 bytes  (300 KB — WhatsApp scraper safe limit)
 *
 * Usage:
 *   node scripts/og-size-check.mjs [BASE_URL]
 *
 * Example:
 *   node scripts/og-size-check.mjs http://localhost:9002
 *   node scripts/og-size-check.mjs https://www.thechoosentalks.org
 */

const BASE_URL = process.argv[2] ?? "http://localhost:9002";

const OG_ENDPOINTS = [
  { name: "Home OG",       path: "/api/og/home" },
  { name: "Today OG",      path: "/api/og/today" },
  { name: "Share OG (scripture sample)", path: "/api/og/versehub/id/yohanes-3-16" },
];

const MAX_BYTES = 300_000; // 300 KB

let allPassed = true;

console.log(`\nOG Size Check — base: ${BASE_URL}\n${"─".repeat(52)}`);

for (const ep of OG_ENDPOINTS) {
  const url = `${BASE_URL}${ep.path}`;
  let status, contentType, bytes, error;

  try {
    const res = await fetch(url);
    status = res.status;
    contentType = res.headers.get("content-type") ?? "(none)";
    const buffer = await res.arrayBuffer();
    bytes = buffer.byteLength;
  } catch (err) {
    error = err.message;
  }

  const ok200        = status === 200;
  const okPng        = contentType?.includes("image/png") || contentType?.includes("image/");
  const okSize       = typeof bytes === "number" && bytes < MAX_BYTES;
  const pass         = !error && ok200 && okPng && okSize;

  if (!pass) allPassed = false;

  const kb = typeof bytes === "number" ? `${(bytes / 1024).toFixed(1)} KB` : "N/A";
  const icon = pass ? "✅" : "❌";

  console.log(`${icon} ${ep.name}`);
  console.log(`   URL     : ${url}`);
  console.log(`   Status  : ${status ?? "ERROR"} ${error ? `— ${error}` : ""}`);
  console.log(`   Type    : ${contentType}`);
  console.log(`   Size    : ${kb} (limit: ${MAX_BYTES / 1024} KB)`);
  if (!ok200)  console.log(`   FAIL    : HTTP status is not 200`);
  if (!okPng)  console.log(`   FAIL    : Content-Type is not an image`);
  if (!okSize) console.log(`   FAIL    : File exceeds ${MAX_BYTES / 1024} KB`);
  console.log();
}

console.log("─".repeat(52));
if (allPassed) {
  console.log("✅  All OG endpoints passed.\n");
  process.exit(0);
} else {
  console.log("❌  One or more OG endpoints FAILED. See details above.\n");
  process.exit(1);
}
