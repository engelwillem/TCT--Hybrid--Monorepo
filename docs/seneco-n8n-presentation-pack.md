# Seneco n8n Practical Workflow Presentation Pack

## Project Summary

Workflow name: `seneco-n8n-test`

Workflow file: `src/features/seneco-n8n-test/workflows/seneco-n8n-test.workflow.json`

Demo page: `/seneco-n8n-test-willem`

The workflow is a mock support ticket triage automation. It receives a support request, cleans messy form data, validates required fields, assigns priority and team ownership, routes the ticket through an IF/Switch decision path, and returns a structured JSON result for the frontend to display.

## Assessment Requirement Mapping

| Requirement | Implementation | Evidence to show |
|---|---|---|
| A trigger | `Webhook` node | Production webhook receives POST support ticket data |
| Data cleaning / formatting | `Clean Input Data` Code node | Trims name/message, lowercases email, uppercases department, defaults missing department/urgency |
| Condition or decision | `IF Missing Required Data?` and `Route Ticket by Priority` | Missing data goes validation path; valid data goes HIGH/MEDIUM/LOW routing |
| At least one Code node | Multiple Code nodes | Clean, validate, assign priority, summary, branch context, finalization |
| Final output | `Finalize Execution Context` -> `Respond to Webhook` | Structured JSON response with status, route, summary, traceId |
| Missing/incomplete data handling | `Build Validation Error Context` | Missing email / empty message returns `validation_error` and `missingFields` |

## Final n8n Architecture

```text
Webhook
-> Clean Input Data
-> Validate Required Fields
-> IF Missing Required Data?

TRUE / incomplete data:
-> Build Validation Error Context
-> Finalize Execution Context
-> Respond to Webhook

FALSE / valid data:
-> Assign Priority & Team
-> Generate Request Summary
-> Route Ticket by Priority
   HIGH   -> Build HIGH Priority Context
   MEDIUM -> Build MEDIUM Priority Context
   LOW    -> Build LOW Priority Context
   fallback -> Build Routing Error Context
-> Finalize Execution Context
-> Respond to Webhook
```

The final design uses one centralized finalization layer and one `Respond to Webhook` node. This keeps the canvas easy to explain and makes every branch return the same response contract.

## Tech Stack Story For Presentation

```text
Reviewer enters messy support ticket data in Next.js frontend
-> Next.js API route forwards the payload to n8n
-> n8n webhook starts the automation
-> Code nodes clean, validate, enrich, and summarize the data
-> IF/Switch nodes decide whether this is validation error, HIGH, MEDIUM, LOW, or fallback
-> n8n returns structured JSON
-> Frontend displays raw input, cleaned input, route, branch, observability, and raw response
```

This proves the frontend is not only a static form. It is a visible proof layer for the n8n automation backend.

## Mock Input Example: Messy HIGH Priority Request

Request:

```json
{
  "ticketId": "SUP-1001",
  "customerName": "  Willem Test User  ",
  "email": "WILLEM.TEST@EXAMPLE.COM ",
  "department": "Billing",
  "urgency": "HIGH",
  "message": " I was charged twice and need urgent help. "
}
```

Runtime result:

```json
{
  "status": "success",
  "stage": "FINAL_RESPONSE",
  "route": "TRIAGE/HIGH_PRIORITY",
  "priority": "HIGH",
  "assignedTeam": "Finance Support",
  "cleanedInput": {
    "customerName": "Willem Test User",
    "email": "willem.test@example.com",
    "message": "I was charged twice and need urgent help.",
    "department": "BILLING"
  },
  "validation": {
    "isValid": true,
    "missingFields": []
  },
  "finalCheckpoint": "FINALIZATION_LAYER"
}
```

What this demonstrates:

- Name and message were trimmed.
- Email was lowercased.
- Department was normalized to uppercase.
- Required fields were valid.
- Priority became `HIGH`.
- Billing/finance issue was assigned to `Finance Support`.

## Missing Data Example

Request:

```json
{
  "ticketId": "SUP-1004",
  "customerName": "Missing Email User",
  "email": "",
  "department": "Operations",
  "urgency": "MEDIUM",
  "message": "Need help checking this request."
}
```

