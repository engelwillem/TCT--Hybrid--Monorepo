import { shouldRenderVersehubReader } from "./entry-guard";

type QueryParams = Record<string, string | string[] | undefined>;

export type VersehubIdRouteResolution =
  | { kind: "render_reader" }
  | { kind: "redirect"; target: string };

export function resolveVersehubIdRoute(params: QueryParams): VersehubIdRouteResolution {
  if (shouldRenderVersehubReader(params)) {
    return { kind: "render_reader" };
  }

  const next = new URLSearchParams({
    source: "versehub",
    intent: "organic-entry",
    pane: "pendalaman-firman",
  });
  return { kind: "redirect", target: `/renungan?${next.toString()}` };
}
