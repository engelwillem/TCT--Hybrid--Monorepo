<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RenunganPersonalizationTelemetryTest extends TestCase
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
                'reference' => 'Yesaya 41:10',
                'text' => 'Jangan takut, sebab Aku ini menyertai engkau.',
                'book_code' => 'ISA',
                'chapter' => 41,
                'verse' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function test_personalization_includes_debug_telemetry_snapshot_without_raw_text(): void
    {
        $response = $this
            ->withHeaders(['X-Renungan-Debug-Telemetry' => '1'])
            ->postJson('/api/v1/renungan/personalize', [
                'text' => 'saya lagi bingung soal keputusan kerja dan masa depan',
                'lang' => 'id',
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'meditation',
                'verse' => ['reference', 'text'],
                'generation' => [
                    'quality' => ['passed', 'reasons'],
                    'telemetry_debug' => [
                        'request_id',
                        'pipeline_version',
                        'input_length_bucket',
                        'analysis_duration_ms',
                        'verse_query_duration_ms',
                        'verse_selection_duration_ms',
                        'interpretation_duration_ms',
                        'generation_duration_ms',
                        'evaluation_duration_ms',
                        'mentor_duration_ms',
                        'total_duration_ms',
                        'candidate_count',
                        'selected_verse_count',
                        'fallback_verse_used',
                        'fallback_meditation_used',
                        'quality_rewrite_triggered',
                        'mentor_provider',
                        'mentor_model',
                        'mentor_success',
                        'mentor_fallback',
                        'rewrite_triggered',
                        'quality_passed_initial',
                        'quality_passed_final',
                        'evaluation_reasons',
                        'used_fallback_content',
                        'contains_raw_reflection',
                    ],
                ],
            ],
        ]);

        $telemetry = (array) $response->json('data.generation.telemetry_debug');
        $this->assertSame(false, $telemetry['contains_raw_reflection'] ?? true);
        $serialized = json_encode($telemetry);
        $this->assertIsString($serialized);
        $this->assertStringNotContainsString('bingung soal keputusan kerja', (string) $serialized);
        $this->assertIsInt($telemetry['candidate_count'] ?? null);
        $this->assertIsInt($telemetry['selected_verse_count'] ?? null);
        $this->assertIsBool($telemetry['fallback_verse_used'] ?? null);
        $this->assertIsBool($telemetry['fallback_meditation_used'] ?? null);
        $this->assertIsBool($telemetry['quality_rewrite_triggered'] ?? null);
        $this->assertIsBool($telemetry['mentor_success'] ?? null);
        $this->assertIsBool($telemetry['mentor_fallback'] ?? null);
        $this->assertIsString($telemetry['mentor_provider'] ?? '');
    }

    public function test_force_rewrite_debug_mode_marks_rewrite_triggered(): void
    {
        $response = $this
            ->withHeaders([
                'X-Renungan-Debug-Telemetry' => '1',
                'X-Renungan-Debug-Force' => 'rewrite',
            ])
            ->postJson('/api/v1/renungan/personalize', [
                'text' => 'saya mau jadi kaya raya',
                'lang' => 'id',
            ]);

        $response->assertOk();
        $telemetry = (array) $response->json('data.generation.telemetry_debug');

        $this->assertTrue((bool) ($telemetry['rewrite_triggered'] ?? false));
        $this->assertSame(1, (int) ($telemetry['rewrite_count'] ?? 0));
        $this->assertFalse((bool) ($telemetry['quality_passed_initial'] ?? true));
        $this->assertContains(
            'debug_force_quality_fail_initial',
            (array) ($telemetry['initial_evaluation_reasons'] ?? [])
        );
    }

    public function test_force_fallback_debug_mode_marks_fallback_and_failure_reason(): void
    {
        $response = $this
            ->withHeaders([
                'X-Renungan-Debug-Telemetry' => '1',
                'X-Renungan-Debug-Force' => 'fallback',
            ])
            ->postJson('/api/v1/renungan/personalize', [
                'text' => 'saya sangat marah dan bingung',
                'lang' => 'id',
            ]);

        $response->assertOk();
        $telemetry = (array) $response->json('data.generation.telemetry_debug');
        $reasons = (array) ($telemetry['evaluation_reasons'] ?? []);

        $this->assertTrue((bool) ($telemetry['rewrite_triggered'] ?? false));
        $this->assertTrue((bool) ($telemetry['used_fallback_content'] ?? false));
        $this->assertFalse((bool) ($telemetry['quality_passed_final'] ?? true));
        $this->assertContains('rewrite_failed_to_improve', $reasons);
        $this->assertContains('fallback_due_to_invalid_output', $reasons);
    }
}
