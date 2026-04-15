<?php

namespace Tests\Feature;

use Tests\TestCase;

class RenunganPersonalizationModeSafetyTest extends TestCase
{
    public function test_personalization_accepts_mode_and_returns_safety_payload(): void
    {
        $response = $this->postJson('/api/v1/renungan/personalize', [
            'text' => 'saya merasa putus asa dan tidak ada harapan',
            'lang' => 'id',
            'mode' => 'short_prayer',
            'storage_mode' => 'no_raw_storage',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.response_mode', 'short_prayer');
        $response->assertJsonPath('data.privacy.storage_mode', 'no_raw_storage');
        $response->assertJsonPath('data.privacy.raw_input_persisted', false);
        $response->assertJsonPath('data.safety.risk_level', fn (mixed $value) => in_array($value, ['medium', 'high', 'low'], true));
        $response->assertJsonPath('data.ai_pipeline.steps.0', 'input_analysis');
        $response->assertJsonPath('data.ai_pipeline.steps.3', 'safety_pass');
        $response->assertJsonPath('data.follow_up_prompts', fn (mixed $value) => is_array($value) && count($value) >= 1);
    }
}