Runtime result:

```json
{
  "status": "validation_error",
  "stage": "VALIDATION_ERROR_RESPONSE",
  "errorCode": "MISSING_REQUIRED_FIELDS",
  "route": "TRIAGE/VALIDATION_ERROR",
  "validation": {
    "isValid": false,
    "missingFields": ["email"],
    "validationMessage": "Missing required field(s): email."
  },
  "summary": "Request failed validation and requires missing field completion.",
  "finalCheckpoint": "FINALIZATION_LAYER"
}
```

What this demonstrates:

- The workflow does not fail silently.
- Missing required fields are returned explicitly.
- The frontend can show exactly what the user needs to fix.

## Runtime Evidence Snapshot

Latest direct n8n runtime check:

| Test | HTTP | Status | Stage | Route | Priority | Assigned team |
|---|---:|---|---|---|---|---|
| HIGH messy input | 200 | success | FINAL_RESPONSE | TRIAGE/HIGH_PRIORITY | HIGH | Finance Support |
| MEDIUM | 200 | success | FINAL_RESPONSE | TRIAGE/MEDIUM_PRIORITY | MEDIUM | Operations Support |
| LOW | 200 | success | FINAL_RESPONSE | TRIAGE/LOW_PRIORITY | LOW | General Support |
| Missing email | 200 | validation_error | VALIDATION_ERROR_RESPONSE | TRIAGE/VALIDATION_ERROR |  |  |
| Empty message | 200 | validation_error | VALIDATION_ERROR_RESPONSE | TRIAGE/VALIDATION_ERROR |  |  |
| Malformed shape | 200 | validation_error | VALIDATION_ERROR_RESPONSE | TRIAGE/VALIDATION_ERROR |  |  |

## Frontend Evidence To Show

Open: `http://localhost:9002/seneco-n8n-test-willem`

Recommended screenshots:

1. n8n workflow canvas showing the full node chain.
2. Frontend HIGH example showing raw messy input and cleaned output.
3. Frontend MEDIUM example showing `TRIAGE/MEDIUM_PRIORITY`.
4. Frontend LOW example showing `TRIAGE/LOW_PRIORITY`.
5. Frontend Missing Email example showing `validation_error` and `missingFields: ["email"]`.
6. Frontend Empty Message example showing `missingFields: ["message"]`.
7. Frontend Raw JSON panel showing `traceId`, `durationMs`, `finalCheckpoint`, `route`, and `validation`.

## Short Explanation Draft

I built a mock support ticket triage workflow in n8n. The workflow starts with a Webhook trigger, receives support request data, and uses Code nodes to clean and normalize the input. For example, it trims extra spaces, lowercases email addresses, uppercases departments, and defaults missing optional fields.

After cleaning, the workflow validates required fields: customer name, email, and message. If any required field is missing, the IF node routes the request to a validation error response. If the request is valid, the workflow assigns a priority and support team, generates a short request summary, and uses a Switch node to route HIGH, MEDIUM, and LOW priority tickets.

The final output is centralized through a `Finalize Execution Context` node, so every branch returns a consistent JSON response. The response includes status, route, cleaned input, validation result, priority, assigned team, summary, trace ID, and execution timing. I also connected this to a Next.js frontend so the reviewer can submit messy mock data and see the n8n automation result directly in the browser.

## What I Would Improve With More Time

- Add a real database or ticketing system step after final routing.
- Add notification steps for the assigned team.
- Add richer validation such as email format checks and duplicate ticket detection.
- Add a dashboard of historical workflow runs.
- Add environment-specific webhook configuration so local and production paths are easier to manage.
- An AI classification layer could be added to analyze customer sentiment,
detect escalation risk, and recommend support handling automatically.

## Submission Checklist

- Exported n8n workflow JSON: `src/features/seneco-n8n-test/workflows/seneco-n8n-test.workflow.json`
- Workflow canvas screenshot: capture from n8n UI.
- Running workflow screenshot: capture HIGH example from frontend.
- Missing data screenshot: capture missing email or empty message from frontend.
- Short explanation: use the draft above.
- Mock data only: yes.
- No external private systems or real client data: yes.
