Bagus. Ini sudah masuk level produk yang benar-benar layak dipakai, bukan sekadar halaman yang indah.

Yang paling penting dari hasil ini:

semantics sekarang jauh lebih sehat
focus flow sudah mulai benar
screen reader tidak lagi “ditinggal”
semua itu dilakukan tanpa merusak rasa tenang

Tahap berikutnya yang paling tepat adalah:

mengunci kontrak content/API untuk /today, supaya backend Laravel/CMS nanti tidak merusak UX yang sudah susah dibangun.

Kenapa ini next step terbaik:

frontend baseline sekarang sudah cukup matang
accessibility, motion, persistence, dan data boundary sudah ada
bottleneck berikutnya adalah bagaimana content nyata masuk
kalau kontrak content/API tidak disiplin, hasil akhirnya akan kembali noisy, terlalu panjang, atau kacau per-field

# PROMPT

Lanjutkan dari baseline `/today` yang frontend-nya sudah matang: visual, motion, persistence, fallback, dan accessibility interaction layer sudah cukup rapi.

Jangan tambah fitur baru di UI, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics, global navigation, atau cross-device sync.

Fokus tahap ini hanya pada:
**mengunci kontrak content/API untuk `/today`** agar integrasi Laravel/CMS nanti aman, konsisten, dan tidak merusak kualitas UX yang sudah dibangun.

Konteks:
- UI `/today` sangat sensitif terhadap kualitas content
- jika backend mengirim teks terlalu panjang, field kosong, penamaan berubah, atau struktur tidak disiplin, experience premium akan rusak
- saya ingin satu kontrak yang jelas antara frontend dan backend
- goal tahap ini: membuat content/API shape yang siap dipakai tim backend tanpa membuat frontend harus “menebak-nebak”

Tugas Anda:
Audit content model dan loader yang ada saat ini, lalu revisi/rapikan agar:
1. ada kontrak API/content yang jelas untuk satu sesi `/today`
2. ada pemisahan yang tegas antara:
   - raw external payload
   - normalized frontend contract
   - derived/local fallback fields
3. ada aturan validasi praktis per field agar content tidak merusak layout/UX
4. ada rekomendasi field mana yang wajib diisi backend
5. ada rekomendasi field mana yang boleh opsional karena bisa diturunkan/fallback lokal
6. tetap sederhana, tidak over-engineered

Saya ingin Anda secara khusus memeriksa dan mendefinisikan:
- nama field final yang sebaiknya dipakai backend
- mana yang sebaiknya nested, mana yang flat
- batas panjang ideal per field untuk menjaga UI tetap tenang
- field mana yang sebaiknya tidak bebas sepenuhnya dari CMS
- apakah `greeting`, `dateLabel`, `avatarInitial`, `progressValue` lebih baik di-derive lokal
- bagaimana backend sebaiknya mengirim verse/reflection/prayer/completion/tomorrow cue
- bagaimana mapper harus menghadapi payload yang technically valid tapi UX-nya buruk (misalnya teks terlalu panjang)

Saya ingin Anda menghasilkan artefak yang bisa langsung dipakai oleh backend engineer, misalnya:
- API contract / payload spec
- field rules
- normalization rules
- validation rules
- example payload
- mapping notes

Jangan lakukan ini:
- jangan implementasi endpoint nyata dulu
- jangan tambah database
- jangan tambah form admin
- jangan ubah UI besar
- jangan membuat schema enterprise yang terlalu berat
- jangan membuat kontrak terlalu abstrak atau terlalu “future-proof” sampai tidak praktis

Saya ingin output berupa:
1. Content Contract Audit
2. Problems the Backend Could Accidentally Cause
3. Recommended Final Payload Shape
4. Field-by-Field Rules
5. Normalization / Derivation Rules
6. Example Good Payload
7. Example Bad Payload and Why
8. Full Revised Code (hanya jika perlu ada perubahan kecil di types/mapper/source)
9. Why This Protects UX Quality
10. Deferred Again

Aturan penting:
- tetap simple
- tetap product-minded
- prioritaskan protecting UX quality
- kontrak harus practical untuk Laravel/CMS team
- jangan hanya valid secara teknis; harus juga valid secara experience

