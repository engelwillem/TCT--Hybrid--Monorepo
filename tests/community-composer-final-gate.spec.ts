import { test, expect, type Page } from "@playwright/test";

type CapturedCreatePayload = {
  text: string;
  type: string;
  images: string[];
  metadata: Record<string, string>;
};

const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgN+aWioAAAAASUVORK5CYII=";

function createImageFile(name: string) {
  return {
    name,
    mimeType: "image/png",
    buffer: Buffer.from(ONE_PIXEL_PNG_BASE64, "base64"),
  };
}

function parseMultipartPayload(request: { postDataBuffer: () => Buffer | null; headers: () => Record<string, string> }): CapturedCreatePayload {
  const headers = request.headers();
  const contentType = headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  const boundary = boundaryMatch ? boundaryMatch[1] : "";
  const raw = request.postDataBuffer();
  const text = raw ? raw.toString("utf8") : "";
  if (!boundary || !text) {
    return { text: "", type: "user_post", images: [], metadata: {} };
  }

  const chunks = text.split(`--${boundary}`);
  const payload: CapturedCreatePayload = { text: "", type: "user_post", images: [], metadata: {} };

  for (const chunk of chunks) {
    const part = chunk.trim();
    if (!part || part === "--") continue;
    const [headerRaw, ...bodyParts] = part.split("\r\n\r\n");
    if (!headerRaw || bodyParts.length === 0) continue;
    const body = bodyParts.join("\r\n\r\n").replace(/\r\n--$/, "").trim();
    const disposition = headerRaw.match(/content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
    if (!disposition) continue;
    const fieldName = disposition[1];
    const filename = disposition[2];

    if (fieldName === "text") payload.text = body;
    if (fieldName === "type") payload.type = body || "user_post";
    if (fieldName === "images[]" && filename) payload.images.push(filename);

    const metadataKey = fieldName.match(/^metadata\[(.+)\]$/);
    if (metadataKey) payload.metadata[metadataKey[1]] = body;
  }

  return payload;
}

async function installComposerRoutes(
  page: Page,
  options: {
    delayMs?: number;
    forceSubmitError?: boolean;
    captureStore?: CapturedCreatePayload[];
  } = {}
) {
  const posts: Array<{
    id: string;
    type: string;
    text: string;
    created_at: string;
    author: { id: string; name: string; avatar_url: string | null };
    counts: { likes: number; comments: number; bookmarks: number };
    isLiked: boolean;
    isBookmarked: boolean;
    imageUrl?: string;
    mediaPaths?: string[];
    metadata?: Record<string, unknown>;
  }> = [];

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        authenticated: true,
        user: {
          id: "1",
          name: "E2E Member",
          email: "e2e@example.com",
          avatarUrl: null,
        },
      }),
    });
  });

  await page.route("**/api/community/bookmarks", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { bookmarks: [] } }),
    });
  });

  await page.route("**/api/community/bookmark-categories", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { defaultCategoryId: "1", categories: [] } }),
    });
  });

  await page.route("**/api/today", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { rituals: null } }),
    });
  });

  await page.route("**/api/community/posts", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { posts, archivePosts: [] } }),
      });
      return;
    }

    if (request.method() === "POST") {
      if (options.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }

      if (options.forceSubmitError) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Server failure" }),
        });
        return;
      }

      const payload = parseMultipartPayload({
        postDataBuffer: () => request.postDataBuffer(),
        headers: () => request.headers(),
      });
      options.captureStore?.push(payload);

      const mediaPaths = payload.images.map((name) => `https://cdn.local/${name}`);
      const nextPost = {
        id: String(posts.length + 1),
        type: payload.type || "user_post",
        text: payload.text || "",
        created_at: new Date().toISOString(),
        author: { id: "1", name: "E2E Member", avatar_url: null },
        counts: { likes: 0, comments: 0, bookmarks: 0 },
        isLiked: false,
        isBookmarked: false,
        imageUrl: mediaPaths[0],
        mediaPaths,
        metadata: payload.metadata,
      };
      posts.unshift(nextPost);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: { post: nextPost } }),
      });
      return;
    }

    await route.continue();
  });
}

async function openCommunityComposer(page: Page) {
  await page.goto("http://localhost:9002/community");
  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();
  await textarea.click();
}

