# Test Session Log (02)

## Status Note
This file is a historical QA snapshot from the observed live session on 2026-03-22.
It should be read as evidence of runtime behavior at that moment, not as the standing deploy model definition.

| Step | Timestamp | Page / Feature | Action Performed | Observation | Result | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | 20:55 | `/` | Initial Load | Root page loads without forced redirect. | ✅ PASS | [Snapshot] |
| 13 | 22:32 | `/login` | Label Audit | Verify label fix from Codex claim. | 🔴 FAIL | Still "Buka Blokir" (not "Masuk"). |
| 14 | 22:35 | `/versehub/id` | UI Audit | Check Overlay. | 🔴 FAIL | Bottom nav visibility unchanged. |
| **15** | **22:40** | **/register** | **Final Post-Deploy Verify** | Final check for Day 1. | 🔴 FAIL | **Still 404 Not Found.** |
| **16** | **22:42** | **/login** | **Final Post-Deploy Verify** | Final check for signup mode. | 🔴 FAIL | **Signup UI mode is missing in prod.** |
| **17** | **22:45** | **/api/auth/login** | **API Verify** | Trace login submission request path. | 🔴 FAIL | **Endpoints still mismatch on live.** |

---
**FINAL DAY 1 RECOMMENDATION:**
🛑 **STRICT NO-GO**. Produksi masih menjalankan build lama. Codex telah mengkonfirmasi `main` branch berisi fix, namun rute tidak ada di `https://www.thechoosentalks.org/`. Day 2 (UX & Session) tidak dapat dimulai sebelum Day 1 (Auth) tervalidasi live.
