# Verification: Community

## Verification Steps
1. [x] Pastikan user telah *login*.
2. [x] Tekan aksi `Like` dan *Submit Comment* pada feed *MemberPost* apa pun.
3. [x] Kirim Status Baru (*Minta Dukungan Doa*), lalu Refresh.
4. [x] Buka *Developer Console* / *Network Tab* untuk memastikan API *Status code* aman (*201 Created*).
5. [x] **Smart Composer Hydration Test:** Akses navigasi URL `/community?intent=reflection&ref=kejadian-1&text=Terang` di mana:
   - Composer komponen otomatis terekspansi/terbuka.
   - Jenis Post terinisialisasi langsung menjadi `reflection` (*Classy Quote* layout).
   - Teks bawaan ("Terang") ter-isi. 

## Status
- **PASS**: Integrasi rute URL *Smart Composer* telah selesai meraba konteks dari parameter URL (`text`, `intent`). Parameter referensi `ref` sengaja tidak dihantarkan ulang ke *createPost* backend demi menjaga kepatuhan form lawas (yang tidak mewadahi hal tersebut dalam spesifikasi).