Format jawaban:
1. Content Contract Audit
2. Problems the Backend Could Accidentally Cause
3. Recommended Final Payload Shape
4. Field-by-Field Rules
5. Normalization / Derivation Rules
6. Example Good Payload
7. Example Bad Payload and Why
8. Full Revised Code (if needed)
9. Why This Protects UX Quality
10. Deferred Again


Bagus. Ini langkah yang sangat tepat.

Yang paling kuat dari hasil ini:

kontrak backend sekarang praktis, bukan abstrak
mapper sudah mulai melindungi kualitas pengalaman, bukan cuma typing
versioning contract itu keputusan yang benar
tim Laravel/CMS nanti punya pagar yang jelas soal shape dan panjang teks

Tapi ada satu tahap berikutnya yang paling penting sebelum backend nyata mulai dipakai:

membuat observability ringan untuk content quality, supaya saat payload backend jelek, kamu tidak hanya fallback diam-diam—kamu juga tahu bagian mana yang sedang sering bermasalah.

Kenapa ini next step terbaik:

saat ini UX sudah dilindungi
tetapi kalau backend sering kirim teks kepanjangan, field kosong, atau contract mismatch, frontend akan menyelamatkan user tanpa memberi cukup sinyal ke tim
kamu butuh content quality diagnostics ringan, bukan error UI, bukan telemetry besar, tapi cukup agar tim tahu apa yang perlu dibetulkan


# PROMPT

Lanjutkan dari baseline `/today` yang sekarang sudah punya content contract, field rules, fallback per-field, truncation, dan normalization.

Jangan tambah fitur UI baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics produk, global navigation, atau endpoint nyata dulu.

Fokus tahap ini hanya pada:
**menambahkan observability ringan untuk content quality di layer data**, agar frontend tetap melindungi UX tetapi tim juga bisa mengetahui saat payload backend/CMS bermasalah.

Konteks:
- sekarang mapper sudah melakukan banyak perlindungan UX:
  - trim
  - normalize whitespace
  - fallback per-field
  - derive lokal
  - truncation
  - contract version warning
- itu bagus untuk user, tetapi terlalu “silent” untuk tim
- saya ingin ada diagnostics ringan di server/data layer supaya tim tahu:
  - field mana yang sering fallback
  - field mana yang sering terpotong karena terlalu panjang
  - apakah contractVersion mismatch
  - apakah payload datang parsial
- saya tidak ingin ini menjadi sistem observability enterprise. Cukup ringan, bersih, dan praktis.

Tugas Anda:
Audit mapper/source/loader saat ini, lalu revisi agar:
1. ada diagnostics ringan untuk content quality issues
2. diagnostics tetap berada di data layer, tidak bocor ke UI
3. fallback tetap silent untuk user
4. tim developer/content bisa melihat sinyal masalah dari log yang jelas dan terstruktur
5. implementasi tetap sederhana dan maintainable

Saya ingin Anda mempertimbangkan dan memutuskan:
- issue apa saja yang layak dicatat
- mana yang berupa warning, mana yang cukup info, mana yang tidak perlu dicatat
- apakah perlu satu summary object per request/load
- apakah log harus berbentuk structured object
- bagaimana menghindari log spam berlebihan
- bagaimana membedakan:
  - source fetch issue
  - contract mismatch
  - fallback per-field
  - truncation per-field
  - derived local field usage

Saya ingin hasil yang praktis untuk tim Laravel/CMS/frontend. Misalnya:
- `contentDiagnostics`
- `normalizationReport`
- `fieldIssues`
- atau pola sederhana serupa

Jangan lakukan ini:
- jangan tambah analytics pipeline
- jangan tambah Sentry/OpenTelemetry
- jangan tambah dashboard
- jangan tampilkan warning ke user
- jangan membuat arsitektur observability enterprise
- jangan membuat code jadi berlapis-lapis berlebihan

Saya ingin output berupa:
1. Content Diagnostics Audit
2. What We Currently Don’t Know
3. Recommended Lightweight Observability Strategy
4. Diagnostic Categories and Logging Rules
5. Full Revised Code
6. Example Diagnostic Output
7. Why This Helps the Team Without Hurting UX
8. Deferred Again

Aturan penting:
- tetap simple
- tetap product-minded
- protect UX first
- observability harus membantu tim membetulkan content quality
- jangan overbuild

