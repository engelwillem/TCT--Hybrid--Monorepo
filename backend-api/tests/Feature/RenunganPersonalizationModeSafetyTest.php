<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RenunganPersonalizationModeSafetyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! Schema::hasTable('bible_verses')) {
            Schema::create('bible_verses', function ($table) {
                $table->id();
                $table->string('provider')->default('ayt');
                $table->string('lang', 8)->default('id');
                $table->string('reference');
                $table->text('text');
                $table->string('book_code', 16)->nullable();
                $table->unsignedInteger('chapter')->nullable();
                $table->unsignedInteger('verse')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('verse_theme_mappings')) {
            Schema::create('verse_theme_mappings', function ($table) {
                $table->id();
                $table->string('verse_ref');
                $table->string('lang', 8)->default('id');
                $table->string('theme_slug');
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('verse_tone_mappings')) {
            Schema::create('verse_tone_mappings', function ($table) {
                $table->id();
                $table->string('verse_ref');
                $table->string('lang', 8)->default('id');
                $table->string('tone_slug');
                $table->decimal('weight', 8, 2)->default(1);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('verse_pastoral_notes')) {
            Schema::create('verse_pastoral_notes', function ($table) {
                $table->id();
                $table->string('verse_ref')->nullable();
                $table->string('lang', 8)->default('id');
                $table->string('theme_slug')->nullable();
                $table->string('tone_slug')->nullable();
                $table->unsignedInteger('priority')->default(0);
                $table->boolean('is_active')->default(true);
                $table->text('main_message')->nullable();
                $table->text('application_text')->nullable();
                $table->text('pastoral_angle')->nullable();
                $table->text('correction_direction')->nullable();
                $table->text('hope_text')->nullable();
                $table->text('prayer_direction')->nullable();
                $table->text('de_escalation_direction')->nullable();
                $table->string('language_style')->nullable();
                $table->timestamps();
            });
        }

        if (! DB::table('bible_verses')->where('provider', 'ayt')->where('lang', 'id')->exists()) {
            DB::table('bible_verses')->insert([
                'provider' => 'ayt',
                'lang' => 'id',
                'reference' => 'Yeremia 29:11',
                'text' => 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu.',
                'book_code' => 'JER',
                'chapter' => 29,
                'verse' => 11,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

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
