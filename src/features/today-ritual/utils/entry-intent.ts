export type RenunganEntryPane = "pendalaman-firman" | null;

export type RenunganEntryIntent = {
  source: string | null;
  intent: string | null;
  pane: RenunganEntryPane;
  shouldPrimeDeepening: boolean;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = String(raw || "").trim().toLowerCase();
  return normalized || null;
}

export function resolveRenunganEntryIntent(
  params: Record<string, string | string[] | undefined>,
): RenunganEntryIntent {
  const source = readParam(params, "source");
  const intent = readParam(params, "intent");
  const paneValue = readParam(params, "pane");
  const pane: RenunganEntryPane = paneValue === "pendalaman-firman" ? "pendalaman-firman" : null;
  const isVersehubOrganicEntry = source === "versehub" && intent === "organic-entry";

  return {
    source,
    intent,
    pane,
    shouldPrimeDeepening: pane === "pendalaman-firman" || isVersehubOrganicEntry,
  };
}