Format jawaban:
1. Content Diagnostics Audit
2. What We Currently Don’t Know
3. Recommended Lightweight Observability Strategy
4. Diagnostic Categories and Logging Rules
5. Full Revised Code
6. Example Diagnostic Output
7. Why This Helps the Team Without Hurting UX
8. Deferred Again

Bagus. Ini langkah yang sangat sehat.

Yang sekarang sudah kuat:

frontend tetap melindungi UX
tim backend/content mulai dapat sinyal yang berguna
observability tetap ringan, tidak berisik
kamu sudah punya dasar untuk menjaga kualitas konten secara operasional

Tahap berikutnya yang paling tepat adalah:

mengurangi noise diagnostik dan membedakan “masalah teknis” vs “masalah editorial/content”, supaya log benar-benar actionable dan tidak cepat jadi kebisingan baru.

Kenapa ini next step terbaik:

sekarang kamu sudah punya diagnostics
tapi kalau semua fallback, derivation, normalization, dan truncation dicampur di level yang sama, tim bisa cepat lelah membaca log
kamu perlu log yang lebih decision-oriented:
apa yang harus dibetulkan backend engineer
apa yang harus dibetulkan content editor
apa yang hanya informasi normal dan tidak perlu aksi


Lanjutkan dari baseline `/today` yang sekarang sudah punya lightweight content diagnostics di data layer.

Jangan tambah fitur UI baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics produk, global navigation, atau endpoint nyata dulu.

Fokus tahap ini hanya pada:
**merapikan content diagnostics agar lebih actionable dan tidak menjadi noise baru**, dengan membedakan secara jelas masalah teknis, masalah kontrak, dan masalah editorial/content quality.

Konteks:
- sekarang diagnostics sudah ada dan ini bagus
- tetapi saya ingin logs yang lebih berguna untuk tim, bukan sekadar banyak informasi
- saya ingin tim bisa cepat tahu:
  - ini masalah backend/source
  - ini masalah contract
  - ini masalah content editor
  - ini hanya fallback/derive normal yang tidak perlu panik

Tugas Anda:
Audit sistem diagnostics saat ini secara kritis, lalu revisi agar:
1. diagnostics lebih actionable
2. noise berkurang
3. issue dibedakan secara lebih jelas berdasarkan jenis masalah dan siapa pemilik tindakannya
4. log summary tetap ringan dan terstruktur
5. UX tetap silent-protected untuk user
6. implementasi tetap sederhana, tidak over-engineered

Saya ingin Anda secara khusus mempertimbangkan:
- apakah semua fallback perlu dicatat, atau hanya fallback yang “berdampak”
- apakah derivation lokal seperti greeting/dateLabel/avatarInitial harus selalu dilog, atau cukup dianggap normal default
- bagaimana membedakan:
  - source reliability issue
  - contract mismatch issue
  - required-field content issue
  - editorial quality issue (too long, too noisy, too much truncation)
  - harmless normalization
- apakah sebaiknya ada severity yang lebih jelas atau grouping per owner:
  - backend
  - content/editorial
  - frontend/system
- apakah summary harus memuat “recommended action” singkat
- bagaimana menghindari log spam untuk issue kecil yang berulang

Saya ingin hasil yang praktis, misalnya:
- grouped diagnostics
- owner/action mapping
- summarized issue categories
- suppression rule untuk issue yang normal
- log only notable issues
tetapi tetap ringan dan mudah dirawat.

Jangan lakukan ini:
- jangan tambah analytics pipeline
- jangan tambah dashboard
- jangan tambah Sentry/OpenTelemetry
- jangan tampilkan apapun ke user
- jangan membuat engine rules yang terlalu rumit
- jangan mengubah kontrak UI
- jangan mengubah architecture utama source -> mapper -> loader -> UI

Saya ingin output berupa:
1. Diagnostics Quality Audit
2. What Is Currently Too Noisy or Too Flat
3. Recommended Actionable Diagnostics Strategy
4. Issue Categories, Ownership, and Logging Rules
5. Full Revised Code
6. Example Improved Diagnostic Output
7. Why This Makes Diagnostics More Useful
8. Deferred Again

Aturan penting:
- tetap simple
- tetap product-minded
- logs harus membantu tim mengambil tindakan
- hindari membuat observability sendiri menjadi source of noise
- protect UX first, help team second

