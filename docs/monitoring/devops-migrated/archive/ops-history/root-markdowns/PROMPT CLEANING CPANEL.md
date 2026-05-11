# PROMPT CPANEL CLEANING
via ssh anda coba lihat struktur cpanel, apakah sudah benar? bila ada file dan folder sampah anda bisa hapus, karena isinya hanyalah default cpanel dengan web saya saja. bila tidak ada yang sesuai dan merusak kesehatan cpanel dan web silahkan diberantas saja

1. cek struktur cPanel via SSH dulu secara menyeluruh (root home, public_html, dan folder deploy).
2. lalu hapus yang jelas sampah/duplikat tanpa menyentuh file sistem cPanel inti.
3. cleanup health checks with automatic SSH reconnect.
4. jalankan retry otomatis beberapa kali sampai masuk, lalu lanjut audit dan pembersihan.
5. bersihkan yang memang non-esensial dan berisiko jadi beban: backup SQL lama, folder backup lama di web root, repo sampah, release deploy lama/berat, dan backup .env berlebih (tetap sisakan yang penting).
6. bila cleanup selesai. lakukan health check cepat endpoint utama dan admin login untuk memastikan tidak ada dampak negatif.
7. sesudah membersihkan folder sampah utama. Jalankan satu kali lagi health-check singkat dengan command yang lebih ringan supaya dapat konfirmasi HTTP final dari server (lightweight retrying HTTP check from server after cleanup).
8.  lanjut bersihkan ~/.trash. Cek isi + ukuran dulu, lalu hapus isinya dan verifikasi ruang yang kembali. retry and complete ~/.trash cleanup despite unstable SSH connectivity. confirm ~/.trash is empty after cleanup
9. 