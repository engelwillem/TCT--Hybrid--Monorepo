<?php

namespace Tests\Feature;

use App\Enums\PostType;
use App\Models\MemberPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityRepostLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_repost_reactivates_the_same_record_and_moves_it_back_to_discussion(): void
    {
        $author = User::factory()->create();
        $viewer = User::factory()->create();

        $post = MemberPost::query()->create([
            'user_id' => $author->id,
            'type' => PostType::USER_POST,
            'text' => 'Konten arsip yang akan diaktifkan kembali.',
            'metadata' => [
                'visibility' => 'public',
            ],
            'expires_at' => now()->subHour(),
        ]);

        Sanctum::actingAs($viewer);
        $response = $this->postJson("/api/v1/community/posts/{$post->id}/repost");
        $response->assertOk();
        $response->assertJsonPath('data.post.id', (string) $post->id);

        $post->refresh();
        $this->assertNotNull($post->expires_at);
        $this->assertTrue($post->expires_at->greaterThan(now()->addHours(23)));

        $feedResponse = $this->getJson('/api/v1/community/posts')->assertOk();
        $discussionIds = collect($feedResponse->json('data.posts', []))->pluck('id')->all();
        $archiveIds = collect($feedResponse->json('data.archivePosts', []))->pluck('id')->all();

        $this->assertContains((string) $post->id, $discussionIds);
        $this->assertNotContains((string) $post->id, $archiveIds);
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
        $this->assertNotNull($post->expires_at);
        $this->assertTrue($post->expires_at->between(now()->addHours(23), now()->addHours(25)));
    }
}