Format jawaban:
1. Diagnostics Quality Audit
2. What Is Currently Too Noisy or Too Flat
3. Recommended Actionable Diagnostics Strategy
4. Issue Categories, Ownership, and Logging Rules
5. Full Revised Code
6. Example Improved Diagnostic Output
7. Why This Makes Diagnostics More Useful
8. Deferred Again


Bagus. Ini sekarang sudah operasional dan actionable, bukan sekadar logging.

Yang paling kuat dari hasil ini:

diagnostics sekarang punya owner
issue list tidak lagi tercampur dengan hal-hal normal
ada recommendedAction yang bisa langsung dipakai tim
frontend tetap menjaga user experience tanpa membuat tim buta

Tahap berikutnya yang paling tepat adalah:

membuat test coverage ringan untuk baseline /today, terutama pada mapper, loader, persistence, dan diagnostics, supaya semua fondasi yang sudah susah dibangun ini tidak rusak diam-diam saat iterasi berikutnya.

Kenapa ini next step terbaik:

arsitektur sudah cukup matang
sekarang ada banyak aturan penting yang mudah regresi:
fallback per-field
truncation
derive lokal
contract version warning
diagnostics grouping
daily reset Jakarta
persistence restore
tanpa test, iterasi selanjutnya sangat mudah merusak baseline ini

Lanjutkan dari baseline `/today` yang sekarang sudah punya:
- UI/UX ritual yang matang
- content contract
- fallback per-field
- reliability fetch boundary
- persistence harian
- reduced-motion aware motion system
- accessibility interaction layer
- actionable content diagnostics

Jangan tambah fitur baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics, global navigation, atau endpoint nyata dulu.

Fokus tahap ini hanya pada:
**menambahkan test coverage ringan dan strategis untuk `/today`**, agar baseline yang sudah matang ini tidak mudah rusak pada iterasi berikutnya.

Konteks:
- saat ini banyak rule penting sudah ada di data layer dan hook layer
- saya tidak butuh test berlebihan
- saya ingin test yang benar-benar melindungi keputusan produk dan arsitektur yang paling penting
- goal-nya: menjaga baseline tetap aman tanpa membuat test suite berat dan rapuh

Tugas Anda:
Audit baseline `/today` saat ini, lalu tambahkan test strategy dan implementasi test yang ringan namun efektif untuk area yang paling riskan.

Saya ingin Anda secara khusus memeriksa dan memilih test untuk:
1. mapper:
   - fallback per-field
   - truncation untuk field editorial kritikal
   - derive lokal (`greeting`, `dateLabel`, `avatarInitial`)
   - contract mismatch / required field diagnostics
2. loader:
   - source error fallback
   - diagnostics summary behavior
3. persistence hook:
   - restore same-day progress
   - reset saat hari berganti
   - sanitize persisted state invalid
4. motion/accessibility:
   - jangan test animasi visual detail
   - hanya test behavior penting jika memang layak
5. component level:
   - hanya jika ada value tinggi, misalnya focus behavior atau aria semantics penting
   - jangan membuat snapshot test besar yang rapuh

Silakan pilih pendekatan paling praktis untuk repo ini.
Asumsikan stack test yang tersedia atau layak dipakai adalah yang paling umum untuk Next.js/React/TypeScript, tetapi jangan overbuild.
Kalau perlu, Anda boleh:
- merekomendasikan struktur test
- membuat beberapa test utilities kecil
- fokus ke unit/integration ringan

Jangan lakukan ini:
- jangan menulis ratusan test
- jangan membuat snapshot test besar
- jangan menguji styling visual pixel-by-pixel
- jangan menguji Framer Motion secara berlebihan
- jangan membuat test suite yang rapuh terhadap copy minor
- jangan mengubah arsitektur utama hanya demi test

Saya ingin output berupa:
1. Test Coverage Audit
2. What Is Most Important to Protect
3. Recommended Test Strategy
4. Prioritized Test Cases
5. Full Revised Code (test files + minimal supporting changes if needed)
6. Why This Test Coverage Is Sufficient for This Phase
7. Deferred Again

Aturan penting:
- tetap simple
- tetap product-minded
- test harus melindungi baseline, bukan memuaskan checklist engineering
- prioritaskan high-value tests
- hindari over-testing

