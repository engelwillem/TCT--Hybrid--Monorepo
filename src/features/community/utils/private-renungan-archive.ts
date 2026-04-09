type ArchiveMetadata = {
  bookmark_origin?: string;
  visibility?: "private_renungan_archive" | "public";
};

export function isPrivateRenunganArchive(metadata?: ArchiveMetadata | null): boolean {
  if (!metadata) return false;
  return metadata.bookmark_origin === "renungan" || metadata.visibility === "private_renungan_archive";
}
