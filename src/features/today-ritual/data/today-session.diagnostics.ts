export type ContentDiagnosticOwner = 'backend' | 'content' | 'frontend';

export type ContentDiagnosticCategory =
  | 'source_reliability'
  | 'contract'
  | 'required_content'
  | 'editorial_quality';

export type ContentDiagnosticSeverity = 'info' | 'warn';
export type TodaySessionSourceStatus =
  | 'external'
  | 'external_live'
  | 'cache_stale'
  | 'fallback_only';

export interface ContentFieldIssue {
  owner: ContentDiagnosticOwner;
  category: ContentDiagnosticCategory;
  severity: ContentDiagnosticSeverity;
  field: string;
  message: string;
  recommendedAction: string;
}

export interface ContentDiagnostics {
  sourceStatus: TodaySessionSourceStatus;
  contractVersionExpected: string;
  contractVersionReceived: string | null;
  missingRequiredFields: string[];
  issues: ContentFieldIssue[];
  metrics: {
    fallbackCount: number;
    fallbackNotableCount: number;
    truncationCount: number;
    normalizationCount: number;
    derivedCount: number;
  };
}

export interface ContentDiagnosticsSummary {
  notable: boolean;
  warnCount: number;
  ownerCounts: Record<ContentDiagnosticOwner, number>;
  categoryCounts: Record<ContentDiagnosticCategory, number>;
  recommendedActions: string[];
}

export function summarizeDiagnostics(diagnostics: ContentDiagnostics): ContentDiagnosticsSummary {
  const ownerCounts: Record<ContentDiagnosticOwner, number> = {
    backend: 0,
    content: 0,
    frontend: 0,
  };

  const categoryCounts: Record<ContentDiagnosticCategory, number> = {
    source_reliability: 0,
    contract: 0,
    required_content: 0,
    editorial_quality: 0,
  };

  const recommendedActions: string[] = [];
  let warnCount = 0;

  for (const issue of diagnostics.issues) {
    ownerCounts[issue.owner] += 1;
    categoryCounts[issue.category] += 1;
    if (issue.severity === 'warn') warnCount += 1;
    if (!recommendedActions.includes(issue.recommendedAction)) {
      recommendedActions.push(issue.recommendedAction);
    }
  }

  const notable = warnCount > 0 || diagnostics.metrics.fallbackNotableCount > 0;

  return {
    notable,
    warnCount,
    ownerCounts,
    categoryCounts,
    recommendedActions,
  };
}
