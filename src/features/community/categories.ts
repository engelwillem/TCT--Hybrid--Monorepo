export type CommunityComposerType =
  | "quote"
  | "reflection"
  | "prayer_request"
  | "testimony"
  | "user_post";

export type CommunityArchiveCategory = "all" | CommunityComposerType;

export const COMMUNITY_COMPOSER_TYPES: Array<{ value: CommunityComposerType; label: string }> = [
  { value: "quote", label: "Quotes" },
  { value: "reflection", label: "Refleksi" },
  { value: "prayer_request", label: "Permohonan Doa" },
  { value: "testimony", label: "Kesaksian" },
  { value: "user_post", label: "Curahan Hati" },
];

export const COMMUNITY_ARCHIVE_CATEGORIES: Array<{ key: CommunityArchiveCategory; label: string }> = [
  { key: "all", label: "Semua" },
  ...COMMUNITY_COMPOSER_TYPES.map((item) => ({
    key: item.value,
    label: item.label,
  })),
];
