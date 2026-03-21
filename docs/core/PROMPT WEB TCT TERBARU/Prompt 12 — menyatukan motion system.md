Lanjutkan dari baseline `/today-v2` yang terbaru.

Jangan tambah fitur baru, jangan sentuh auth, analytics, global navigation, backend persistence, atau data architecture utama.

Fokus tahap ini hanya pada:
**merapikan dan menyatukan motion system `/today-v2`** agar seluruh animasi, reveal, dissolve, dan transition terasa berasal dari satu bahasa desain yang konsisten, premium, dan iOS-native.

Konteks:
- visual direction sudah cukup matang
- state loading/hydration/fallback sudah lebih halus
- interaction flow sudah cukup baik
- tetapi saya ingin motion-nya terasa lebih sistematis dan terkurasi, bukan sekadar beberapa animasi bagus yang berdiri sendiri

Tugas Anda:
Audit seluruh motion yang ada saat ini, lalu revisi agar:
1. semua transition utama memakai motion language yang konsisten
2. durasi, easing, dan jarak gerak terasa harmonis
3. hydration veil, section reveal, reflection seal, prayer completion, dan completion reveal terasa satu keluarga
4. motion tetap subtle, tidak teatrikal
5. motion mendukung calmness dan premium feel
6. implementasi tetap sederhana dan maintainable

Saya ingin Anda secara kritis memeriksa:
- apakah ada terlalu banyak variasi duration/ease
- apakah ada motion yang terasa terlalu “web animation”
- apakah fade + y transition sekarang sudah terlalu repetitif atau justru belum refined
- apakah perlu satu set motion tokens/variants sederhana
- apakah section reveal dan completion reveal perlu dibedakan hirarkinya
- apakah hydration veil motion sudah sinkron dengan interaction motion lain

Silakan pilih pendekatan paling sederhana dan elegan, misalnya:
- satu file motion tokens / transition presets
- beberapa reusable variants
- konsolidasi easing curves
- konsolidasi duration scale

Jangan lakukan ini:
- jangan tambah animasi dekoratif
- jangan tambah parallax
- jangan tambah spring yang berlebihan
- jangan membuat motion terlalu banyak
- jangan mengubah struktur UX utama
- jangan mengorbankan calmness demi “wow effect”

Saya ingin output berupa:
1. Motion Audit
2. Inconsistencies in Current Motion Language
3. Recommended Motion System
4. Motion Hierarchy per Experience Layer
   - Hydration
   - Section Entry
   - Step Progression
   - Completion
5. Full Revised Code
6. Why This Feels More Cohesive and Premium
7. Deferred Again

Aturan penting:
- tetap simple
- tetap calm
- tetap iOS-native
- motion harus terasa seperti napas, bukan pertunjukan
- prioritaskan consistency over cleverness

Format jawaban:
1. Motion Audit
2. Inconsistencies in Current Motion Language
3. Recommended Motion System
4. Motion Hierarchy per Experience Layer
5. Full Revised Code
6. Why This Feels More Cohesive and Premium
7. Deferred Again


Bagus. Arah ini tepat.

Yang paling kuat:

kamu akhirnya punya motion language, bukan animasi per komponen
hierarki motion sudah mulai jelas
keputusan untuk menghapus animasi height/width itu benar
penyatuan easing curve adalah langkah yang sangat penting untuk rasa “produk mahal”

Tapi ada satu hal yang sekarang jadi tahap berikutnya paling penting:

membuat motion system ini aman untuk accessibility dan tetap terasa premium saat reduced motion aktif.

Kenapa ini next step terbaik:

motion system sudah ada
sekarang perlu dibuat lebih matang, bukan lebih ramai
produk premium iOS-like harus terasa halus juga untuk user yang:
mengaktifkan reduced motion
sensitif terhadap animasi
memakai device yang lebih lemah
ini juga akan memaksa motion system kamu jadi benar-benar sistem, bukan hanya preset cantik

