# Seneco n8n Workflow

This folder contains the single self-contained n8n workflow used for the Seneco practical workflow assessment.

- Workflow file: `seneco-n8n-test.workflow.json`
- Workflow name: `seneco-n8n-test`
- Webhook path: `seneco-n8n-test-willem`
- Method: `POST`
- Response mode: `Respond to Webhook`

The workflow uses mock support ticket data only. No API keys, real customer data, or external credentials are embedded.

## Architecture

```text
Webhook
-> Clean Input Data
-> Validate Required Fields
-> IF Missing Required Data?
   -> Build Validation Error Context
   -> Finalize Execution Context
   -> Respond to Webhook
-> Assign Priority & Team
-> Generate Request Summary
-> Route Ticket by Priority
   -> Build HIGH Priority Context
   -> Finalize Execution Context
   -> Respond to Webhook
   -> Build MEDIUM Priority Context
   -> Finalize Execution Context
   -> Respond to Webhook
   -> Build LOW Priority Context
   -> Finalize Execution Context
   -> Respond to Webhook
   -> Build Routing Error Context
   -> Finalize Execution Context
   -> Respond to Webhook
```

All terminal branches converge into `Finalize Execution Context`, then a single `Respond to Webhook` node returns structured JSON.

## What It Demonstrates

- Trigger: Webhook receives a support ticket.
- Data cleaning: trims names/messages, lowercases email, uppercases department/urgency.
- Validation: checks `customerName`, `email`, and `message`.
- Decision nodes: IF routes incomplete requests, Switch routes valid requests by priority.
- Code nodes: cleaning, validation, priority/team assignment, summary, branch context, finalization.
- Final output: structured JSON with route, team, summary, traceId, duration, and debug metadata.
- Missing data handling: incomplete data returns `validation_error` with `missingFields`.

## Import Into n8n UI

1. Open n8n UI.
2. Import `src/features/seneco-n8n-test/workflows/seneco-n8n-test.workflow.json`.
3. Save the workflow.
4. Confirm the Webhook node is set to:
   - `POST`
   - path `seneco-n8n-test-willem`
   - response mode `Respond to Webhook`
5. Activate the workflow.

## Frontend Demo

- Page: `/seneco-n8n-test-willem`
- API route: `POST /api/seneco-n8n-test`
- QA runner: `npm run qa:seneco`

The frontend shows raw input, cleaned input, validation state, branch/route, observability fields, and the exact raw JSON response from n8n.

## Test Payloads

### Valid HIGH

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

Expected route: `TRIAGE/HIGH_PRIORITY`.

### Missing Email

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

Expected route: `TRIAGE/VALIDATION_ERROR`, with `missingFields` containing `email`.

## Notes

- The assessment uses one workflow JSON file only.
- Business validation and routing errors are handled inside the main workflow.
- No separate Error Trigger workflow is required for this assessment.
- A global Error Trigger workflow could be added later as a production improvement.
