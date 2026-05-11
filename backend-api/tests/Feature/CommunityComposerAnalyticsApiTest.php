<?php

namespace Tests\Feature;

use App\Models\LandingClickEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityComposerAnalyticsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_guest_cannot_access_composer_analytics_endpoint(): void
    {
        $response = $this->getJson('/api/v1/analytics/community/composer');

        $response->assertUnauthorized();
    }

    public function test_non_admin_user_cannot_access_composer_analytics_endpoint(): void
    {
        Sanctum::actingAs(User::factory()->create(['is_admin' => false]));

        $response = $this->getJson('/api/v1/analytics/community/composer');

        $response->assertForbidden();
    }

    public function test_admin_can_access_and_validate_filters(): void
    {
        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));

        $ok = $this->getJson('/api/v1/analytics/community/composer?timeframe=30d&postType=reflection&media=with_media');
        $ok->assertOk();
        $ok->assertJsonPath('filters.timeframe', '30d');
        $ok->assertJsonPath('filters.postType', 'reflection');
        $ok->assertJsonPath('filters.media', 'with_media');

        $invalid = $this->getJson('/api/v1/analytics/community/composer?timeframe=90d');
        $invalid->assertUnprocessable();
    }

    public function test_admin_gets_aggregated_snapshot_for_composer_events(): void
    {
        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));

        $this->seedComposerEvent('composer_open', [
            'postType' => 'reflection',
            'hasMedia' => false,
        ]);
        $this->seedComposerEvent('composer_typing_start', [
            'postType' => 'reflection',
            'hasMedia' => false,
        ]);
        $this->seedComposerEvent('composer_attach_media', [
            'postType' => 'reflection',
            'hasMedia' => true,
            'mediaCount' => 2,
        ]);
        $this->seedComposerEvent('composer_crop_applied', [
            'postType' => 'reflection',
            'hasMedia' => true,
            'mediaCount' => 2,
        ]);
        $this->seedComposerEvent('composer_draft_restored', [
            'postType' => 'reflection',
            'hasMedia' => false,
        ]);
        $this->seedComposerEvent('composer_submit_success', [
            'postType' => 'reflection',
            'hasMedia' => true,
            'mediaCount' => 2,
            'timeSpentMs' => 90000,
            'isDraftRestore' => true,
        ]);
        $this->seedComposerEvent('composer_submit_failure', [
            'postType' => 'reflection',
            'hasMedia' => false,
            'timeSpentMs' => 30000,
            'reason' => 'network_error',
        ]);

        // Out-of-timeframe event should not be included for 7d.
        $this->seedComposerEvent('composer_open', [
            'postType' => 'quote',
            'hasMedia' => false,
        ], now()->subDays(40));

        $response = $this->getJson('/api/v1/analytics/community/composer?timeframe=7d');
        $response->assertOk();
        $response->assertJsonPath('overview.openCount', 1);
        $response->assertJsonPath('overview.submitSuccessCount', 1);
        $response->assertJsonPath('overview.submitFailureCount', 1);
        $response->assertJsonPath('draft.restoredCount', 1);
        $response->assertJsonPath('draft.restoredToSuccessRatePct', 100);
        $response->assertJsonPath('funnel.4.key', 'success');
        $response->assertJsonPath('funnel.4.value', 1);

        $topFailures = $response->json('failure.topValidationFailures');
        $this->assertNotEmpty($topFailures);
        $this->assertSame('network_error', $topFailures[0]['reason']);
        $this->assertSame(1, $topFailures[0]['count']);
    }

    public function test_empty_dataset_returns_zeroed_snapshot(): void
    {
        Sanctum::actingAs(User::factory()->create(['is_admin' => true]));

        $response = $this->getJson('/api/v1/analytics/community/composer');

        $response->assertOk();
        $response->assertJsonPath('overview.openCount', 0);
        $response->assertJsonPath('overview.submitSuccessCount', 0);
        $response->assertJsonPath('overview.submitFailureCount', 0);
        $response->assertJsonPath('draft.restoredCount', 0);
        $response->assertJsonPath('postTypeBreakdown', []);
    }

    private function seedComposerEvent(string $eventName, array $payload, ?\Carbon\CarbonInterface $createdAt = null): void
    {
        $at = $createdAt ?? now();

        $event = LandingClickEvent::query()->create([
            'user_id' => null,
            'session_id' => 'composer-test-session',
            'variant' => 'p0',
            'event_name' => $eventName,
            'target' => null,
            'page' => '/community',
            'meta' => [
                'surface' => 'community',
                'payload_meta' => $payload,
            ],
        ]);

        $event->forceFill([
            'created_at' => $at,
            'updated_at' => $at,
        ])->saveQuietly();
    }
}
