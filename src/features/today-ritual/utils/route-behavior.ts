import type { RenunganEntryIntent } from "./entry-intent";

export function shouldShowDeepeningNotice(input: {
  entryIntent?: RenunganEntryIntent;
  isPrayerCompleted: boolean;
}): boolean {
  return Boolean(input.entryIntent?.shouldPrimeDeepening && !input.isPrayerCompleted);
}

export function shouldPrimeDeepeningAfterCompletion(input: {
  entryIntent?: RenunganEntryIntent;
  isPrayerCompleted: boolean;
}): boolean {
  return Boolean(input.entryIntent?.shouldPrimeDeepening && input.isPrayerCompleted);
}
