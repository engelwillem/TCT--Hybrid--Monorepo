import type { FollowUpAction, SurfaceName } from "@/ai/core/contracts";

export function resolveAllowedBridgeActions(surface: SurfaceName): FollowUpAction[] {
  switch (surface) {
    case "renungan":
      return ["make_prayer", "small_step", "open_versehub", "save_draft", "done"];
    case "versehub":
      return ["make_prayer", "save_draft", "done"];
    case "community":
      return ["done"];
    default:
      return ["done"];
  }
}
