import { NextRequest, NextResponse } from "next/server";

type GenericJson = Record<string, unknown>;

const DEFAULT_ENGLISH_BIBLE_API_BASE_URL = "https://bible-api.com";
const DEFAULT_ENGLISH_TRANSLATION = "web";

const BOOK_CODE_TO_ENGLISH: Record<string, string> = {
  kej: "Genesis", kel: "Exodus", ima: "Leviticus", bil: "Numbers", uli: "Deuteronomy",
  yos: "Joshua", hak: "Judges", rut: "Ruth", "1sam": "1 Samuel", "2sam": "2 Samuel",
  "1raj": "1 Kings", "2raj": "2 Kings", "1taw": "1 Chronicles", "2taw": "2 Chronicles",
  ezr: "Ezra", neh: "Nehemiah", est: "Esther", ayb: "Job", mzm: "Psalms", ams: "Proverbs",
  pkh: "Ecclesiastes", kid: "Song of Solomon", yes: "Isaiah", yer: "Jeremiah", rat: "Lamentations",
  yeh: "Ezekiel", dan: "Daniel", hos: "Hosea", yoe: "Joel", amo: "Amos", oba: "Obadiah",
  yun: "Jonah", mik: "Micah", nah: "Nahum", hab: "Habakkuk", zef: "Zephaniah", hag: "Haggai",
  zak: "Zechariah", mal: "Malachi", mat: "Matthew", mrk: "Mark", luk: "Luke", yoh: "John",
  kis: "Acts", rom: "Romans", "1kor": "1 Corinthians", "2kor": "2 Corinthians", gal: "Galatians",
  ef: "Ephesians", flp: "Philippians", kol: "Colossians", "1tes": "1 Thessalonians",
  "2tes": "2 Thessalonians", "1tim": "1 Timothy", "2tim": "2 Timothy", tit: "Titus",
  flm: "Philemon", ibr: "Hebrews", yak: "James", "1ptr": "1 Peter", "2ptr": "2 Peter",
  "1yoh": "1 John", "2yoh": "2 John", "3yoh": "3 John", yud: "Jude", why: "Revelation",
  gen: "Genesis", exo: "Exodus", lev: "Leviticus", num: "Numbers", deu: "Deuteronomy",
  jos: "Joshua", jdg: "Judges", "1sa": "1 Samuel", "2sa": "2 Samuel", "1ki": "1 Kings",
  "2ki": "2 Kings", "1ch": "1 Chronicles", "2ch": "2 Chronicles", job: "Job", ps: "Psalms",
  pro: "Proverbs", ecc: "Ecclesiastes", sng: "Song of Solomon", isa: "Isaiah", jer: "Jeremiah",
  lam: "Lamentations", ezk: "Ezekiel", jol: "Joel", jon: "Jonah", mic: "Micah", nam: "Nahum",
  zep: "Zephaniah", zec: "Zechariah", jhn: "John", act: "Acts", "1cor": "1 Corinthians",
  "2cor": "2 Corinthians", eph: "Ephesians", php: "Philippians", col: "Colossians",
  "1th": "1 Thessalonians", "2th": "2 Thessalonians", "1ti": "1 Timothy", "2ti": "2 Timothy",
  phm: "Philemon", heb: "Hebrews", jas: "James", "1pe": "1 Peter", "2pe": "2 Peter",
  "1jn": "1 John", "2jn": "2 John", "3jn": "3 John", jud: "Jude", rev: "Revelation",
};

function getEnglishBibleEnv() {
  const baseUrl =
    process.env.ENGLISH_BIBLE_API_BASE_URL?.trim() || DEFAULT_ENGLISH_BIBLE_API_BASE_URL;
  const translation =
    process.env.ENGLISH_BIBLE_TRANSLATION?.trim().toLowerCase() || DEFAULT_ENGLISH_TRANSLATION;
  return { baseUrl, translation };
}

export function isEnglishBibleLang(lang: string): boolean {
  return String(lang || "").trim().toLowerCase() === "en";
}

export function wantsEnglishBibleFromQuery(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get("bible_lang")?.trim().toLowerCase() === "en";
}

async function getJson(url: string): Promise<GenericJson> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`english_bible_api_http_${response.status}`);
  }
  return (await response.json()) as GenericJson;
}

function resolveEnglishBookName(codeOrName: string): string {
  const normalized = String(codeOrName || "").trim().toLowerCase();
  if (!normalized) return "";
  return BOOK_CODE_TO_ENGLISH[normalized] || codeOrName;
}

export function englishBookLabelForCode(codeOrName: string): string {
  return resolveEnglishBookName(codeOrName);
}

export function buildReferenceFromSlug(slug: string): string {
  const parts = String(slug || "").trim().split(/[-_.]/).filter(Boolean);
  const book = resolveEnglishBookName(parts[0] || "");
  const chapter = parts[1] || "";
  const verse = parts[2] || "";
  if (!book || !chapter) return String(slug || "").trim();
  return verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
}

export async function fetchEnglishPassageByReference(reference: string): Promise<GenericJson> {
  const { baseUrl, translation } = getEnglishBibleEnv();
  const safeBase = baseUrl.replace(/\/+$/, "");
  const url = `${safeBase}/${encodeURIComponent(reference)}?translation=${encodeURIComponent(translation)}`;
  return getJson(url);
}

export async function fetchEnglishVerseBySlug(slug: string): Promise<GenericJson> {
  const reference = buildReferenceFromSlug(slug);
  return fetchEnglishPassageByReference(reference);
}

export async function fetchEnglishChapter(slug: string): Promise<GenericJson> {
  const reference = buildReferenceFromSlug(slug);
  return fetchEnglishPassageByReference(reference);
}

export function englishBibleErrorResponse(error: unknown): NextResponse {
  const raw = error instanceof Error ? error.message : "unknown_error";
  const message = raw.startsWith("english_bible_api_http_")
    ? `English Bible API request failed (${raw.replace("english_bible_api_http_", "HTTP ")}).`
    : "English Bible API request failed.";
  return NextResponse.json({ message }, { status: 503 });
}

export function passthroughEnglishJson(payload: GenericJson, request?: NextRequest): NextResponse {
  return NextResponse.json(payload, {
    status: 200,
    headers: request?.headers.get("x-request-id")
      ? { "x-request-id": request.headers.get("x-request-id") as string }
      : undefined,
  });
}
