# Inbox Domain Parity Validation

**Tanggal Validasi:** 2026-03-13  
**Target:** 100% Replication of Legacy Monolith  
**Status:** READY WITH WARNINGS ⚠️

---

## 1. Route Parity
| Expectation (Legacy) | Reality (Next.js) | Status |
|---|---|---|
| `/inbox` list | `src/app/inbox/page.tsx` | **PASS** |
| `/inbox/{id}` thread | `src/app/inbox/[id]/page.tsx` | **PASS** |
| `/api/v1/inbox` endpoints | Proxied via `/api/inbox/*` | **PASS** |

---

## 2. Visual Parity
| Element | Baseline Legacy | Next.js Implementation | Status |
|---|---|---|---|
| **Chat Bubbles** | 28px radius + tail logic | Identical CSS + Tailwind | **PASS** |
| **Tab System** | Primary/General/Requests | SegmentedTabs component | **PASS** |
| **Online Indicators** | Emerald dot + Last seen | Sync with real User metadata | **PASS** |
| **Typography** | Inter (Medium/Bold) | Integrated via globals.css | **PASS** |

---

## 3. Data Parity (API-First)
| Feature | Source of Truth | Integration Type | Status |
|---|---|---|---|
| **Thread Sorting** | `InboxService` (Laravel) | Real Fetch (API Proxy) | **PASS** |
| **Message History** | `direct_messages` (MySQL) | Real Fetch (API Proxy) | **PASS** |
| **Follow Relationship**| `user_follows` (MySQL) | Real Fetch (API Proxy) | **PASS** |
| **Approval State** | `approved_at` column | Handled by API middleware | **PASS** |

---

## 4. Interaction Parity
| Action | Legacy Behavior | Next.js Behavior | Status |
|---|---|---|---|
| **Send Message** | Instant + ID sync | Optimistic UI + Server Sync | **PASS** |
| **Thread Polling** | 7s interval | `setInterval` (tab visible only) | **PASS** |
| **Auto-scroll** | Scroll to bottom on load | `useRef` + `useEffect` logic | **PASS** |
| **Approve Request** | Button in Request tab | Functional in Popover & Page | **PASS** |

---

## 5. Auth-Protected Behavior
| Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|
| **Accessing Inbox** | Redirect if no token | Gated by `getAppAccessToken()` | **PASS** |
| **Token Expiry** | Auto-logout on 401 | Handled by `FirebaseAuthSync` | **PASS** |
| **Message Sender** | Verified by Sanctum | Server-side `sender_id` match | **PASS** |

---

## 6. Mock & Fallback Debt (The Audit)

Daftar hutang teknis yang tersisa:

| Location | Description | Severity | Action |
|---|---|---|---|
| `[id]/page.tsx` | Media attachments (Image icon) are non-functional. | **WARNING** (P1) | Implement `FormData` upload in chat. |
| `InboxService.php` | Polling is used instead of WebSockets. | **Acceptable** | Parity with legacy (which also polled). |
| `ChatPopover.tsx` | Message preview clipping is done on client. | **Low** | Move to server-side transformer. |

---

## 7. Verdict Final: READY WITH WARNINGS ⚠️

Domain **Inbox** telah mencapai paritas fungsional 100% untuk alur perpesanan teks. Data yang Anda lihat dan kirim adalah nyata dan tersimpan di database MySQL Anda.

### **Remaining Issues (Fix Priority P1):**
- **Media Attachment Reality**: Tombol lampiran gambar belum berfungsi. Pengguna hanya bisa mengirim pesan teks saat ini. Ini tidak menghalangi paritas teks inti tetapi membatasi fitur kaya (Rich Messaging).

---

## 8. Recommendation for Next Batch
1. **Profile & Security Hardening**: Segera implementasikan alur setup **2FA** dan **Password Update** yang nyata, karena domain Inbox sudah terbukti stabil menggunakan token Sanctum.
2. **Post-Migration Cleanup**: Jika Batch 1 (Halaman Utama) sudah selesai, kita bisa mulai menghapus folder `resources/js` di `backend-api` untuk meringankan ukuran monorepo.

*Audit Selesai. Komunikasi antar pengguna kini telah "Live".*
