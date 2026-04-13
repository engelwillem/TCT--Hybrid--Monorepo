import { expect, test, type Page } from "@playwright/test";

type MockPost = {
  id: string;
  type: string;
  status: "active" | "gallery";
  text: string;
  createdAt: string;
  activatedAt: string;
  publicAt: string;
  expiresAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    isOfficial?: boolean;
  };
  counts: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  metadata?: Record<string, unknown>;
};

function iso(offsetHours: number): string {
  return new Date(Date.now() + offsetHours * 60 * 60 * 1000).toISOString();
}

async function setupCommunityMock(page: Page) {
  const state: { posts: MockPost[]; archivePosts: MockPost[] } = {
    posts: [
      {
        id: "talk-1",
        type: "user_post",
        status: "active",
        text: "Post aktif di Talks",
        createdAt: iso(-8),
        activatedAt: iso(-8),
        publicAt: iso(-8),
        expiresAt: iso(16),
        author: {
          id: "u-1",
          name: "Member Aktif",
          avatarUrl: "https://placehold.co/96x96?text=MA",
        },
        counts: { likes: 2, comments: 1, bookmarks: 0 },
        isLiked: false,
        isBookmarked: false,
      },
    ],
    archivePosts: [
      {
        id: "arc-1",
        type: "testimony",
        status: "gallery",
        text: "Arsip lama yang akan direpost",
        createdAt: iso(-120),
        activatedAt: iso(-120),
        publicAt: iso(-120),
        expiresAt: iso(-96),
        author: {
          id: "u-2",
          name: "Member Arsip",
          avatarUrl: "https://placehold.co/96x96?text=AR",
        },
        counts: { likes: 9, comments: 3, bookmarks: 2 },
        isLiked: false,
        isBookmarked: false,
      },
    ],
  };

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        authenticated: true,
        user: {
          id: "viewer-1",
          name: "Viewer",
          email: "viewer@example.com",
          avatarUrl: "https://placehold.co/96x96?text=VW",
        },
      }),
    });
  });

  await page.route("**/api/today**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          rituals: {},
        },
      }),
    });
  });

  await page.route("**/api/community/bookmarks", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          bookmarks: [],
        },
      }),
    });
  });

  await page.route("**/api/community/bookmark-categories", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          defaultCategoryId: "1",
          categories: [],
        },
      }),
    });
  });

  await page.route("**/api/community/posts", async (route) => {
    const payload = {
      data: {
        posts: state.posts,
        archivePosts: state.archivePosts,
      },
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  await page.route("**/api/community/posts/*/repost", async (route) => {
    const url = new URL(route.request().url());
    const parts = url.pathname.split("/");
    const postId = parts[parts.length - 2] || "";
    const idx = state.archivePosts.findIndex((post) => post.id === postId);

    if (idx < 0) {
      const existing = state.posts.find((post) => post.id === postId);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            status: "already_active",
            post: existing ?? null,
          },
        }),
      });
      return;
    }

    const now = new Date().toISOString();
    const moved = {
      ...state.archivePosts[idx],
      status: "active" as const,
      activatedAt: now,
      publicAt: now,
      expiresAt: iso(24),
      metadata: {
        ...(state.archivePosts[idx].metadata || {}),
        last_activated_at: now,
        last_reposted_at: now,
      },
    };

    state.archivePosts.splice(idx, 1);
    state.posts.unshift(moved);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          status: "transitioned",
          post: moved,
        },
      }),
    });
  });

  await page.route("**/api/community/posts/*/pray", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { post: state.posts[0] } }),
    });
  });

  await page.route("**/api/community/posts/*/bookmark", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { post: state.posts[0] } }),
    });
  });

  await page.route("**/api/community/posts/*/comments", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { comments: [] } }),
    });
  });
}

test.describe("Community GALERY Repost Flow", () => {
  test("repost memindahkan post dari GALERY ke Talks dan tampil konsisten setelah reload", async ({ page }) => {
    await setupCommunityMock(page);
    await page.goto("http://127.0.0.1:9002/community");

    await page.getByRole("tab", { name: "GALERY" }).click();
    await expect(page.getByText("Arsip lama yang akan direpost")).toBeVisible();

    await page.getByRole("button", { name: "Repost ke Talks" }).first().click();
    await expect(page.getByText("Berhasil Repost ke Talks")).toBeVisible();

    await expect(page.getByRole("tab", { name: "Talks" })).toHaveAttribute("data-state", "active");
    await expect(page.getByText("Arsip lama yang akan direpost")).toBeVisible();

    await page.getByRole("tab", { name: "GALERY" }).click();
    await expect(page.getByText("Arsip lama yang akan direpost")).not.toBeVisible();

    await page.reload();
    await page.getByRole("tab", { name: "Talks" }).click();
    await expect(page.getByText("Arsip lama yang akan direpost")).toBeVisible();

    await page.getByRole("tab", { name: "GALERY" }).click();
    await expect(page.getByText("Arsip lama yang akan direpost")).not.toBeVisible();
  });
});
