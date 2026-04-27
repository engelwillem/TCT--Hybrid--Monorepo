import type { TodaySessionContent } from './today-session.types';

type DailyVerse = {
  text: string;
  reference: string;
};

const DAILY_VERSE_BANK: readonly DailyVerse[] = [
  {
    text: 'Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.',
    reference: 'Matius 11:28',
  },
  {
    text: 'TUHAN itu dekat kepada orang-orang yang patah hati, dan Ia menyelamatkan orang-orang yang remuk jiwanya.',
    reference: 'Mazmur 34:19',
  },
  {
    text: 'Janganlah hendaknya hatimu gelisah; percayalah kepada Allah, percayalah juga kepada-Ku.',
    reference: 'Yohanes 14:1',
  },
  {
    text: 'Serahkanlah kuatirmu kepada TUHAN, maka Ia akan memelihara engkau.',
    reference: 'Mazmur 55:23',
  },
  {
    text: 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.',
    reference: 'Amsal 3:5',
  },
  {
    text: 'Dia memberi kekuatan kepada yang lelah dan menambah semangat kepada yang tiada berdaya.',
    reference: 'Yesaya 40:29',
  },
  {
    text: 'Bersyukurlah dalam segala hal, sebab itulah yang dikehendaki Allah di dalam Kristus Yesus bagi kamu.',
    reference: '1 Tesalonika 5:18',
  },
  {
    text: 'Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita.',
    reference: '1 Yohanes 1:9',
  },
  {
    text: 'Kasih setia TUHAN tak berkesudahan, rahmat-Nya tidak habis-habisnya; selalu baru tiap pagi.',
    reference: 'Ratapan 3:22-23',
  },
  {
    text: 'Berbahagialah orang yang mengandalkan TUHAN, yang menaruh harapannya pada TUHAN!',
    reference: 'Yeremia 17:7',
  },
  {
    text: 'Aku sekali-kali tidak akan membiarkan engkau dan Aku sekali-kali tidak akan meninggalkan engkau.',
    reference: 'Ibrani 13:5',
  },
  {
    text: 'Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu.',
    reference: 'Yesaya 41:10',
  },
];

function toJakartaDate(value?: Date): string {
  const now = value ?? new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

function parseSessionDate(sessionDate?: string | null, now?: Date): string {
  const normalized = String(sessionDate || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  return toJakartaDate(now);
}

function daySerial(date: string): number {
  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return 0;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function pickDailyVerse(sessionDate?: string | null, now?: Date): DailyVerse {
  const date = parseSessionDate(sessionDate, now);
  const index = Math.abs(daySerial(date)) % DAILY_VERSE_BANK.length;
  return DAILY_VERSE_BANK[index];
}

function buildMockDateLabel(now?: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(now ?? new Date());
}

export function buildTodaySessionMock(options: {
  sessionDate?: string | null;
  now?: Date;
} = {}): TodaySessionContent {
  const verse = pickDailyVerse(options.sessionDate, options.now);

  return {
    userName: 'Willem',
    avatarInitial: 'W',
    dateLabel: buildMockDateLabel(options.now),
    greeting: 'Selamat pagi',
    openingLine: 'Terimalah firman yang menuntun langkahmu hari ini.',
    verseLabel: 'Firman hari ini',
    verseText: verse.text,
    verseReference: verse.reference,
    reflectionPrompt: 'Kalau kamu memejamkan mata, beban apa yang ingin kamu serahkan hari ini?',
    reflectionPlaceholder: 'Kalau ingin, tulis seperlunya dengan tenang.',
    reflectionCtaLabel: 'Doakan',
    reflectionSealedLabel: 'Telah didoakan',
    prayerLabel: 'Doa Penutup',
    prayerText:
      'Bapa, ajarku untuk melepaskan apa yang tidak bisa kumengerti, dan memeluk damai yang Kau sediakan hari ini.',
    prayerCtaLabel: 'Amin',
    prayerCompletionLabel: 'Amin.',
    completionTitle: 'Renungan hari ini selesai',
    completionBody: 'Hari ini kamu sudah menyerahkan bebanmu dan memilih tinggal dalam kasih-Nya.',
    softProgressLabel: 'Langkah bertumbuh',
    progressValue: 'Hari ke-3',
    tomorrowCueLabel: 'Sapaan esok hari',
    tomorrowCueText: 'Mengenal kasih di tengah badai.',
  };
}

export const todaySessionMock: TodaySessionContent = buildTodaySessionMock();
