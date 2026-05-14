<?php

namespace Tests\Feature;

use App\Models\BibleVerse;
use App\Models\MemberPost;
use App\Models\RenunganShareSnapshot;
use App\Models\User;
use App\Services\ShareAssets\ShareAssetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SharePrepareRateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        cache()->flush();
        $this->mockShareAssetService();
    }

    public function test_prepare_endpoints_require_authentication(): void
    {
        $fixtures = $this->seedPrepareFixtures();

        $this->postJson("/api/v1/community/posts/{$fixtures['post']->id}/share-assets/prepare")
            ->assertStatus(401);
        $this->postJson("/api/v1/renungan/share/{$fixtures['snapshot']->token}/prepare")
            ->assertStatus(401);
        $this->postJson('/api/v1/versehub/id/kejadian-1-1/share-assets/prepare')
            ->assertStatus(401);
    }

    public function test_authenticated_user_can_prepare_on_valid_resources(): void
    {
        $fixtures = $this->seedPrepareFixtures();
        Sanctum::actingAs($fixtures['user']);

        $this->postJson("/api/v1/community/posts/{$fixtures['post']->id}/share-assets/prepare")
            ->assertOk()
            ->assertJsonPath('data.status', 'ready');

        $this->postJson("/api/v1/renungan/share/{$fixtures['snapshot']->token}/prepare")
            ->assertOk()
            ->assertJsonPath('data.status', 'ready');

        $this->postJson('/api/v1/versehub/id/kejadian-1-1/share-assets/prepare')
            ->assertOk()
            ->assertJsonPath('data.status', 'ready');
    }

    public function test_authenticated_invalid_resource_still_returns_not_found(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/community/posts/999999/share-assets/prepare')
            ->assertStatus(404);
    }

    public function test_share_prepare_returns_consistent_429_contract_when_threshold_exceeded(): void
    {
        config()->set('share_assets.rate_limit.community.per_minute', 2);
        config()->set('share_assets.rate_limit.community.burst_per_10_seconds', 2);

        $fixtures = $this->seedPrepareFixtures();
        Sanctum::actingAs($fixtures['user']);

        $this->postJson("/api/v1/community/posts/{$fixtures['post']->id}/share-assets/prepare")
            ->assertOk();
        $this->postJson("/api/v1/community/posts/{$fixtures['post']->id}/share-assets/prepare")
            ->assertOk();

        $response = $this->postJson("/api/v1/community/posts/{$fixtures['post']->id}/share-assets/prepare");

        $this->assertSharePrepareThrottleContract($response);
    }

    public function test_renungan_share_prepare_returns_429_when_threshold_exceeded(): void
    {
        config()->set('share_assets.rate_limit.renungan.per_minute', 2);
        config()->set('share_assets.rate_limit.renungan.burst_per_10_seconds', 2);

        $fixtures = $this->seedPrepareFixtures();
        Sanctum::actingAs($fixtures['user']);

        $url = "/api/v1/renungan/share/{$fixtures['snapshot']->token}/prepare";
        $this->postJson($url)->assertOk();
        $this->postJson($url)->assertOk();

        $response = $this->postJson($url);
        $this->assertSharePrepareThrottleContract($response);
    }

    public function test_versehub_share_prepare_returns_429_when_threshold_exceeded(): void
    {
        config()->set('share_assets.rate_limit.versehub.per_minute', 2);
        config()->set('share_assets.rate_limit.versehub.burst_per_10_seconds', 2);

        $fixtures = $this->seedPrepareFixtures();
        Sanctum::actingAs($fixtures['user']);

        $url = '/api/v1/versehub/id/kejadian-1-1/share-assets/prepare';
        $this->postJson($url)->assertOk();
        $this->postJson($url)->assertOk();

        $response = $this->postJson($url);
        $this->assertSharePrepareThrottleContract($response);
    }

    /**
     * @return array{user:User, post:MemberPost, snapshot:RenunganShareSnapshot}
     */
    private function seedPrepareFixtures(): array
    {
        $user = User::factory()->create();

        $post = MemberPost::query()->create([
            'user_id' => $user->id,
            'type' => \App\Enums\PostType::USER_POST,
            'text' => 'Fixture post for share prepare limiter test.',
            'metadata' => ['visibility' => 'public'],
            'expires_at' => now()->addHour(),
        ]);

        $snapshot = RenunganShareSnapshot::query()->create([
            'user_id' => $user->id,
            'token' => 'test-token-'.Str::lower(Str::random(8)),
            'lang' => 'id',
            'verse_reference' => 'Mazmur 37:5',
            'verse_text' => 'Serahkanlah hidupmu kepada TUHAN.',
            'meditation_excerpt' => 'Tuhan memelihara jalan kita.',
            'theme' => 'trust',
            'expires_at' => now()->addHour(),
        ]);

        BibleVerse::query()->updateOrCreate(
            [
                'lang' => 'id',
                'book_code' => 'kejadian',
                'chapter' => 1,
                'verse' => 1,
            ],
            [
                'provider' => 'fixture',
                'reference' => 'Kejadian 1:1',
                'text' => 'Pada mulanya Allah menciptakan langit dan bumi.',
                'translation_name' => 'TB',
            ]
        );

        return compact('user', 'post', 'snapshot');
    }

    private function mockShareAssetService(): void
    {
        $this->mock(ShareAssetService::class, function ($mock): void {
            $mock->shouldReceive('prepare')->andReturn([
                'status' => 'ready',
                'revision' => 'rev-test',
                'asset_id' => 1,
                'share_title' => 'Share title',
                'share_description' => 'Share description',
                'share_eyebrow' => 'Share eyebrow',
                'final_og_image_url' => 'https://example.test/og.png',
                'from_cache' => false,
            ]);
        });
    }

    private function assertSharePrepareThrottleContract(\Illuminate\Testing\TestResponse $response): void
    {
        $response->assertStatus(429)
            ->assertJsonPath('status', 429)
            ->assertJsonPath('code', 'SHARE_PREPARE_RATE_LIMITED')
            ->assertJsonStructure([
                'message',
                'code',
                'status',
                'retry_after',
                'request_id',
            ]);

        $this->assertNotEmpty((string) $response->headers->get('Retry-After'));
    }
}
