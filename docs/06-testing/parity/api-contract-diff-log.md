# API Contract Diff Log

## Purpose
Mencatat drift kontrak API antara local dan production, atau antara expected contract dan observed contract.

Jangan isi dengan dugaan umum. Setiap entry harus merujuk ke flow nyata.

## Status Legend
- OPEN
- VERIFIED
- BLOCKED
- NEEDS SERVER VALIDATION
- CLOSED

## Entry Template

### Entry ID
`api-diff-000`

### Date
YYYY-MM-DD

### Domain
- auth
- profile-lifecycle
- inbox-dm
- community
- today
- versehub
- relevance-layer
- journeys

### Flow
Contoh:
- login
- profile update
- inbox send message
- community create comment

### Endpoint
- Method:
- Local URL:
- Production URL:
- Proxy route (jika ada):

### Expected Contract
#### Request
- headers:
- query:
- params:
- body:

#### Response
- success status:
- success payload shape:
- validation error shape:
- auth error shape:
- not-found/forbidden shape:

### Observed Local Behavior
- status:
- payload:
- notes:

### Observed Production Behavior
- status:
- payload:
- notes:

### Diff Summary
- Jelaskan mismatch paling nyata

### Root Cause Hypothesis
- Env mismatch
- Proxy mismatch
- Backend code drift
- cPanel header/rewrite issue
- Tencent Edge runtime issue
- Unknown

### Files Potentially Involved
- backend:
- frontend:
- proxy:
- env/config:

### Verification Steps
1.
2.
3.

### Resolution
- Fixed / not fixed / pending

### Status
- OPEN
- VERIFIED
- BLOCKED
- NEEDS SERVER VALIDATION
- CLOSED

---

## Active Diff Entries
Tambahkan entry baru di bawah bagian ini dengan urutan terbaru di atas.