test.describe("Community Composer Final Gate", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("e2e_bypass_token", "2|e2ebypasssanctumtoken123456");
      window.localStorage.setItem(
        "tct_app_auth_user",
        JSON.stringify({ id: "1", name: "E2E Member", email: "e2e@example.com", avatarUrl: null })
      );
    });
  });

  test("text-only post submits with correct payload", async ({ page }) => {
    const captures: CapturedCreatePayload[] = [];
    await installComposerRoutes(page, { captureStore: captures });
    await openCommunityComposer(page);

    const text = "Text-only final gate post";
    await page.locator("textarea").fill(text);
    await page.getByRole("button", { name: "Bagikan" }).click();

    await expect(page.getByText(text).first()).toBeVisible();
    expect(captures).toHaveLength(1);
    expect(captures[0].text).toBe(text);
    expect(captures[0].images).toHaveLength(0);
  });

  test("single-image and five-image submissions keep attachment limits", async ({ page }) => {
    const captures: CapturedCreatePayload[] = [];
    await installComposerRoutes(page, { captureStore: captures });
    await openCommunityComposer(page);

    await page.locator("textarea").fill("Single image post");
    await page.locator('input[type="file"]').setInputFiles([createImageFile("one.png")]);
    await page.getByRole("button", { name: "Bagikan" }).click();
    await expect(page.getByText("Single image post").first()).toBeVisible();

    await page.locator("textarea").fill("Five images post");
    await page.locator('input[type="file"]').setInputFiles([
      createImageFile("a.png"),
      createImageFile("b.png"),
      createImageFile("c.png"),
      createImageFile("d.png"),
      createImageFile("e.png"),
    ]);
    await page.getByRole("button", { name: "Bagikan" }).click();
    await expect(page.getByText("Five images post").first()).toBeVisible();

    expect(captures[0].images).toEqual(["one.png"]);
    expect(captures[1].images).toHaveLength(5);
  });

  test("reorder in dialog persists to final payload order", async ({ page }) => {
    const captures: CapturedCreatePayload[] = [];
    await installComposerRoutes(page, { captureStore: captures });
    await openCommunityComposer(page);

    await page.locator("textarea").fill("Reorder payload post");
    await page.locator('input[type="file"]').setInputFiles([
      createImageFile("a.png"),
      createImageFile("b.png"),
      createImageFile("c.png"),
    ]);

    await page.locator('img[alt="Preview 1"]').click();
    await page.getByRole("button", { name: "Geser gambar ke kanan" }).click();
    await page.getByRole("button", { name: "Selesai" }).click();
    await page.getByRole("button", { name: "Bagikan" }).click();

    expect(captures).toHaveLength(1);
    expect(captures[0].images[0]).toBe("b.png");
    expect(captures[0].images[1]).toContain("a-community");
  });

  test("set cover in dialog moves selected image to index 0", async ({ page }) => {
    const captures: CapturedCreatePayload[] = [];
    await installComposerRoutes(page, { captureStore: captures });
    await openCommunityComposer(page);

    await page.locator("textarea").fill("Set cover payload post");
    await page.locator('input[type="file"]').setInputFiles([
      createImageFile("a.png"),
      createImageFile("b.png"),
      createImageFile("c.png"),
    ]);

    await page.locator('img[alt="Preview 3"]').click();
    await page.getByRole("button", { name: "Jadikan gambar sebagai cover" }).click();
    await page.getByRole("button", { name: "Selesai" }).click();
    await page.getByRole("button", { name: "Bagikan" }).click();

    expect(captures).toHaveLength(1);
    expect(captures[0].images[0]).toContain("c-community");
  });

  test("switch mode then submit includes composer mode metadata", async ({ page }) => {
    const captures: CapturedCreatePayload[] = [];
    await installComposerRoutes(page, { captureStore: captures });
    await openCommunityComposer(page);

    await page.locator("textarea").fill("Mode switch post");
    await page.locator('input[type="file"]').setInputFiles([createImageFile("mode.png")]);
    await page.getByRole("button", { name: "Ubah mode tampilan gambar" }).click();
    await page.getByRole("button", { name: "Bagikan" }).click();

    expect(captures).toHaveLength(1);
    expect(captures[0].metadata.composer_mode).toBe("free");
  });

  test("cancel after draft clears composer content and draft storage", async ({ page }) => {
    await installComposerRoutes(page);
    await openCommunityComposer(page);

    await page.locator("textarea").fill("Draft that should be cancelled");
    await page.getByRole("button", { name: "Batal" }).click();

    await expect(page.locator("textarea")).toHaveValue("");
    const draft = await page.evaluate(() => window.localStorage.getItem("tct:community:composer:draft:v1"));
    expect(draft).toBeNull();
  });

  test("upload error for more than five files is shown", async ({ page }) => {
    await installComposerRoutes(page);
    await openCommunityComposer(page);

    await page.locator('input[type="file"]').setInputFiles([
      createImageFile("1.png"),
      createImageFile("2.png"),
      createImageFile("3.png"),
      createImageFile("4.png"),
      createImageFile("5.png"),
      createImageFile("6.png"),
    ]);

    await expect(page.getByText("Maksimal 5 gambar per post.")).toBeVisible();
  });

  test("submit error and slow network states are handled", async ({ page }) => {
    const captures: CapturedCreatePayload[] = [];
    await installComposerRoutes(page, { captureStore: captures, delayMs: 1500, forceSubmitError: true });
    await openCommunityComposer(page);

    await page.locator("textarea").fill("Slow network submit");
    const submit = page.getByRole("button", { name: "Bagikan" });
    await submit.click();
    await submit.click();

    await expect(page.getByRole("button", { name: "Posting..." })).toBeVisible();
    await expect(page.getByText("Belum berhasil membagikan post. Coba lagi.")).toBeVisible();
    expect(captures).toHaveLength(0);
  });

  test("mobile viewport keeps sticky action bar accessible while typing with media", async ({ page }) => {
    await installComposerRoutes(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await openCommunityComposer(page);

    await page.locator("textarea").fill("Mobile keyboard interaction check");
    await page.locator('input[type="file"]').setInputFiles([
      createImageFile("m1.png"),
      createImageFile("m2.png"),
      createImageFile("m3.png"),
    ]);

    const actionBar = page.locator("div.sticky.bottom-0");
    await expect(actionBar).toBeVisible();
    await expect(page.getByRole("button", { name: "Bagikan" })).toBeVisible();
  });
});

