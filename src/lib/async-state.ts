export type AsyncContractState =
  | "idle"
  | "restoring"
  | "loading"
  | "ready"
  | "fallback"
  | "retryable_error"
  | "fatal_error"
  | "submitting";

export function isAsyncBusy(state: AsyncContractState): boolean {
  return state === "restoring" || state === "loading" || state === "submitting";
}
