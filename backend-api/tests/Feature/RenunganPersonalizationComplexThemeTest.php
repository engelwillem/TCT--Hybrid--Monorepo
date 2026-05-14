<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RenunganPersonalizationComplexThemeTest extends TestCase
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
                'reference' => 'Mazmur 46:2',
                'text' => 'Allah itu bagi kita tempat perlindungan dan kekuatan, sebagai penolong dalam kesesakan sangat terbukti.',
                'book_code' => 'PSA',
                'chapter' => 46,
                'verse' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (! DB::table('verse_pastoral_notes')->where('lang', 'id')->where('theme_slug', 'ministry_disillusionment')->exists()) {
            DB::table('verse_pastoral_notes')->insert([
                'verse_ref' => 'psa-46-2',
                'lang' => 'id',
                'theme_slug' => 'ministry_disillusionment',
                'tone_slug' => 'restorative',
                'priority' => 50,
                'is_active' => true,
                'main_message' => 'Tuhan tetap memelihara dalam konflik panggilan.',
                'application_text' => 'Ambil jeda, evaluasi batas sehat, dan cari dukungan rohani.',
                'hope_text' => 'Ada jalan pemulihan yang tetap setia pada panggilan Tuhan.',
                'prayer_direction' => 'Tuhan, pulihkan hati dan beri hikmat melangkah.',
                'language_style' => 'plain',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

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
