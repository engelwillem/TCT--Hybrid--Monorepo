import type { TodaySessionContent } from './today-session.types';

function buildMockDateLabel(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
}

type VerseOfDay = {
  text: string;
  reference: string;
};

const DAILY_VERSES: VerseOfDay[] = [
  {
    text: "Commit your way to the LORD; trust in Him, and He will act.",
    reference: "Psalm 37:5",
  },
  {
    text: "The steadfast love of the LORD never ceases; His mercies never come to an end.",
    reference: "Lamentations 3:22",
  },
  {
    text: "Be still, and know that I am God.",
    reference: "Psalm 46:10",
  },
  {
    text: "Cast all your anxiety on Him because He cares for you.",
    reference: "1 Peter 5:7",
  },
  {
    text: "Your word is a lamp to my feet and a light to my path.",
    reference: "Psalm 119:105",
  },
  {
    text: "Come to Me, all who labor and are heavy laden, and I will give you rest.",
    reference: "Matthew 11:28",
  },
  {
    text: "Trust in the LORD with all your heart, and do not lean on your own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    text: "My grace is sufficient for you, for My power is made perfect in weakness.",
    reference: "2 Corinthians 12:9",
  },
  {
    text: "I can do all things through Him who strengthens me.",
    reference: "Philippians 4:13",
  },
  {
    text: "The LORD is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
  },
  {
    text: "Do not fear, for I am with you; do not be dismayed, for I am your God.",
    reference: "Isaiah 41:10",
  },
  {
    text: "Let the peace of Christ rule in your hearts.",
    reference: "Colossians 3:15",
  },
];

function getDailyVerse(): VerseOfDay {
  const now = new Date();
  const todayJakarta = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const anchor = new Date("2026-05-14T00:00:00+07:00");
  const oneDayMs = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor((todayJakarta.getTime() - anchor.getTime()) / oneDayMs);
  const idx = ((dayDiff % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length;
  return DAILY_VERSES[idx];
}

const dailyVerse = getDailyVerse();

export const todaySessionMock: TodaySessionContent = {
  userName: 'Willem',
  avatarInitial: 'W',
  dateLabel: buildMockDateLabel(),
  greeting: 'Good morning',
  openingLine: "Receive God's word as your guide for today.",
  verseLabel: "Today's Verse",
  verseText: dailyVerse.text,
  verseReference: dailyVerse.reference,
  reflectionPrompt: 'If you pause for a moment, what burden do you want to entrust to God today?',
  reflectionPlaceholder: 'Write what is in your heart...',
  reflectionCtaLabel: 'Amen',
  reflectionSealedLabel: 'Entrusted in prayer',
  prayerLabel: 'Closing Prayer',
  prayerText:
    'Father, teach me to release what I cannot control and embrace the peace You provide today.',
  prayerCtaLabel: 'Amen',
  prayerCompletionLabel: 'Amen.',
  completionTitle: 'Walk in Peace',
  completionBody: "Today you entrusted your burden and chose to remain in God's love.",
  softProgressLabel: 'Growth Journey',
  progressValue: 'Day 3',
  tomorrowCueLabel: "Tomorrow's Cue",
  tomorrowCueText: 'A fresh verse and prayer will greet you tomorrow.',
};