Ada satu catatan jujur juga: di output tadi dia bilang “Full Revised Code”, tapi yang diberikan lebih banyak audit + desain sistem, bukan dump kode final lengkap. Itu tidak fatal, tapi berarti tahap berikut harus lebih implementatif dan spesifik.

Lanjutkan dari `/today-v2` yang motion system-nya sudah dirapikan.

Jangan tambah fitur baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics, global navigation, backend persistence, atau data architecture utama.

Fokus tahap ini hanya pada:
**membuat motion system `/today-v2` lebih matang secara accessibility dan runtime behavior**, terutama untuk reduced motion, sticky header behavior, dan performa animasi di device yang tidak sekuat flagship iPhone.

Konteks:
- motion system dasar sudah ada
- easing, duration, dan variant sudah mulai terkonsolidasi
- sekarang saya ingin motion tetap premium, tetapi juga aman, halus, dan matang untuk penggunaan nyata
- saya tidak ingin produk terasa “cantik tapi egois” terhadap user yang sensitif terhadap motion

Tugas Anda:
Audit implementasi motion saat ini secara kritis, lalu revisi agar:
1. motion system menghormati `prefers-reduced-motion`
2. reduced motion tetap terasa premium, bukan sekadar semua animasi dimatikan brutal
3. sticky header motion sinkron dengan motion language utama
4. hydration veil, section reveal, seal transition, prayer completion, dan completion reveal tetap konsisten saat reduced motion aktif maupun normal
5. performa animasi tetap aman dan ringan
6. implementasi tetap sederhana dan maintainable

Saya ingin Anda secara khusus memeriksa:
- bagaimana Framer Motion `useReducedMotion` atau pendekatan setara dipakai dengan benar
- bagian mana yang perlu full motion
- bagian mana yang cukup fade sederhana saat reduced motion aktif
- apakah sticky header perlu ikut masuk ke motion tokens/variants
- apakah hydration veil perlu perilaku khusus pada reduced motion
- apakah ada animasi yang masih berisiko terlalu berat atau terlalu terasa “web”
- apakah token motion sekarang sudah benar-benar terpakai lintas komponen, atau masih setengah inline

Silakan pilih pendekatan paling sederhana dan elegan, misalnya:
- menambah motion helper untuk reduced motion
- motion variants yang aware terhadap accessibility
- konsolidasi header motion ke token yang sama
- fallback animation behavior yang sangat halus

Jangan lakukan ini:
- jangan menambah animasi baru yang dekoratif
- jangan membuat reduced motion jadi totally dead UI
- jangan mengubah struktur UX utama
- jangan membuat abstraction motion terlalu rumit
- jangan menambah library baru
- jangan membuat animasi terlalu banyak conditional yang berantakan

Saya ingin output berupa:
1. Accessibility Motion Audit
2. Problems with Current Motion Runtime Behavior
3. Recommended Reduced-Motion Strategy
4. Motion Behavior Matrix
   - Normal Motion
   - Reduced Motion
   - Sticky Header
   - Hydration Veil
   - Step Progression
   - Completion
5. Full Revised Code
6. Why This Makes Motion More Mature and Premium
7. Deferred Again

Aturan penting:
- tetap simple
- tetap calm
- tetap iOS-native
- accessibility bukan tambahan tempelan, tapi bagian dari kualitas premium
- motion harus tetap terasa seperti napas, bahkan saat reduced motion aktif

Format jawaban:
1. Accessibility Motion Audit
2. Problems with Current Motion Runtime Behavior
3. Recommended Reduced-Motion Strategy
4. Motion Behavior Matrix
5. Full Revised Code
6. Why This Makes Motion More Mature and Premium
7. Deferred Again

Bagus. Ini sekarang sudah naik kelas dari “motion cantik” menjadi motion yang matang.

Yang paling penting dari hasil ini:

reduced motion diperlakukan sebagai bagian dari kualitas produk, bukan mode rusak
header akhirnya masuk ke bahasa motion yang sama
veil, section reveal, seal, completion mulai terasa satu keluarga
conditional motion tidak tersebar liar di banyak komponen

