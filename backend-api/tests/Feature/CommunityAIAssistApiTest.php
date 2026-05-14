<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityAIAssistApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_request_community_ai_assist_with_safe_fallback(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/community/ai/assist', [
                'mode' => 'compose_refine',
                'text' => 'Saya lagi bingung bagaimana menulis refleksi ini.',
                'context' => ['surface' => 'community'],
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'output_text',
                'tone',
                'suggestions',
                'moderation',
                'tags',
                'summary',
                'verse_refs',
                'safety' => ['risk_level', 'flags'],
                'used_fallback',
            ],
        ]);
    }

    public function test_moderation_mode_adds_rule_based_flags_for_toxic_content(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/community/ai/assist', [
                'mode' => 'moderate',
                'text' => 'Kamu bodoh dan mending bunuh diri saja.',
                'context' => ['surface' => 'community'],
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.moderation', fn (mixed $value) => is_array($value) && in_array('toxicity', $value, true));
        $response->assertJsonPath('data.moderation', fn (mixed $value) => is_array($value) && in_array('self_harm_risk', $value, true));
    }
}
