import { describe, expect, it } from "vitest";
import { MAX_COMPOSER_TOTAL_UPLOAD_BYTES } from "../components/post-composer/types";
import { clampFilesToTotalPayload } from "./useComposerCrop";

describe("clampFilesToTotalPayload", () => {
  it("skips files that overflow the total payload limit while keeping accepted files", () => {
    const first = new File([new Uint8Array(4 * 1024 * 1024)], "first.jpg", { type: "image/jpeg" });
    const second = new File([new Uint8Array(3 * 1024 * 1024)], "second.jpg", { type: "image/jpeg" });
    const third = new File([new Uint8Array(2 * 1024 * 1024)], "third.jpg", { type: "image/jpeg" });

    const result = clampFilesToTotalPayload(
      [first, second, third],
      0,
      MAX_COMPOSER_TOTAL_UPLOAD_BYTES
    );

    expect(result.accepted.map((file) => file.name)).toEqual(["first.jpg", "second.jpg"]);
    expect(result.overflowed).toBe(true);
    expect(result.totalBytes).toBe(first.size + second.size);
  });
});
