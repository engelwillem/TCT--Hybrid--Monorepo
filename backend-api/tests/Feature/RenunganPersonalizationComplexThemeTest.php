<?php

namespace Tests\Feature;

use Tests\TestCase;

class RenunganPersonalizationComplexThemeTest extends TestCase
{
    public function test_complex_institutional_input_is_not_collapsed_to_generic_direction_theme(): void
    {
        $input = 'saya sedang bingung karena, di sisi lain saya senang pelayanan pendeta advent, '
            .'tapi saya tidak sanggup bertahan jadi pendeta advent karena banyak talenta saya tidak dilibatkan, '
            .'dan seringkali saya justru dimanfaatkan untuk kepentingan pendeta-pendeta senior.';

        $response = $this->postJson('/api/v1/renungan/personalize', [
            'text' => $input,
            'lang' => 'id',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.analysis.primary_theme', fn (mixed $value) => is_string($value) && $value !== 'direction');
        $response->assertJsonPath('data.analysis.primary_theme', fn (mixed $value) => in_array($value, [
            'ministry_disillusionment',
            'calling_conflict',
            'exploitation',
            'institutional_disappointment',
            'authority_wound',
            'mixed_emotional_state',
        ], true));
        $response->assertJsonPath('data.analysis.intent', fn (mixed $value) => is_string($value) && $value !== 'guidance');
    }
}

