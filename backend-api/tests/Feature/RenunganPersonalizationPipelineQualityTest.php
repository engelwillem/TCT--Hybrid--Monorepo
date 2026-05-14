<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RenunganPersonalizationPipelineQualityTest extends TestCase
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
                'reference' => 'Amsal 3:5',
                'text' => 'Percayalah kepada TUHAN dengan segenap hatimu.',
                'book_code' => 'PRO',
                'chapter' => 3,
                'verse' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function test_personalization_returns_structured_generation_pipeline(): void
    {
        $response = $this->postJson('/api/v1/renungan/personalize', [
            'text' => 'saya mau jadi kaya raya',
            'lang' => 'id',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'meditation',
                'verse' => ['reference', 'text'],
                'analysis',
                'generation' => [
                    'intent_summary',
                    'heart_diagnosis',
                    'pastoral_angle',
                    'outline' => ['opening', 'body', 'closing'],
                    'quality' => ['passed', 'reasons'],
                ],
            ],
        ]);

        $meditation = (string) $response->json('data.meditation');
        $this->assertStringContainsString('kaya raya', mb_strtolower($meditation));
    }

    public function test_short_ambiguous_input_still_gets_non_empty_guided_output(): void
    {
        $response = $this->postJson('/api/v1/renungan/personalize', [
            'text' => 'bingung',
            'lang' => 'id',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.analysis.primary_theme', fn (mixed $value) => is_string($value) && $value !== '');
        $response->assertJsonPath('data.generation.quality.passed', fn (mixed $value) => is_bool($value));

        $meditation = (string) $response->json('data.meditation');
        $this->assertGreaterThanOrEqual(90, strlen($meditation));
        $this->assertStringContainsString('bingung', mb_strtolower($meditation));
    }
}
