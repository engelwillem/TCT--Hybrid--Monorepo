import { describe, expect, it } from "vitest";
import { isPrivateRenunganArchive } from "./private-renungan-archive";

describe("isPrivateRenunganArchive", () => {
  it("returns true when bookmark origin is renungan", () => {
    expect(isPrivateRenunganArchive({ bookmark_origin: "renungan" })).toBe(true);
  });

  it("returns true when visibility is private renungan archive", () => {
    expect(isPrivateRenunganArchive({ visibility: "private_renungan_archive" })).toBe(true);
  });

  it("returns false for public/non-renungan metadata", () => {
    expect(isPrivateRenunganArchive({ visibility: "public" })).toBe(false);
    expect(isPrivateRenunganArchive({ bookmark_origin: "community" })).toBe(false);
    expect(isPrivateRenunganArchive(null)).toBe(false);
    expect(isPrivateRenunganArchive(undefined)).toBe(false);
  });
});

