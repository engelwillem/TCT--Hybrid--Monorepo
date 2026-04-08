import type { TodaySessionContent } from "./today-session.types";

export type RenunganMatch = {
  verseText: string;
  verseReference: string;
  meditation: string;
  relatedVerses?: Array<{
    reference: string;
    text: string;
  }>;
  analysis?: {
    primary_theme?: string;
    primary_emotion?: string;
    emotional_need?: string;
    spiritual_need?: string;
    intent?: string;
    secondary_themes?: string[];
    tone?: "positive" | "negative" | "neutral" | "tender";
    intensity?: number;
    relational_context?: "longing" | "conflict" | "neutral";
  };
};

const MATCHES: Array<{ keywords: string[]; result: RenunganMatch }> = [
  {
    keywords: ["syukur", "bersyukur", "berkat", "sukacita", "puji", "bahagia", "senang"],
    result: {
      verseText: "Bersyukurlah dalam segala hal, sebab itulah yang dikehendaki Allah di dalam Kristus Yesus bagi kamu.",
      verseReference: "1 Tesalonika 5:18",
      meditation:
        "Syukurmu hari ini adalah doa yang hidup. Teruslah memandang kebaikan Tuhan dengan hati yang lembut, supaya sukacitamu tetap berakar pada kasih-Nya, bukan pada situasi yang berubah.",
    },
  },
  {
    keywords: ["rindu", "kangen", "merindukan", "jauh", "terpisah", "anak", "istri", "suami", "keluarga"],
    result: {
      verseText: "TUHAN itu dekat kepada orang-orang yang patah hati, dan Ia menyelamatkan orang-orang yang remuk jiwanya.",
      verseReference: "Mazmur 34:19",
      meditation:
        "Kerinduanmu kepada orang yang kamu kasihi adalah kasih yang tulus, dan Tuhan memahaminya sepenuhnya. Di tengah jarak, kamu boleh mempercayakan mereka ke dalam penjagaan-Nya sambil terus memelihara doa yang setia. Tuhan tetap dekat dan menumbuhkan pengharapan untuk perjumpaan pada waktu-Nya.",
    },
  },
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

export function normalizeReflectionForCache(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function cleanMeditationText(input: string): string {
  const normalized = input
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([!?.,;:]){2,}/g, "$1")
    .replace(/…|\.\.\./g, ".")
    .trim();

  if (!normalized) return normalized;
  if (/[.!?]$/.test(normalized)) return normalized;
  return `${normalized}.`;
}

function isUsableMeditationText(input: string): boolean {
  const text = cleanMeditationText(input);
  if (!text || text.length < 80) return false;
  if (/\b(dan|atau|karena|sehingga)\s*$/i.test(text)) return false;
  if (/[,:;]$/.test(text)) return false;
  return true;
}

export function buildPersonalRenunganFallback(
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

export function buildPersonalRenungan(
  reflectionText: string,
  sessionContent: TodaySessionContent
): RenunganMatch {
  return buildPersonalRenunganFallback(reflectionText, sessionContent);
}

export async function generatePersonalRenungan(
  reflectionText: string,
  sessionContent: TodaySessionContent,
  options?: { signal?: AbortSignal }
): Promise<RenunganMatch> {
  const clean = reflectionText.trim();
  if (clean.length < 3) {
    return buildPersonalRenunganFallback(reflectionText, sessionContent);
  }

  try {
    const response = await fetch("/api/renungan/personalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: options?.signal,
      body: JSON.stringify({
        text: clean,
        lang: "id",
      }),
    });

    if (!response.ok) {
      return buildPersonalRenunganFallback(reflectionText, sessionContent);
    }

    const payload = (await response.json()) as {
      data?: {
        meditation?: string;
        verse?: { text?: string; reference?: string };
        related_verses?: Array<{ text?: string; reference?: string }>;
        analysis?: RenunganMatch["analysis"];
      };
    };

    const meditation = String(payload?.data?.meditation || "").trim();
    const verseText = String(payload?.data?.verse?.text || "").trim();
    const verseReference = String(payload?.data?.verse?.reference || "").trim();

    if (!isUsableMeditationText(meditation) || !verseText || !verseReference) {
      return buildPersonalRenunganFallback(reflectionText, sessionContent);
    }

    return {
      meditation: cleanMeditationText(meditation),
      verseText,
      verseReference,
      relatedVerses: Array.isArray(payload?.data?.related_verses)
        ? payload.data.related_verses
            .map((item) => ({
              text: String(item?.text || "").trim(),
              reference: String(item?.reference || "").trim(),
            }))
            .filter((item) => Boolean(item.text && item.reference))
        : [],
      analysis: payload?.data?.analysis,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return buildPersonalRenunganFallback(reflectionText, sessionContent);
  }
}

export async function preparePersonalRenungan(
  reflectionText: string,
  sessionContent: TodaySessionContent,
  options?: { signal?: AbortSignal }
): Promise<RenunganMatch | null> {
  const clean = normalizeReflectionForCache(reflectionText);
  if (clean.length < 3) {
    return null;
  }

  const generated = await generatePersonalRenungan(clean, sessionContent, options);
  return generated;
}
