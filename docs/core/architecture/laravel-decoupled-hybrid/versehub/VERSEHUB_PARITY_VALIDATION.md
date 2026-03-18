# VerseHub Domain Parity Validation

**Tanggal Validasi:** 2026-03-13  
**Target:** 100% Replication of Legacy Monolith  
**Status:** READY WITH WARNINGS ⚠️

---

## 1. Route Parity
| Expectation (Legacy) | Reality (Next.js) | Status |
|---|---|---|
| `/versehub/{lang}` | `src/app/versehub/[lang]/page.tsx` | **PASS** |
| `/versehub/{lang}/{ref}` | `src/app/versehub/[lang]/[slug]/page.tsx` | **PASS** |
| `/versehub/id/mat-1` (Chapter) | Handled by Unified Controller | **PASS** |
| `/versehub/id/mat-1-1` (Verse) | Handled by Unified Controller | **PASS** |

---

## 2. Visual Parity
| Element | Baseline Legacy | Next.js Implementation | Status |
|---|---|---|---|
| **Typography** | Serif (Reader) / Sans (UI) | Integrated via `globals.css` | **PASS** |
| **Header Backdrop** | Blur (18px) + Border-b | `backdrop-blur-xl` + `border-b` | **PASS** |
| **Progress Bar** | Top sticky line (Slate-600) | `bg-brand` transition-all | **PASS** |
| **Radius** | 24px (Input) / 32px (Cards) | Aligned with Legacy Tokens | **PASS** |

---

## 3. Data Parity (API-First)
| Feature | Source of Truth | Integration Type | Status |
|---|---|---|---|
| **Book List** | `Api/V1/VerseHub/Books` | Real Fetch | **PASS** |
| **Chapter Content** | `Api/V1/VerseHub/Chapter` | Real Fetch | **PASS** |
| **Verse Actions** | `user_verse_actions` (MySQL) | Persistent (Proxy API) | **PASS** |
| **Verse Share Data** | `Api/V1/VerseHub/Verse` | **MOCK (setTimeout)** | **BLOCKER** |

---

## 4. Interaction Parity
| Action | Legacy Behavior | Next.js Behavior | Status |
|---|---|---|---|
| **Mobile Menu** | Long-press (800ms) | `onPointerDown` timer | **PASS** |
| **Haptic Feedback** | Light vibrate on tap | `triggerHaptic('light')` | **PASS** |
| **Scroll Progress** | Sync with Verse number | `IntersectionObserver` logic | **PASS** |
| **Search Suggest** | Local-feel autocomplete | API fetch (180ms delay) | **PASS** |

---

## 5. Mentor Panel Parity (Scripture Guide)
| Tab | Expected Content | Status |
|---|---|---|
| **Refleksi** | Dynamic Questions from Service | **PASS** |
| **Kaitan** | Theme & Cross-ref Mappings | **PASS** |
| **Konteks** | Historical Context Snippet | **PASS** |
| **Tanya** | AI Ask Flow (Bearer Auth) | **PASS** |
| **Teologi** | Denominational Perspectives | **PASS** |

---

## 6. Deep-link & State Parity
- **Hash Scroll**: Visiting a URL with `#v16` correctly scrolls to and highlights the target verse. **PASS**.
- **Last Read**: LocalStorage sync for "Lanjutkan Membaca" matches legacy logic. **PASS**.

---

## 7. Mock & Fallback Debt (The Audit)

| Location | Description | Severity | Action |
|---|---|---|---|
| `[slug]/page.tsx` | Verse share view uses `setTimeout` instead of fetching real verse text. | **BLOCKER** | P0: Integrate `ApiPost` for single verse. |
| `[slug]/page.tsx` | Like/Bookmark counts are hardcoded (124/37). | **HIGH** | P0: Pull real stats from MySQL. |
| `MentorPanel.tsx` | `relationships` are currently simple links. | **LOW** | Refine UI in Batch 2. |

---

## 8. Responsive Parity Minimum
- **Mobile (390px)**: Floating bottom nav and sticky progress are stable.
- **Desktop (1024px)**: Sidebar navigation and multi-column layout match legacy intent.

---

## 9. Final Verdict: READY WITH WARNINGS ⚠️

Domain **VerseHub** telah mencapai paritas visual 100%. Namun, fitur **Verse Share** (ketika pengguna membagikan 1 ayat spesifik) masih menggunakan data palsu di dalam kode. Ini harus segera diperbaiki agar fitur sharing di media sosial tidak menampilkan teks dummy.

### **Remaining Blocker (Prioritas P0):**
- **Verse Share Reality**: Reintegrasi `[slug]/page.tsx` untuk mengambil rincian ayat dari API backend sesungguhnya.

---

## 10. Recommendation for Next Steps
1. **Fix Verse Share Mock**: Segera hubungkan halaman detail ayat ke API Laravel.
2. **Move to Inbox/DM**: Mulai migrasi domain pesan karena fondasi Auth dan Follow sudah siap.

*Audit Selesai. Struktur Reader dinyatakan aman, rincian Share perlu hardening.*
