import { todaySessionMock } from '../content/today-session.mock';
import type { TodaySessionContent } from '../content/today-session.types';
import type { ContentFieldIssue } from './today-session.diagnostics';
import { summarizeDiagnostics } from './today-session.diagnostics';
import { FetchBoundaryError } from './fetch-json';
import { mapRawToTodaySessionContentWithDiagnostics } from './today-session.mapper';
import { fetchTodaySessionRaw } from './today-session.source';

type LoadTodaySessionContentOptions = {
  previewDate?: string | null;
  forwardedHeaders?: HeadersInit;
};

export async function loadTodaySessionContent(
  options: LoadTodaySessionContentOptions = {}
): Promise<TodaySessionContent> {
  const strictIntegrationMode = process.env.TODAY_STRICT_INTEGRATION === 'true';
  const integrationTraceMode = process.env.TODAY_INTEGRATION_TRACE === 'true';

  let rawSession = null;
  let sourceIssue: ContentFieldIssue | null = null;

  try {
    rawSession = await fetchTodaySessionRaw({
      previewDate: options.previewDate,
      forwardedHeaders: options.forwardedHeaders,
    });
  } catch (error) {
    if (error instanceof FetchBoundaryError) {
      sourceIssue = {
        owner: 'backend',
        category: 'source_reliability',
        severity: 'warn',
        field: '$source',
        message: `${error.code}: ${error.message}`,
        recommendedAction: 'Check Laravel/CMS endpoint reliability, timeout, and response status.',
      };
    } else {
      sourceIssue = {
        owner: 'frontend',
        category: 'source_reliability',
        severity: 'warn',
        field: '$source',
        message: 'UNKNOWN_SOURCE_ERROR: Unexpected source error, fallback to defaults',
        recommendedAction: 'Inspect frontend loader/source for unexpected runtime errors.',
      };
    }

    rawSession = null;
  }

  const { content, diagnostics } = mapRawToTodaySessionContentWithDiagnostics(rawSession, todaySessionMock);

  if (sourceIssue) {
    diagnostics.issues.push(sourceIssue);
  } else if (diagnostics.sourceStatus === 'fallback_only') {
    diagnostics.issues.push({
      owner: 'backend',
      category: 'source_reliability',
      severity: 'info',
      field: '$source',
      message: 'No external payload available, using fallback defaults',
      recommendedAction:
        'Check Laravel API connectivity or set TODAY_V2_SESSION_ENDPOINT/TODAY_SESSION_ENDPOINT when needed.',
    });
  }

  const summary = summarizeDiagnostics(diagnostics);

  const shouldLog =
    integrationTraceMode ||
    summary.notable ||
    diagnostics.sourceStatus === 'fallback_only' ||
    diagnostics.missingRequiredFields.length > 0;

  if (shouldLog) {
    const method = summary.warnCount > 0 ? console.warn : console.info;
    method('[today] content diagnostics', {
      sourceStatus: diagnostics.sourceStatus,
      previewDateRequested: options.previewDate ?? null,
      contract: {
        expected: diagnostics.contractVersionExpected,
        received: diagnostics.contractVersionReceived,
      },
      metrics: diagnostics.metrics,
      summary,
      missingRequiredFields: diagnostics.missingRequiredFields,
      issues: diagnostics.issues.slice(0, 12),
    });
  }

  if (strictIntegrationMode) {
    const strictFailure =
      sourceIssue !== null ||
      diagnostics.sourceStatus !== 'external' ||
      summary.warnCount > 0 ||
      diagnostics.missingRequiredFields.length > 0;

    if (strictFailure) {
      throw new Error(
        `[today] strict integration check failed: sourceStatus=${diagnostics.sourceStatus}, warnCount=${summary.warnCount}, requiredMissing=${diagnostics.missingRequiredFields.length}`
      );
    }
  }

  return content;
}
