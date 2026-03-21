import type { TodaySessionContent } from '../content/today-session.types';
import {
  TODAY_SESSION_BACKEND_REQUIRED_FIELDS,
  TODAY_SESSION_CONTRACT_VERSION,
  TODAY_SESSION_TEXT_LIMITS,
} from './today-session.contract';
import type { ContentDiagnostics, ContentFieldIssue } from './today-session.diagnostics';
import type { RawTodaySessionPayload } from './today-session.source';

const REQUIRED_FIELD_SET = new Set<string>(TODAY_SESSION_BACKEND_REQUIRED_FIELDS);

const EDITORIAL_CRITICAL_FIELDS = new Set<string>([
  'openingLine',
  'verse.text',
  'reflection.prompt',
  'prayer.text',
  'completion.title',
  'completion.body',
  'completion.tomorrowCueText',
]);

function getTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function deriveGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function deriveDateLabel(now = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(now);
}

function toTitleCase(value: string): string {
  return value.replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}

function deriveAvatarInitial(userName: string, fallback: string): string {
  const firstLetter = userName.match(/\p{L}/u)?.[0];
  return firstLetter ? firstLetter.toUpperCase() : fallback;
}

function truncateWithEllipsis(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  if (maxLength <= 1) return value.slice(0, maxLength);
  if (maxLength <= 3) return value.slice(0, maxLength);
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function getRawValueByPath(raw: RawTodaySessionPayload | null, path: string): unknown {
  if (!raw) return undefined;

  const parts = path.split('.');
  let cursor: unknown = raw;

  for (const part of parts) {
    if (typeof cursor !== 'object' || cursor === null || Array.isArray(cursor)) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[part];
  }

  return cursor;
}

function createDiagnostics(raw: RawTodaySessionPayload | null): {
  diagnostics: ContentDiagnostics;
  pushIssue: (issue: ContentFieldIssue) => void;
} {
  const missingRequiredFields = raw
    ? TODAY_SESSION_BACKEND_REQUIRED_FIELDS.filter((fieldPath) => {
        return getTrimmedString(getRawValueByPath(raw, fieldPath)) === null;
      })
    : [];

  const diagnostics: ContentDiagnostics = {
    sourceStatus: raw ? 'external' : 'fallback_only',
    contractVersionExpected: TODAY_SESSION_CONTRACT_VERSION,
    contractVersionReceived: getTrimmedString(raw?.contractVersion) ?? null,
    missingRequiredFields: [...missingRequiredFields],
    issues: [],
    metrics: {
      fallbackCount: 0,
      fallbackNotableCount: 0,
      truncationCount: 0,
      normalizationCount: 0,
      derivedCount: 0,
    },
  };

  const pushIssue = (issue: ContentFieldIssue): void => {
    diagnostics.issues.push(issue);
  };

  const hasContractMismatch =
    raw &&
    diagnostics.contractVersionReceived &&
    diagnostics.contractVersionReceived !== TODAY_SESSION_CONTRACT_VERSION;

  if (hasContractMismatch) {
    pushIssue({
      owner: 'backend',
      category: 'contract',
      severity: 'warn',
      field: 'contractVersion',
      message: `Contract version mismatch: expected ${TODAY_SESSION_CONTRACT_VERSION}`,
      recommendedAction: `Update API payload contractVersion to ${TODAY_SESSION_CONTRACT_VERSION}.`,
    });
  }

  for (const fieldPath of missingRequiredFields) {
    pushIssue({
      owner: 'backend',
      category: 'required_content',
      severity: 'warn',
      field: fieldPath,
      message: 'Required backend field is missing/empty',
      recommendedAction: `Provide non-empty value for required field "${fieldPath}".`,
    });
  }

  return { diagnostics, pushIssue };
}

function resolveString(
  field: string,
  candidate: unknown,
  fallback: string,
  maxLength: number,
  diagnostics: ContentDiagnostics,
  pushIssue: (issue: ContentFieldIssue) => void
): string {
  const candidateTrimmed = getTrimmedString(candidate);
  const usingFallback = candidateTrimmed === null;
  const raw = usingFallback ? fallback : candidateTrimmed;

  if (usingFallback) {
    diagnostics.metrics.fallbackCount += 1;
    if (diagnostics.sourceStatus === 'external' && REQUIRED_FIELD_SET.has(field)) {
      diagnostics.metrics.fallbackNotableCount += 1;
    }
  }

  const normalized = normalizeWhitespace(raw);
  if (candidateTrimmed !== null && normalized !== candidateTrimmed) {
    diagnostics.metrics.normalizationCount += 1;
  }

  const truncated = truncateWithEllipsis(normalized, maxLength);
  if (truncated !== normalized) {
    diagnostics.metrics.truncationCount += 1;
    if (EDITORIAL_CRITICAL_FIELDS.has(field)) {
      pushIssue({
        owner: 'content',
        category: 'editorial_quality',
        severity: 'warn',
        field,
        message: `Content truncated to max ${maxLength} chars`,
        recommendedAction: `Shorten "${field}" content to stay within ${maxLength} characters.`,
      });
    }
  }

  return truncated;
}

export function mapRawToTodaySessionContentWithDiagnostics(
  raw: RawTodaySessionPayload | null,
  baseContent: TodaySessionContent
): { content: TodaySessionContent; diagnostics: ContentDiagnostics } {
  const { diagnostics, pushIssue } = createDiagnostics(raw);

  const userName = resolveString(
    'user.name',
    raw?.user?.name,
    baseContent.userName,
    TODAY_SESSION_TEXT_LIMITS.userName,
    diagnostics,
    pushIssue
  );

  const rawAvatarInitial = getTrimmedString(raw?.user?.avatarInitial);
  const derivedAvatarInitial = deriveAvatarInitial(userName, baseContent.avatarInitial);
  const avatarInitial = truncateWithEllipsis(
    rawAvatarInitial ?? derivedAvatarInitial,
    TODAY_SESSION_TEXT_LIMITS.avatarInitial
  );
  if (!rawAvatarInitial) {
    diagnostics.metrics.derivedCount += 1;
  }

  const rawGreeting = getTrimmedString(raw?.greeting);
  const greeting = resolveString(
    'greeting',
    rawGreeting,
    deriveGreeting(),
    TODAY_SESSION_TEXT_LIMITS.greeting,
    diagnostics,
    pushIssue
  );
  if (!rawGreeting) {
    diagnostics.metrics.derivedCount += 1;
  }

  const rawDateLabel = getTrimmedString(raw?.dateLabel);
  const dateLabel = toTitleCase(
    resolveString(
      'dateLabel',
      rawDateLabel,
      deriveDateLabel(),
      TODAY_SESSION_TEXT_LIMITS.dateLabel,
      diagnostics,
      pushIssue
    )
  );
  if (!rawDateLabel) {
    diagnostics.metrics.derivedCount += 1;
  }

  const content: TodaySessionContent = {
    userName,
    avatarInitial,
    dateLabel,
    greeting,
    openingLine: resolveString(
      'openingLine',
      raw?.openingLine,
      baseContent.openingLine,
      TODAY_SESSION_TEXT_LIMITS.openingLine,
      diagnostics,
      pushIssue
    ),
    verseLabel: resolveString(
      'verse.label',
      raw?.verse?.label,
      baseContent.verseLabel,
      TODAY_SESSION_TEXT_LIMITS.verseLabel,
      diagnostics,
      pushIssue
    ),
    verseText: resolveString(
      'verse.text',
      raw?.verse?.text,
      baseContent.verseText,
      TODAY_SESSION_TEXT_LIMITS.verseText,
      diagnostics,
      pushIssue
    ),
    verseReference: resolveString(
      'verse.reference',
      raw?.verse?.reference,
      baseContent.verseReference,
      TODAY_SESSION_TEXT_LIMITS.verseReference,
      diagnostics,
      pushIssue
    ),
    reflectionPrompt: resolveString(
      'reflection.prompt',
      raw?.reflection?.prompt,
      baseContent.reflectionPrompt,
      TODAY_SESSION_TEXT_LIMITS.reflectionPrompt,
      diagnostics,
      pushIssue
    ),
    reflectionPlaceholder: resolveString(
      'reflection.placeholder',
      raw?.reflection?.placeholder,
      baseContent.reflectionPlaceholder,
      TODAY_SESSION_TEXT_LIMITS.reflectionPlaceholder,
      diagnostics,
      pushIssue
    ),
    reflectionCtaLabel: resolveString(
      'reflection.ctaLabel',
      raw?.reflection?.ctaLabel,
      baseContent.reflectionCtaLabel,
      TODAY_SESSION_TEXT_LIMITS.reflectionCtaLabel,
      diagnostics,
      pushIssue
    ),
    reflectionSealedLabel: resolveString(
      'reflection.sealedLabel',
      raw?.reflection?.sealedLabel,
      baseContent.reflectionSealedLabel,
      TODAY_SESSION_TEXT_LIMITS.reflectionSealedLabel,
      diagnostics,
      pushIssue
    ),
    prayerLabel: resolveString(
      'prayer.label',
      raw?.prayer?.label,
      baseContent.prayerLabel,
      TODAY_SESSION_TEXT_LIMITS.prayerLabel,
      diagnostics,
      pushIssue
    ),
    prayerText: resolveString(
      'prayer.text',
      raw?.prayer?.text,
      baseContent.prayerText,
      TODAY_SESSION_TEXT_LIMITS.prayerText,
      diagnostics,
      pushIssue
    ),
    prayerCtaLabel: resolveString(
      'prayer.ctaLabel',
      raw?.prayer?.ctaLabel,
      baseContent.prayerCtaLabel,
      TODAY_SESSION_TEXT_LIMITS.prayerCtaLabel,
      diagnostics,
      pushIssue
    ),
    prayerCompletionLabel: resolveString(
      'prayer.completionLabel',
      raw?.prayer?.completionLabel,
      baseContent.prayerCompletionLabel,
      TODAY_SESSION_TEXT_LIMITS.prayerCompletionLabel,
      diagnostics,
      pushIssue
    ),
    completionTitle: resolveString(
      'completion.title',
      raw?.completion?.title,
      baseContent.completionTitle,
      TODAY_SESSION_TEXT_LIMITS.completionTitle,
      diagnostics,
      pushIssue
    ),
    completionBody: resolveString(
      'completion.body',
      raw?.completion?.body,
      baseContent.completionBody,
      TODAY_SESSION_TEXT_LIMITS.completionBody,
      diagnostics,
      pushIssue
    ),
    softProgressLabel: resolveString(
      'completion.softProgressLabel',
      raw?.completion?.softProgressLabel,
      baseContent.softProgressLabel,
      TODAY_SESSION_TEXT_LIMITS.softProgressLabel,
      diagnostics,
      pushIssue
    ),
    progressValue: resolveString(
      'completion.progressValue',
      raw?.completion?.progressValue,
      baseContent.progressValue,
      TODAY_SESSION_TEXT_LIMITS.progressValue,
      diagnostics,
      pushIssue
    ),
    tomorrowCueLabel: resolveString(
      'completion.tomorrowCueLabel',
      raw?.completion?.tomorrowCueLabel,
      baseContent.tomorrowCueLabel,
      TODAY_SESSION_TEXT_LIMITS.tomorrowCueLabel,
      diagnostics,
      pushIssue
    ),
    tomorrowCueText: resolveString(
      'completion.tomorrowCueText',
      raw?.completion?.tomorrowCueText,
      baseContent.tomorrowCueText,
      TODAY_SESSION_TEXT_LIMITS.tomorrowCueText,
      diagnostics,
      pushIssue
    ),
  };

  return { content, diagnostics };
}

export function mapRawToTodaySessionContent(
  raw: RawTodaySessionPayload | null,
  baseContent: TodaySessionContent
): TodaySessionContent {
  return mapRawToTodaySessionContentWithDiagnostics(raw, baseContent).content;
}
