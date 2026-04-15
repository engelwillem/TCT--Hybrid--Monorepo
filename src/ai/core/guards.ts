import type { BridgeIntent, SurfaceName } from "./contracts";

export function isValidBridge(from: SurfaceName, to: SurfaceName, intent: BridgeIntent): boolean {
  if (from === "renungan" && to === "versehub" && intent === "clarify") return true;
  if (from === "versehub" && to === "renungan" && intent === "regulate") return true;
  if ((from === "renungan" || from === "versehub") && to === "community" && intent === "connect") return true;
  if (from === "community" && to === "renungan" && intent === "regulate") return true;
  return false;
}