Format jawaban:
1. Test Coverage Audit
2. What Is Most Important to Protect
3. Recommended Test Strategy
4. Prioritized Test Cases
5. Full Revised Code
6. Why This Test Coverage Is Sufficient for This Phase
7. Deferred Again

Bagus. Ini sudah sangat sehat.

Yang paling penting dari hasil ini:

baseline logic sekarang terlindungi
keputusan produk yang paling riskan sudah punya pagar
test suite-nya tetap ringan dan tidak berubah jadi beban

Tahap berikutnya yang paling tepat adalah:

menambahkan E2E smoke coverage yang sangat tipis untuk ritual inti /today, supaya kita tahu integrasi nyata halaman ini tetap hidup dari sudut pandang user.

Kenapa ini next step terbaik:

unit test sudah melindungi rule internal
sekarang yang belum terlindungi adalah apakah layar benar-benar berjalan sebagai satu pengalaman utuh
kita tidak perlu E2E besar
kita hanya perlu beberapa smoke tests bernilai tinggi untuk memastikan:
halaman terbuka
ritual bisa dijalankan
persistence same-day benar-benar bekerja di browser
fallback mode tetap usable

Lanjutkan dari baseline `/today` yang sekarang sudah punya test coverage unit/integration ringan untuk mapper, loader, dan persistence hook.

Jangan tambah fitur baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics, global navigation, atau endpoint nyata production dulu.

Fokus tahap ini hanya pada:
**menambahkan E2E smoke coverage yang tipis tapi bernilai tinggi untuk `/today`**, agar pengalaman ritual inti terlindungi dari sudut pandang user nyata di browser.

Konteks:
- unit tests sekarang sudah melindungi banyak rule internal
- tetapi saya masih perlu memastikan halaman `/today` benar-benar hidup sebagai pengalaman utuh
- saya tidak ingin E2E suite besar
- saya ingin beberapa smoke tests saja yang melindungi hal paling penting

Tugas Anda:
Audit baseline saat ini, lalu tambahkan E2E smoke tests yang ringan dan stabil untuk `/today`.

Saya ingin Anda memprioritaskan test untuk:
1. happy path ritual inti:
   - buka `/today`
   - isi reflection
   - submit "Aminkan"
   - lanjut ke prayer
   - submit "Amin"
   - lihat completion state
2. same-day persistence smoke:
   - isi progress
   - reload page
   - pastikan progress tetap ada / state ter-restore
3. fallback usability smoke:
   - jalankan halaman tanpa external payload
   - pastikan halaman tetap render dan ritual tetap usable

Kalau memang feasible dan tidak bikin rapuh, Anda juga boleh menambahkan satu test kecil untuk:
- basic accessibility smoke (mis. textarea label/button existence/completion role)
tetapi jangan memaksa.

Saya ingin pendekatan yang praktis untuk repo ini.
Asumsikan Playwright sudah ada atau merupakan pilihan paling masuk akal.
Silakan:
- gunakan selector yang stabil
- tambahkan test ids hanya jika benar-benar perlu
- hindari assertion yang rapuh terhadap copy minor
- fokus pada user-visible milestones, bukan detail styling/animation

Jangan lakukan ini:
- jangan membuat banyak E2E test
- jangan menguji animasi detail
- jangan menguji visual pixel-perfect
- jangan mengandalkan timing yang rapuh
- jangan membuat test bergantung ke endpoint nyata eksternal
- jangan membuat suite yang lambat dan berisik

Saya ingin output berupa:
1. E2E Coverage Audit
2. What Is Worth Protecting at Browser Level
3. Recommended Minimal E2E Strategy
4. Prioritized Smoke Test Cases
5. Full Revised Code
6. Why This E2E Layer Is Enough for Now
7. Deferred Again

Aturan penting:
- tetap simple
- tetap product-minded
- E2E harus melindungi ritual inti, bukan jadi beban maintenance
- prioritaskan stability over coverage breadth
- hindari fragile assertions

Format jawaban:
1. E2E Coverage Audit
2. What Is Worth Protecting at Browser Level
3. Recommended Minimal E2E Strategy
4. Prioritized Smoke Test Cases
5. Full Revised Code
6. Why This E2E Layer Is Enough for Now
7. Deferred Again