Tahap berikutnya yang paling tepat adalah:

menyempurnakan accessibility interaction layer — terutama focus management, keyboard flow, dan screen reader semantics.

Kenapa ini next step terbaik:

visual dan motion sudah cukup matang
sekarang produk premium ini perlu terasa berkelas juga saat dipakai secara non-visual atau non-touch
ini akan merapikan pengalaman untuk:
keyboard users
screen reader users
user yang butuh alur fokus jelas saat step baru muncul
dan ini langsung menyentuh deferred items yang tadi sudah teridentifikasi


Lanjutkan dari baseline `/today-v2` yang motion system-nya sudah matang dan reduced-motion aware.

Jangan tambah fitur baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics, global navigation, backend persistence, atau data architecture utama.

Fokus tahap ini hanya pada:
**menyempurnakan accessibility interaction layer `/today-v2`**, terutama focus management, keyboard flow, dan screen reader semantics, agar pengalaman tetap premium, tenang, dan usable untuk lebih banyak user.

Konteks:
- visual direction sudah matang
- motion system sudah lebih konsisten dan accessibility-aware
- persistence dan same-day restore sudah ada
- sekarang saya ingin accessibility bukan hanya reduced motion, tetapi juga interaksi dan semantics yang benar
- saya tidak ingin hasilnya terasa seperti “form enterprise” atau “accessibility patch”; tetap harus calm, editorial, dan iOS-native in feel

Tugas Anda:
Audit implementasi `/today-v2` saat ini secara kritis, lalu revisi agar:
1. focus flow lebih jelas saat step baru muncul
2. keyboard navigation terasa masuk akal dan tidak membingungkan
3. elemen interaktif punya semantics yang benar
4. konten yang muncul dinamis bisa dipahami oleh screen reader dengan baik
5. completion flow tetap tenang tetapi tetap terumumkan dengan benar
6. implementasi tetap sederhana dan maintainable

Saya ingin Anda secara khusus memeriksa:
- apakah textarea reflection sudah punya label/association yang tepat
- apakah tombol “Aminkan” dan “Amin” cukup jelas untuk screen reader
- apakah saat PrayCard muncul setelah reflection selesai, focus perlu dipindahkan secara halus
- apakah saat CompleteState muncul, perlu `aria-live="polite"` atau pendekatan setara
- apakah same-day restore perlu perlakuan khusus untuk focus, atau justru tidak perlu
- apakah heading hierarchy saat ini sudah sehat
- apakah sticky header punya semantics yang baik
- apakah ada bagian yang masih terlalu “visual only”

Silakan pilih pendekatan paling sederhana dan elegan.

Jangan lakukan ini:
- jangan menambah tooltip/overlay berisik
- jangan menambah banner accessibility
- jangan membuat focus berpindah-pindah agresif
- jangan mengubah struktur UX utama
- jangan membuat markup jadi terlalu verbose tanpa alasan
- jangan membuat pengalaman terasa seperti aplikasi form administratif

Saya ingin output berupa:
1. Accessibility Interaction Audit
2. Problems with Current Focus / Keyboard / Screen Reader Experience
3. Recommended Accessibility Strategy
4. Behavior Matrix
   - Keyboard Flow
   - Focus on Step Reveal
   - Screen Reader Announcements
   - Completion Announcement
   - Same-Day Restore
5. Full Revised Code
6. Why This Improves Accessibility Without Breaking Premium Feel
7. Deferred Again

Aturan penting:
- tetap simple
- tetap calm
- tetap premium
- accessibility harus menyatu dengan product quality
- prioritaskan semantic clarity dan focus calmness, bukan verbosity

Format jawaban:
1. Accessibility Interaction Audit
2. Problems with Current Focus / Keyboard / Screen Reader Experience
3. Recommended Accessibility Strategy
4. Behavior Matrix
5. Full Revised Code
6. Why This Improves Accessibility Without Breaking Premium Feel
7. Deferred Again

