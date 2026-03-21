export const TODAY_SESSION_CONTRACT_VERSION = 'today.session.v1' as const;

export interface TodaySessionApiPayloadV1 {
  contractVersion?: string;
  user?: {
    name?: string;
    avatarInitial?: string;
  };
  greeting?: string;
  dateLabel?: string;
  openingLine?: string;
  verse?: {
    label?: string;
    text?: string;
    reference?: string;
  };
  reflection?: {
    prompt?: string;
    placeholder?: string;
    ctaLabel?: string;
    sealedLabel?: string;
  };
  prayer?: {
    label?: string;
    text?: string;
    ctaLabel?: string;
    completionLabel?: string;
  };
  completion?: {
    title?: string;
    body?: string;
    softProgressLabel?: string;
    progressValue?: string;
    tomorrowCueLabel?: string;
    tomorrowCueText?: string;
  };
}

export const TODAY_SESSION_TEXT_LIMITS = {
  userName: 36,
  avatarInitial: 2,
  greeting: 22,
  dateLabel: 32,
  openingLine: 120,
  verseLabel: 26,
  verseText: 340,
  verseReference: 42,
  reflectionPrompt: 180,
  reflectionPlaceholder: 80,
  reflectionCtaLabel: 18,
  reflectionSealedLabel: 28,
  prayerLabel: 26,
  prayerText: 260,
  prayerCtaLabel: 14,
  prayerCompletionLabel: 14,
  completionTitle: 72,
  completionBody: 190,
  softProgressLabel: 40,
  progressValue: 28,
  tomorrowCueLabel: 40,
  tomorrowCueText: 120,
} as const;

export const TODAY_SESSION_BACKEND_REQUIRED_FIELDS = [
  'openingLine',
  'verse.text',
  'verse.reference',
  'reflection.prompt',
  'prayer.text',
  'completion.title',
  'completion.body',
  'completion.tomorrowCueText',
] as const;
