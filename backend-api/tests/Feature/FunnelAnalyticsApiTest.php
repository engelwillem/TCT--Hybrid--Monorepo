<?php

namespace Tests\Feature;

use App\Models\LandingClickEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FunnelAnalyticsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_store_funnel_event(): void
    {
        $response = $this->postJson('/api/v1/analytics/funnel', [
            'session_id' => 'fn-test-session',
            'event_name' => 'landing_cta_click',
            'path' => '/',
            'surface' => 'landing',
            'meta' => [
                'target' => '/renungan',
            ],
            'occurred_at' => now()->toIso8601String(),
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.ok', true);

        $event = LandingClickEvent::query()->first();
        $this->assertNotNull($event);
        $this->assertSame('fn-test-session', $event->session_id);
        $this->assertSame('landing_cta_click', $event->event_name);
        $this->assertSame('/renungan', $event->target);
        $this->assertSame('/', $event->page);
        $this->assertSame('p0', $event->variant);
        $this->assertSame('landing', $event->meta['surface'] ?? null);
    }

    public function test_authenticated_user_is_attached_to_funnel_event(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/analytics/funnel', [
            'session_id' => 'fn-auth-session',
            'event_name' => 'login_success',
            'path' => '/login',
            'surface' => 'auth',
            'meta' => [],
        ]);

        $response->assertCreated();

        $event = LandingClickEvent::query()->first();
        $this->assertNotNull($event);
        $this->assertSame($user->id, $event->user_id);
        $this->assertSame('login_success', $event->event_name);
    }
}
