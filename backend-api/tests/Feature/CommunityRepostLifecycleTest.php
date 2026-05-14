<?php

namespace Tests\Feature;

use App\Enums\PostType;
use App\Events\Community\PostRepostedToTalks;
use App\Models\MemberPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityRepostLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_repost_reactivates_the_same_record_and_moves_it_back_to_discussion(): void
    {
        $author = User::factory()->create();

        $post = MemberPost::query()->create([
            'user_id' => $author->id,
            'type' => PostType::USER_POST,
            'status' => 'gallery',
            'text' => 'Konten arsip yang akan diaktifkan kembali.',
            'activated_at' => now()->subDays(2),
            'metadata' => [
                'visibility' => 'public',
            ],
            'expires_at' => now()->subHour(),
        ]);
        $originalCreatedAt = $post->created_at?->toIso8601String();
        $originalActivatedAt = $post->activated_at?->toIso8601String();

        Event::fake([PostRepostedToTalks::class]);
        Sanctum::actingAs($author);
        $response = $this->postJson("/api/v1/community/posts/{$post->id}/repost");
        $response->assertOk();
        $response->assertJsonPath('data.post.id', (string) $post->id);
        $response->assertJsonPath('data.status', 'transitioned');

        $post->refresh();
        $this->assertSame('active', $post->status);
        $this->assertNotNull($post->expires_at);
        $this->assertTrue($post->expires_at->greaterThan(now()->addHours(23)));
        $this->assertSame($originalCreatedAt, $post->created_at?->toIso8601String());
        $this->assertNotSame($originalActivatedAt, $post->activated_at?->toIso8601String());
        $this->assertTrue((int) $post->repost_count >= 1);

        $feedResponse = $this->getJson('/api/v1/community/posts')->assertOk();
        $discussionIds = collect($feedResponse->json('data.posts', []))->pluck('id')->all();
        $archiveIds = collect($feedResponse->json('data.archivePosts', []))->pluck('id')->all();

        $this->assertContains((string) $post->id, $discussionIds);
        $this->assertNotContains((string) $post->id, $archiveIds);

        Event::assertDispatched(PostRepostedToTalks::class, function (PostRepostedToTalks $event) use ($post, $author) {
            return $event->postId === (int) $post->id
                && $event->authorId === (int) $author->id
                && $event->repostedBy === (int) $author->id
                && $event->previousStatus === 'gallery'
                && $event->newStatus === 'active'
                && $event->sourceSurface === 'gallery';
        });
    }

    public function test_new_post_starts_with_24h_active_window(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/community/posts', [
            'text' => 'Post baru untuk verifikasi window 24 jam.',
            'type' => 'user_post',
        ])->assertCreated();

        $postId = (int) $response->json('data.post.id');
        $post = MemberPost::query()->findOrFail($postId);
        $this->assertSame('active', $post->status);
        $this->assertNotNull($post->activated_at);
        $this->assertSame(
            $post->created_at?->toIso8601String(),
            $post->activated_at?->toIso8601String(),
            'Post baru harus memakai activated_at yang sejajar dengan created_at saat create.'
        );
        $this->assertNotNull($post->expires_at);
        $this->assertTrue($post->expires_at->between(now()->addHours(23), now()->addHours(25)));
    }

    public function test_repost_on_already_active_post_is_idempotent(): void
    {
        $author = User::factory()->create();

        $post = MemberPost::query()->create([
            'user_id' => $author->id,
            'type' => PostType::USER_POST,
            'status' => 'active',
            'text' => 'Post aktif yang direpost ulang.',
            'activated_at' => now(),
            'expires_at' => now()->addHours(23),
            'repost_count' => 0,
        ]);

        Event::fake([PostRepostedToTalks::class]);
        Sanctum::actingAs($author);
        $response = $this->postJson("/api/v1/community/posts/{$post->id}/repost");
        $response->assertOk();
        $response->assertJsonPath('data.status', 'already_active');

        $post->refresh();
        $this->assertSame('active', $post->status);
        $this->assertSame(0, (int) $post->repost_count);
        Event::assertNotDispatched(PostRepostedToTalks::class);
    }

    public function test_repost_is_forbidden_for_non_owner(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();

        $post = MemberPost::query()->create([
            'user_id' => $author->id,
            'type' => PostType::USER_POST,
            'status' => 'gallery',
            'text' => 'Konten arsip milik author.',
            'activated_at' => now()->subDays(2),
            'expires_at' => now()->subHour(),
        ]);

        Sanctum::actingAs($otherUser);
        $response = $this->postJson("/api/v1/community/posts/{$post->id}/repost");
        $response->assertForbidden();
        $response->assertJsonPath('message', 'Anda hanya bisa repost konten milik Anda sendiri.');

        $post->refresh();
        $this->assertSame('gallery', $post->status);
    }
}
