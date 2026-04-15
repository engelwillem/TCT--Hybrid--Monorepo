export function trackAiOrchestration(event: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    // Keep local debugging lightweight; this should not affect runtime flow.
    // eslint-disable-next-line no-console
    console.debug(`[ai-orchestration] ${event}`, payload);
  }
}
