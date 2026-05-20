import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.QA_BASE_URL || "http://localhost:9002";
const endpoint = `${baseUrl}/api/seneco-n8n-test`;

const cases = [
  {
    name: "HIGH priority",
    expectedBranch: "HIGH_PRIORITY",
    payload: {
      ticketId: "SUP-1001",
      customerName: "  Willem Test User  ",
      email: "WILLEM.TEST@EXAMPLE.COM ",
      department: "Billing",
      urgency: "HIGH",
      message: " I was charged twice and need urgent help. ",
    },
  },
  {
    name: "MEDIUM priority",
    expectedBranch: "MEDIUM_PRIORITY",
    payload: {
      ticketId: "SUP-1002",
      customerName: "Sarah Operations",
      email: "sarah@example.com",
      department: "Operations",
      urgency: "MEDIUM",
      message: "Please review this operational request.",
    },
  },
  {
    name: "LOW priority",
    expectedBranch: "LOW_PRIORITY",
    payload: {
      ticketId: "SUP-1003",
      customerName: "Michael General",
      email: "michael@example.com",
      department: "General",
      urgency: "LOW",
      message: "I have a general question for later review.",
    },
  },
  {
    name: "Missing email",
    expectedBranch: "VALIDATION_ERROR",
    payload: {
      ticketId: "SUP-1004",
      customerName: "Missing Email User",
      email: "",
      department: "Operations",
      urgency: "MEDIUM",
      message: "Need help checking this request.",
    },
  },
  {
    name: "Empty message",
    expectedBranch: "VALIDATION_ERROR",
    payload: {
      ticketId: "SUP-1005",
      customerName: "Empty Message User",
      email: "empty@example.com",
      department: "General",
      urgency: "LOW",
      message: "   ",
    },
  },
  {
    name: "Routing fallback",
    expectedBranch: "ROUTING_ERROR_OR_LOW",
    payload: {
      ticketId: "SUP-1006",
      customerName: "Routing Error User",
      email: "routing@example.com",
      department: "Unknown",
      urgency: "ESCALATE_UNKNOWN",
      message: "This should test the routing fallback branch.",
    },
  },
  {
    name: "Malformed shape",
    expectedBranch: "VALIDATION_OR_SYSTEM_ERROR",
    payload: { unexpected: "shape" },
  },
];

function detectBranch(data) {
  const status = String(data?.status || "");
  const route = String(data?.route || "");
  if (status === "system_error" || route.includes("SYSTEM_ERROR")) return "SYSTEM_ERROR";
  if (status === "routing_error" || route.includes("ROUTING_ERROR")) return "ROUTING_ERROR";
  if (status === "validation_error" || route.includes("VALIDATION_ERROR")) return "VALIDATION_ERROR";
  if (route.includes("HIGH_PRIORITY")) return "HIGH_PRIORITY";
  if (route.includes("MEDIUM_PRIORITY")) return "MEDIUM_PRIORITY";
  if (route.includes("LOW_PRIORITY")) return "LOW_PRIORITY";
  return "UNKNOWN";
}

function passRule(expected, actual, httpStatus) {
  if (httpStatus !== 200) return false;
  if (expected === "ROUTING_ERROR_OR_LOW") return actual === "ROUTING_ERROR" || actual === "LOW_PRIORITY";
  if (expected === "VALIDATION_OR_SYSTEM_ERROR")
    return actual === "VALIDATION_ERROR" || actual === "SYSTEM_ERROR";
  return expected === actual;
}

async function run() {
  const results = [];
  for (const c of cases) {
    let httpStatus = 0;
    let response = {};
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(c.payload),
      });
      httpStatus = res.status;
      response = await res.json();
    } catch (e) {
      response = { status: "system_error", errorMessage: e instanceof Error ? e.message : "Unknown error" };
    }
    const actualBranch = detectBranch(response);
    results.push({
      testName: c.name,
      expectedBranch: c.expectedBranch,
      actualBranch,
      route: String(response?.route || ""),
      status: String(response?.status || ""),
      transport: String(response?.transport || ""),
      httpStatus,
      pass: passRule(c.expectedBranch, actualBranch, httpStatus),
      requestPayload: c.payload,
      rawResponse: response,
    });
  }

  const summary = {
    runAt: new Date().toISOString(),
    endpoint,
    total: results.length,
    pass: results.filter((r) => r.pass).length,
    fail: results.filter((r) => !r.pass).length,
    results,
  };

  const jsonPath = path.join(
    process.cwd(),
    "src/features/seneco-n8n-test/qa/seneco-n8n-qa-report.json",
  );
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  const mdPath = path.join(process.cwd(), "docs/seneco-n8n-qa-report.md");
  const lines = [
    "# Seneco n8n QA Report",
    "",
    `- Run at: ${summary.runAt}`,
    `- Endpoint: ${summary.endpoint}`,
    `- Pass: ${summary.pass}/${summary.total}`,
    "",
    "| Test | Expected | Actual | Route | Status | HTTP | Transport | Result |",
    "|---|---|---|---|---|---:|---|---|",
    ...results.map(
      (r) =>
        `| ${r.testName} | ${r.expectedBranch} | ${r.actualBranch} | ${r.route} | ${r.status} | ${r.httpStatus} | ${r.transport} | ${r.pass ? "PASS" : "FAIL"} |`,
    ),
    "",
  ];
  fs.writeFileSync(mdPath, lines.join("\n"));
  console.log(`QA report written: ${jsonPath}`);
  console.log(`QA report written: ${mdPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
