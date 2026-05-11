<?php

namespace Tests\Feature;

use App\Models\SpiritualSessionMemory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SpiritualSessionMemoryFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_renungan_personalization_persists_session_memory(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/renungan/personalize', [
            'text' => 'saya cemas tentang masa depan pekerjaan saya',
            'lang' => 'id',
            'mode' => 'calm_heart',
        ], [
            'X-Renungan-Debug-Force' => 'fallback',
        ]);

        $response->assertOk();

        $this->assertDatabaseCount('spiritual_session_memories', 1);
        $this->assertDatabaseHas('spiritual_session_memories', [
            'user_id' => $user->id,
            'source' => 'renungan',
        ]);

        $memory = SpiritualSessionMemory::query()->firstOrFail();
        $this->assertNotSame('saya cemas tentang masa depan pekerjaan saya', $memory->interpretation_focus);
        $this->assertNotNull($memory->pipeline_version);
    }

    public function test_profile_returns_spiritual_highlights_for_last_7_days(): void
    {
        Carbon::setTestNow('2026-04-16 09:00:00');
        try {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            SpiritualSessionMemory::query()->insert([
                [
                    'user_id' => $user->id,
                    'source' => 'renungan',
                    'dominant_emotion' => 'fearful',
                    'reflection_theme' => 'anxiety',
                    'primary_verse_reference' => 'Amsal 3:5',
                    'interpretation_focus' => 'percaya dan tetap tenang',
                    'pipeline_version' => 'renungan.v2.1.telemetry',
                    'created_at' => now()->subDays(2),
                    'updated_at' => now()->subDays(2),
                ],
                [
                    'user_id' => $user->id,
                    'source' => 'renungan',
                    'dominant_emotion' => 'fearful',
                    'reflection_theme' => 'anxiety',
                    'primary_verse_reference' => 'Amsal 3:5',
                    'interpretation_focus' => 'langkah kecil dalam damai',
                    'pipeline_version' => 'renungan.v2.1.telemetry',
                    'created_at' => now()->subDays(1),
                    'updated_at' => now()->subDays(1),
                ],
                [
                    'user_id' => $user->id,
                    'source' => 'renungan',
                    'dominant_emotion' => 'grateful',
                    'reflection_theme' => 'gratitude',
                    'primary_verse_reference' => '1 Tesalonika 5:18',
                    'interpretation_focus' => 'syukur yang stabil',
                    'pipeline_version' => 'renungan.v2.1.telemetry',
                    'created_at' => now()->subDays(12),
                    'updated_at' => now()->subDays(12),
                ],
            ]);

            $response = $this->getJson('/api/v1/profile');
            $response->assertOk();
            $response->assertJsonPath('data.spiritualHighlights.has_data', true);
            $response->assertJsonPath('data.spiritualHighlights.window_days', 7);
            $response->assertJsonPath('data.spiritualHighlights.session_count', 2);
            $response->assertJsonPath('data.spiritualHighlights.top_emotion', 'fearful');
            $response->assertJsonPath('data.spiritualHighlights.top_theme', 'anxiety');
            $response->assertJsonPath('data.spiritualHighlights.top_verse_reference', 'amsal 3:5');
            $response->assertJsonPath('data.spiritualHighlights.summary', fn ($value) => is_string($value) && $value !== '');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_profile_returns_graceful_empty_state_when_no_memory_exists(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/profile');
        $response->assertOk();
        $response->assertJsonPath('data.spiritualHighlights.has_data', false);
        $response->assertJsonPath('data.spiritualHighlights.session_count', 0);
        $response->assertJsonPath('data.spiritualHighlights.summary', null);
    }
}
