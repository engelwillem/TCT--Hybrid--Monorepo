<?php

namespace App\Console\Commands;

use App\Models\DailyContent;
use App\Models\FeedItem;
use App\Models\MemberPost;
use App\Models\Post;
use App\Models\SsDay;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CleanupDummyData extends Command
{
    protected $signature = 'cleanup:dummy-data {--force : Jalankan tanpa konfirmasi}';

    protected $description = 'Hapus konten dan akun dummy/demo dari database (mode beta).';

    public function handle(): int
    {
        if (! $this->option('force')) {
            $ok = $this->confirm('Aksi ini akan menghapus data dummy/demo. Lanjutkan?', false);
            if (! $ok) {
                $this->warn('Dibatalkan.');

                return self::SUCCESS;
            }
        }

        DB::beginTransaction();
        try {
            $this->cleanupFeedItems();
            $this->cleanupDailyContents();
            $this->cleanupPosts();
            $this->cleanupSabbathPreview();
            $this->cleanupMemberPostsAndDummyUsers();
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Gagal membersihkan dummy data: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info('Dummy content dan dummy users sudah dibersihkan.');

        return self::SUCCESS;
    }

    private function cleanupFeedItems(): void
    {
        $patterns = [
            'Small steps, done daily',
            'Today Feed',
            'Open discussion',
            'How to build a steady spiritual rhythm',
            'What is one thing you can release today',
        ];

        $deleted = FeedItem::query()
            ->get()
            ->filter(function (FeedItem $item) use ($patterns): bool {
                $payload = json_encode($item->payload ?? []);
                if (! is_string($payload)) {
                    return false;
                }
                foreach ($patterns as $pattern) {
                    if (str_contains($payload, $pattern)) {
                        return true;
                    }
                }

                return false;
            })
            ->each(fn (FeedItem $item) => $item->delete())
            ->count();

        $this->line("FeedItem dummy dihapus: {$deleted}");
    }

    private function cleanupDailyContents(): void
    {
        $patterns = [
            'Yeremia 29:11',
            'Nabi Yeremia',
            'Augustine',
            'Apa satu hal yang paling kamu syukuri',
            'Misionaris kita di pedalaman',
            'Iman bukan berarti percaya bahwa Allah bisa melakukannya',
        ];

        $deleted = DailyContent::query()
            ->get()
            ->filter(function (DailyContent $item) use ($patterns): bool {
                $payload = json_encode($item->payload ?? []);
                if (! is_string($payload)) {
                    return false;
                }
                foreach ($patterns as $pattern) {
                    if (str_contains($payload, $pattern)) {
                        return true;
                    }
                }

                return false;
            })
            ->each(fn (DailyContent $item) => $item->delete())
            ->count();

        $this->line("DailyContent dummy dihapus: {$deleted}");
    }

    private function cleanupPosts(): void
    {
        $deleted = Post::query()
            ->where(function ($q) {
                $q->where('title', 'like', '%Sample Post%')
                    ->orWhere('title', 'like', '%First Post%')
                    ->orWhere('title', 'Ayat Hari Ini')
                    ->orWhere('title', 'Daily Verse — FLM 1:15');
            })
            ->orWhere(function ($q) {
                $q->where('content', 'like', '%Konten contoh%')
                    ->orWhere('content', 'like', '%Konten awal channel%')
                    ->orWhere('content', 'like', '%Konten minimal Sabbath School%');
            })
            ->delete();

        $this->line("Post dummy dihapus: {$deleted}");
    }

    private function cleanupSabbathPreview(): void
    {
        $affected = SsDay::query()
            ->where(function ($q) {
                $q->where('title', 'Lesson 1 (Preview)')
                    ->orWhere('content', 'like', '%Konten minimal Sabbath School%');
            })
            ->update([
                'title' => null,
                'content' => null,
                'status' => 'draft',
            ]);

        $this->line("Sabbath preview dummy dibersihkan: {$affected}");
    }

    private function cleanupMemberPostsAndDummyUsers(): void
    {
        $dummyEmails = [
            'admin@example.com',
            'admin@thechoosentalks.com',
            'editor@thechoosentalks.com',
            'encourager@thechoosentalks.com',
            'student@thechoosentalks.com',
        ];

        $dummyUserIds = User::query()
            ->whereIn('email', $dummyEmails)
            ->pluck('id')
            ->all();

        $memberPostDeleted = MemberPost::query()
            ->whereIn('user_id', $dummyUserIds)
            ->orWhere(function ($q) {
                $q->where('title', 'like', '%Kebaikan Tuhan%')
                    ->orWhere('text', 'like', '%konten contoh%')
                    ->orWhere('text', 'like', '%Hari ini saya sangat bersyukur bisa berkumpul kembali dengan keluarga%')
                    ->orWhere('text', 'like', '%Mohon dukungan doa untuk kesembuhan orang tua saya%')
                    ->orWhere('text', 'like', '%Merenungkan Mazmur 23 hari ini%');
            })
            ->delete();

        $this->line("MemberPost dummy dihapus: {$memberPostDeleted}");

        if ($dummyUserIds === []) {
            return;
        }

        $tables = [
            ['table' => 'channel_members', 'column' => 'user_id'],
            ['table' => 'member_posts', 'column' => 'user_id'],
            ['table' => 'member_post_comments', 'column' => 'user_id'],
            ['table' => 'member_post_reactions', 'column' => 'user_id'],
            ['table' => 'member_post_bookmarks', 'column' => 'user_id'],
            ['table' => 'member_post_reports', 'column' => 'user_id'],
            ['table' => 'user_lesson_progress', 'column' => 'user_id'],
            ['table' => 'user_verse_actions', 'column' => 'user_id'],
            ['table' => 'user_journal_drafts', 'column' => 'user_id'],
            ['table' => 'user_metrics', 'column' => 'user_id'],
            ['table' => 'notifications', 'column' => 'notifiable_id'],
            ['table' => 'sessions', 'column' => 'user_id'],
            ['table' => 'user_follows', 'column' => 'follower_id'],
            ['table' => 'user_follows', 'column' => 'followed_id'],
            ['table' => 'direct_messages', 'column' => 'sender_id'],
            ['table' => 'direct_messages', 'column' => 'recipient_id'],
            ['table' => 'user_mentor_sessions', 'column' => 'user_id'],
            ['table' => 'user_study_path_progress', 'column' => 'user_id'],
            ['table' => 'reflection_responses', 'column' => 'user_id'],
            ['table' => 'admin_audit_logs', 'column' => 'actor_id'],
        ];

        foreach ($tables as $target) {
            if (! Schema::hasTable($target['table'])) {
                continue;
            }
            if (! Schema::hasColumn($target['table'], $target['column'])) {
                continue;
            }
            DB::table($target['table'])->whereIn($target['column'], $dummyUserIds)->delete();
        }

        $deletedUsers = User::query()->whereIn('id', $dummyUserIds)->delete();
        $this->line("User dummy dihapus: {$deletedUsers}");
    }
}
