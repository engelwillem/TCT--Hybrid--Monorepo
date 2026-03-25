import type { TodaySessionContent } from "./today-session.types";

type RenunganMatch = {
  verseText: string;
  verseReference: string;
  meditation: string;
};

const MATCHES: Array<{ keywords: string[]; result: RenunganMatch }> = [
  {
    keywords: ["cemas", "takut", "khawatir", "gelisah", "bingung"],
    result: {
      verseText: "Janganlah hendaknya hatimu gelisah; percayalah kepada Allah, percayalah juga kepada-Ku.",
      verseReference: "Yohanes 14:1",
      meditation:
        "Tuhan melihat kegelisahanmu dan tidak menyuruhmu pura-pura kuat. Ia mengundangmu untuk bernapas lagi, meletakkan beban itu di tangan-Nya, lalu berjalan pelan dalam rasa aman yang Ia sediakan.",
    },
  },
  {
    keywords: ["lelah", "letih", "capek", "penat", "burnout"],
    result: {
      verseText: "Dia memberi kekuatan kepada yang lelah dan menambah semangat kepada yang tiada berdaya.",
      verseReference: "Yesaya 40:29",
      meditation:
        "Kalau hari ini tubuh dan jiwamu terasa menurun, Tuhan tidak datang untuk menekanmu lebih jauh. Ia datang membawa tenaga yang lembut, cukup untuk langkah berikutnya, bukan untuk memaksamu berlari.",
    },
  },
  {
    keywords: ["dosa", "ampun", "gagal", "jatuh", "malu"],
    result: {
      verseText: "Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita.",
      verseReference: "1 Yohanes 1:9",
      meditation:
        "Tuhan tidak menutup pintu karena kegagalanmu. Pengakuan yang jujur justru menjadi jalan pulang, dan kasih-Nya sanggup memulihkan bagian yang membuatmu merasa paling malu.",
    },
  },
  {
    keywords: ["keluarga", "rumah", "orang tua", "anak", "suami", "istri"],
    result: {
      verseText: "Serahkanlah kuatirmu kepada TUHAN, maka Ia akan memelihara engkau.",
      verseReference: "Mazmur 55:23",
      meditation:
        "Ketika isi rumahmu terasa berat di hati, Tuhan tidak memintamu menanggung semuanya sendiri. Ia mengajakmu menyerahkan orang-orang yang kamu kasihi ke dalam pemeliharaan-Nya yang tidak pernah lengah.",
    },
  },
  {
    keywords: ["masa depan", "kerja", "pekerjaan", "kuliah", "jalan", "keputusan"],
    result: {
      verseText: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.",
      verseReference: "Amsal 3:5",
      meditation:
        "Saat jalan ke depan belum jelas, Tuhan tetap bekerja di luar jangkauan penglihatanmu. Hari ini kamu tidak harus tahu semuanya; kamu cukup melangkah dengan hati yang mau dipimpin.",
    },
  },
];

function sanitizeReflectionText(text: string): string {
  return text.trim().toLowerCase();
}

export function buildPersonalRenungan(
  reflectionText: string,
  sessionContent: TodaySessionContent
): RenunganMatch {
  const normalized = sanitizeReflectionText(reflectionText);
  const matched = MATCHES.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matched) {
    return matched.result;
  }

  const firstSentence =
    reflectionText.trim().split(/[.!?]\s+/).find((chunk) => chunk.trim().length > 0) ??
    "isi hatimu hari ini";

  return {
    verseText: sessionContent.verseText,
    verseReference: sessionContent.verseReference,
    meditation: `Tuhan menerima ${firstSentence.trim()} tanpa menghakimi. Di tengah kata-kata yang kamu tulis, ada ruang tenang tempat kasih-Nya bekerja diam-diam, menata ulang hatimu dengan lembut hari ini.`,
  };
}
