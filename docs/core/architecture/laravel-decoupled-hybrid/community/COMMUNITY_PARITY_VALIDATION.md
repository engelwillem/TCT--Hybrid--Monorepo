# Community Domain Parity Validation

**Tanggal Validasi:** 2026-03-13  
**Target:** 100% Replication of Legacy Monolith  
**Status:** READY WITH WARNINGS ⚠️

---

## 1. Route Parity
| Expectation (Legacy) | Reality (Next.js) | Status |
|---|---|---|
| `/community` page load | Standard Page Route | **PASS** |
| `/api/community/posts` | Next.js API Proxy to Laravel | **PASS** |
| `/community/posts/{id}/share` | SEO share page via Next.js | **PASS** |

---

## 2. Visual Parity
| Element | Baseline Legacy | Next.js Implementation | Status |
|---|---|---|---|
| **Card Radius** | 32px / 40px | `rounded-[32px]` / `rounded-[40px]` | **PASS** |
| **Backdrop Blur** | 18px (80% opacity) | `backdrop-blur-xl` (80% opacity) | **PASS** |
| **Typography** | Inter (Sans) / DM Serif | Synchronized via globals.css | **PASS** |
| **Color Tokens** | HSL Brand Variable | Integrated via `--brand` | **PASS** |

---

## 3. Data Parity (API-First)
| Feature | Source of Truth | Integration Type | Status |
|---|---|---|---|
| **Community Feed** | `Api/V1/Community` | Real Fetch (API Proxy) | **PASS** |
| **Featured Verse** | `Api/V1/Today` Rituals | Real Fetch (API Proxy) | **PASS** |
| **Archive Grouping** | Server-side Timestamp | Client-side Logic (Identical) | **PASS** |
| **Interaction Counts** | MySQL Aggregates | Real-time Sync from Response | **PASS** |

---

## 4. Interaction Parity
| Action | Legacy Behavior | Next.js Behavior | Status |
|---|---|---|---|
| **Tab Switching** | Instant | Framer Motion (Smooth) | **IMPROVED** |
| **Pray (Like)** | Persistent | Persistent (Real API) | **PASS** |
| **Bookmark** | Persistent | Persistent (Real API) | **PASS** |
| **Create Post** | Multipart Redirect | Multipart (Real API) | **PASS** |
| **Comments** | Nested Sheet | Flat/Simple Sheet | **WARNING**¹ |

---

## 5. Auth-Protected Behavior
| Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|
| **Logged Out Click** | Redirect to Landing | Redirect to Landing | **PASS** |
| **Auth Post** | Send Sanctum Token | Header Authorization Sent | **PASS** |
| **Session Expired** | Auto-logout on 401 | Auto-logout on 401 | **PASS** |

---

## 6. Mock & Fallback Debt (The Audit)

| Location | Description | Severity | Action |
|---|---|---|---|
| `community/mock.ts` | Still contains `MOCK_POSTS` constant. | **LOW** | Keep until Today Dashboard is fixed. |
| `TodayPage.tsx` | Today Dashboard still uses `MOCK_POSTS` for highlights. | **HIGH** | P0: Point to `/api/today` highlights. |
| `CommentsSheet.tsx` | Nested reply UI depth is limited. | **LOW** | Refine in Batch 2. |

---

## 7. Performance & Responsive Parity
- **Mobile First**: Viewport 390px (iPhone 13/14) verified. Layout is stable.
- **Loading State**: Shimmer effect matches legacy intent.
- **Empty State**: "Belum ada diskusi" message aligned with legacy copy.

---

## 8. Final Verdict: READY WITH WARNINGS ⚠️

Domain **Community** telah mencapai paritas fungsional 100% untuk alur "Read" dan "Write" inti. Data yang Anda lihat di feed adalah data nyata dari database MySQL Anda.

### **Remaining Blocker (Prioritas P0):**
- **Today Dashboard Leak**: Postingan komunitas yang muncul di dashboard `Today` masih menggunakan data palsu (`MOCK_POSTS`). Hal ini dapat membingungkan pengguna jika mereka berpindah antara tab Today dan Community.

---

## 9. Recommendation for Next Batch
1. **Fix Today Dashboard Highlights**: Segera hubungkan dashboard Today ke API highlights yang nyata.
2. **Move to VerseHub Reader**: Mulai migrasi besar untuk domain Alkitab (VerseHub) karena fondasi data dan mentor sudah siap.

*Audit Selesai. Komunitas dinyatakan aman secara teknis.*