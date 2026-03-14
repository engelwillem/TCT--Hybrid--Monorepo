# VerseHub Chapter Loader Fix Report

**Tanggal:** 2026-03-15  
**Domain:** VerseHub (`/versehub/id`)  
**Fokus:** Penanganan *False Positive Logging* pada VerseHub Chapter Loader

---

## 1. Akar Masalah

Berdasarkan `VERSEHUB_CHAPTER_LOADER_AUDIT.md`, kemunculan pesan `VerseHub: Load chapter error, Error: chapter_not_found` di browser console sebenarnya adalah reaksi terhadap mekanisme *Graceful Failure* yang bekerja dengan baik (By Design).

Saat user memasukkan slug invalid:
1. Backend mengembalikan status `404 Not Found`.
2. Frontend secara eksplisit melempar `Error('chapter_not_found')` untuk membajak state render menjadi komponen error.
3. Karena `window.console.error` secara *harcoded* memanggil log untuk semua pengecualian yang tertangkap di block `catch()`, `chapter_not_found` tercetak, menciptakan ilusi atau kebisingan log (acceptable noise) seolah-olah terjadi kegagalan sistem.

Karena hal ini bukanlah *crash* atau malfungsi kode yang sesungguhnya, log error tersebut diturunkan spesifitasnya (dimute) untuk menghindari kepanikan saat proses maintenance atau auditing.

---

## 2. File yang Diubah

- `src/features/versehub/pages/VersehubReaderPage.tsx`

---

## 3. Before vs After

### Before
```typescript
        } catch (e: any) { 
            console.error("VerseHub: Load chapter error", e);
            setError(e.message);
        } finally { 
            setLoading(false); 
        }
```

### After
```typescript
        } catch (e: any) { 
            if (e.message !== 'chapter_not_found') {
                console.error("VerseHub: Load chapter error", e);
            }
            setError(e.message);
        } finally { 
            setLoading(false); 
        }
```

Perubahan ini mengecualikan _expected error_ (`chapter_not_found`) dari console logger aplikasi, namun tetap meng-set error state (`setError(e.message)`) guna mempertahankan UI "Gagal Memuat Konten" yang jujur. 

---

## 4. Manual Verification Steps

Untuk memverifikasi perubahan:
1. Reload app yang berjalan di port `9002`.
2. Buka DevTools (Console).
3. Via address bar, tuju `/versehub/id/blablabla-invalid`.
4. Anda akan melihat layar UI "Gagal Memuat Konten" beserta detail errornya. 
5. Cek di Console: **Tidak ada** logging `VerseHub: Load chapter error` yang ditampilkan lagi. 
6. Coba tutup backend port `8000` (atau putuskan koneksi). Lalu refresh page.
7. Di console kali ini **harus tetap muncul** error (`backend_unavailable`), menandakan bahwa true error (kegagalan jaringan / error backend) masih berhasil tertangkap log. 

**Hasil Akhir:** Console log menjadi bersih untuk alur invalid pencarian yang disengaja.