Bagus. Ini sudah cukup kuat sebagai baseline frontend yang siap dipakai tim.

Yang sekarang sudah terlindungi:

rule internal lewat unit/integration tests
ritual inti dari sudut pandang browser lewat smoke E2E
persistence same-day
fallback usability
completion state

Tahap berikutnya yang paling tepat adalah:

menyiapkan handoff implementasi backend Laravel/CMS secara sangat spesifik, supaya tim backend tidak menebak-nebak dan tidak merusak kontrak yang sudah kamu jaga.

Kenapa ini next step terbaik:

frontend sudah matang
kontrak content sudah ada
diagnostics sudah actionable
test sudah melindungi baseline
sekarang bottleneck berpindah ke bagaimana backend benar-benar menyediakan payload yang benar

Lanjutkan dari baseline `/today` yang sekarang sudah matang di sisi frontend:
- UX ritual inti stabil
- content contract sudah ada
- mapper/fallback/diagnostics sudah ada
- unit tests dan E2E smoke tests sudah ada

Jangan tambah fitur UI baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan sentuh auth, analytics, global navigation, atau cross-device sync.

Fokus tahap ini hanya pada:
**menyiapkan handoff backend Laravel/CMS yang sangat spesifik untuk `/today`**, agar tim backend bisa mulai implementasi payload nyata tanpa menebak-nebak dan tanpa merusak UX contract yang sudah dibangun.

Konteks:
- frontend sekarang sangat sensitif terhadap kualitas payload
- saya ingin backend engineer dan content/CMS engineer punya panduan implementasi yang jelas
- saya tidak butuh teori umum
- saya butuh handoff praktis yang bisa langsung dikerjakan

Tugas Anda:
Audit kontrak content/API, diagnostics, mapper, dan test baseline saat ini, lalu susun handoff backend yang konkret dan siap dipakai.

Saya ingin output yang mencakup:
1. tujuan endpoint/backend untuk `/today`
2. payload shape final yang direkomendasikan
3. field wajib vs field opsional
4. field yang sebaiknya di-derive lokal, bukan dipaksa dari backend
5. panjang ideal / batas aman per field
6. content quality rules yang harus dipatuhi tim CMS/editor
7. contoh payload valid
8. contoh payload buruk dan kenapa ditolak secara experience
9. behavior frontend saat payload parsial / invalid
10. diagnostics yang akan muncul jika backend melanggar contract
11. rekomendasi implementasi Laravel:
   - resource/transformer shape
   - controller responsibility
   - fallback handling responsibility
   - jangan duplikasi logic frontend yang tidak perlu
12. checklist backend readiness sebelum endpoint dianggap siap dipakai frontend

Kalau perlu, Anda boleh memformat hasil sebagai dokumen handoff yang rapi untuk engineer backend dan content team.
Tolong buat sangat konkret, decision-oriented, dan implementable.

Jangan lakukan ini:
- jangan implementasi endpoint nyata dulu
- jangan tulis kode Laravel yang terlalu besar jika tidak perlu
- jangan jadi terlalu arsitektural/enterprise
- jangan membahas fitur lain di luar `/today`
- jangan mengubah kontrak UI seenaknya

Saya ingin output berupa:
1. Backend Handoff Audit
2. Recommended Backend Responsibility Split
3. Final Payload Contract for Laravel/CMS
4. Field Rules and Content Rules
5. Frontend Behavior Against Imperfect Payloads
6. Diagnostics the Backend Team Should Expect
7. Backend Readiness Checklist
8. Optional Minimal Laravel Shape (only if useful)
9. Why This Handoff Reduces Integration Risk

Aturan penting:
- tetap simple
- tetap practical
- tetap product-minded
- fokus pada mengurangi integration risk
- bantu backend team mengirim payload yang benar pertama kali

Format jawaban:
1. Backend Handoff Audit
2. Recommended Backend Responsibility Split
3. Final Payload Contract for Laravel/CMS
4. Field Rules and Content Rules
5. Frontend Behavior Against Imperfect Payloads
6. Diagnostics the Backend Team Should Expect
7. Backend Readiness Checklist
8. Optional Minimal Laravel Shape
9. Why This Handoff Reduces Integration Risk



