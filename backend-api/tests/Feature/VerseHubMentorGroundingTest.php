<?php

namespace Tests\Feature;

use App\Models\BibleVerse;
use App\Models\User;
use App\Models\UserMentorSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerseHubMentorGroundingTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_ask_returns_grounding_payload_with_mode(): void
    {
        BibleVerse::query()->create([
            'provider' => 'ayt',
            'lang' => 'id',
            'book_code' => 'yoh',
            'chapter' => 3,
            'verse' => 16,
            'reference' => 'Yohanes 3:16',
            'text' => 'Karena begitu besar kasih Allah akan dunia ini...',
            'translation_name' => 'AYT',
        ]);

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/versehub/id/yoh-3-16/mentor/ask', [
                'question' => 'Apa makna praktis ayat ini untuk saya hari ini?',
                'mode' => 'practical_meaning',
            ]);

        $response->assertOk();
        $response->assertJsonPath('grounding.mode', 'practical_meaning');
        $response->assertJsonPath('grounding.anchor_ref', 'yoh-3-16');

        $session = UserMentorSession::query()->where('user_id', $user->id)->first();
        $this->assertNotNull($session);
        $this->assertSame('threaded_mentor', $session->session_type);
        $this->assertSame(1, (int) data_get($session->metadata, 'thread.turn_count', 0));

        $this->actingAs($user)
            ->postJson('/api/v1/versehub/id/yoh-3-16/mentor/ask', [
                'question' => 'Kalau saya gagal mempraktikkan ayat ini, harus mulai dari mana?',
                'mode' => 'practical_meaning',
            ])
            ->assertOk()
            ->assertJsonPath('session.turn_count', 2);
    }
}
