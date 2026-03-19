<?php

namespace Tests\Feature;

use App\Models\BibleVerse;
use App\Models\StudyPath;
use App\Models\StudyPathStep;
use App\Models\User;
use App\Models\UserStudyPathProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerseHubStudyAndMentorGuardrailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_ask_is_rate_limited_after_ten_requests_per_hour(): void
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

        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($user)
                ->postJson('/versehub/id/yoh-3-16/mentor/ask', [
                    'question' => 'Apa makna ayat ini?',
                ])
                ->assertOk();
        }

        $this->actingAs($user)
            ->postJson('/versehub/id/yoh-3-16/mentor/ask', [
                'question' => 'Lanjutan pertanyaan',
            ])
            ->assertStatus(429);
    }

    public function test_study_path_progress_uses_last_step_order_and_marks_completion_on_final_step(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $path = StudyPath::query()->create([
            'slug' => 'who-is-jesus',
            'title_id' => 'Siapa Yesus',
            'title_en' => 'Who Is Jesus',
            'description_id' => 'Mengenal Yesus dari Alkitab',
            'description_en' => 'Knowing Jesus from Scripture',
            'cover_color' => 'amber',
            'difficulty' => 'beginner',
            'estimated_minutes' => 20,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        $step1 = StudyPathStep::query()->create([
            'path_id' => $path->id,
            'step_order' => 1,
            'verse_ref' => 'yoh-1-1',
            'lang' => 'id',
            'focus_question' => 'Siapakah Firman itu?',
        ]);

        $step2 = StudyPathStep::query()->create([
            'path_id' => $path->id,
            'step_order' => 2,
            'verse_ref' => 'yoh-1-14',
            'lang' => 'id',
            'focus_question' => 'Apa arti Firman menjadi manusia?',
        ]);

        $this->actingAs($user)
            ->post("/versehub/id/study/{$path->slug}/complete/{$step1->id}")
            ->assertRedirect();

        $progress = UserStudyPathProgress::query()
            ->where('user_id', $user->id)
            ->where('path_id', $path->id)
            ->first();

        $this->assertNotNull($progress);
        $this->assertSame(1, (int) $progress->last_step_order);
        $this->assertNull($progress->completed_at);

        $this->actingAs($user)
            ->post("/versehub/id/study/{$path->slug}/complete/{$step2->id}")
            ->assertRedirect();

        $progress = UserStudyPathProgress::query()
            ->where('user_id', $user->id)
            ->where('path_id', $path->id)
            ->first();

        $this->assertNotNull($progress);
        $this->assertSame(2, (int) $progress->last_step_order);
        $this->assertNotNull($progress->completed_at);
    }
}
