# Seneco n8n QA Report

- Run at: 2026-05-20T20:17:17.869Z
- Endpoint: http://localhost:9002/api/seneco-n8n-test
- Pass: 7/7

| Test | Expected | Actual | Route | Status | HTTP | Transport | Result |
|---|---|---|---|---|---:|---|---|
| HIGH priority | HIGH_PRIORITY | HIGH_PRIORITY | TRIAGE/HIGH_PRIORITY | success | 200 | production-webhook | PASS |
| MEDIUM priority | MEDIUM_PRIORITY | MEDIUM_PRIORITY | TRIAGE/MEDIUM_PRIORITY | success | 200 | production-webhook | PASS |
| LOW priority | LOW_PRIORITY | LOW_PRIORITY | TRIAGE/LOW_PRIORITY | success | 200 | production-webhook | PASS |
| Missing email | VALIDATION_ERROR | VALIDATION_ERROR | TRIAGE/VALIDATION_ERROR | validation_error | 200 | production-webhook | PASS |
| Empty message | VALIDATION_ERROR | VALIDATION_ERROR | TRIAGE/VALIDATION_ERROR | validation_error | 200 | production-webhook | PASS |
| Routing fallback | ROUTING_ERROR_OR_LOW | LOW_PRIORITY | TRIAGE/LOW_PRIORITY | success | 200 | production-webhook | PASS |
| Malformed shape | VALIDATION_OR_SYSTEM_ERROR | VALIDATION_ERROR | TRIAGE/VALIDATION_ERROR | validation_error | 200 | production-webhook | PASS |
