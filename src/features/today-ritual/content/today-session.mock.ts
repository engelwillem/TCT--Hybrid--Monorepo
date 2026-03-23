import type { TodaySessionContent } from './today-session.types';

function buildMockDateLabel(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
}

export const todaySessionMock: TodaySessionContent = {
  userName: 'Willem',
  avatarInitial: 'W',
  dateLabel: buildMockDateLabel(),
  greeting: 'Selamat pagi',
  openingLine: 'Terimalah firman yang menuntun langkahmu hari ini.',
  verseLabel: 'Suara yang menuntun',
  verseText:
    'Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.',
  verseReference: 'Matius 11:28',
  reflectionPrompt: 'Jika anda memejamkan mata, beban apa yang ingin engkau serahkan pada TUHAN?',
  reflectionPlaceholder: 'Tuliskan isi hatimu...',
  reflectionCtaLabel: 'Amin',
  reflectionSealedLabel: 'Telah Diserahkan',
  prayerLabel: 'Doa Penutup',
  prayerText:
    'Bapa, ajarku untuk melepaskan apa yang tidak bisa kumengerti, dan memeluk damai yang Kau sediakan hari ini.',
  prayerCtaLabel: 'Amin',
  prayerCompletionLabel: 'Amin.',
  completionTitle: 'Melangkah dalam Damai',
  completionBody: 'Hari ini kamu sudah menyerahkan bebanmu dan memilih tinggal dalam kasih-Nya.',
  softProgressLabel: 'Langkah Bertumbuh',
  progressValue: 'Hari ke-3',
  tomorrowCueLabel: 'Sapaan Esok Hari',
  tomorrowCueText: 'Mengenal kasih di tengah badai.',
};
