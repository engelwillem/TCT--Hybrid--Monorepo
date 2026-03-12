<?php

namespace App\Services\Engagement;

use App\Models\MemberPost;
use App\Models\MemberPostReaction;
use App\Enums\PostType;
use App\Services\AI\AIContentAssistant;
use App\Services\Engagement\SystemAccountService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class CommunityPulseService
{
    public function __construct(
        protected AIContentAssistant $ai,
        protected SystemAccountService $accounts
    ) {
    }

    /**
     * Generate and save a pulse post to the community feed.
     */
    public function generatePulse(): ?MemberPost
    {
        $data = $this->generateDailyPulse();

        if (!$data) {
            return null;
        }

        $pulseAccount = $this->accounts->getPulse();

        // Avoid double pulse for same period (simple check)
        $exists = MemberPost::where('user_id', $pulseAccount->id)
            ->where('created_at', '>=', now()->startOfDay())
            ->exists();

        if ($exists) {
            return null;
        }

        return MemberPost::create([
            'user_id' => $pulseAccount->id,
            'type' => PostType::COMMUNITY_HIGHLIGHT,
            'source_type' => \App\Enums\SourceType::OFFICIAL,
            'text' => $data['description'],
            'metadata' => $data['metadata'],
            'is_featured' => false,
        ]);
    }

    /**
     * Generate a summary of the community's pulse/vibe for the last 24-48 hours.
     */
    public function generateDailyPulse(): ?array
    {
        $since = Carbon::now()->subHours(48);

        // 1. Gather highlights
        $topPost = MemberPost::query()
            ->where('created_at', '>=', $since)
            ->where('type', '!=', PostType::EDITORIAL)
            ->withCount('reactions')
            ->orderByDesc('reactions_count')
            ->first();

        $prayerCount = MemberPost::where('created_at', '>=', $since)
            ->where('type', PostType::PRAYER_REQUEST)
            ->count();

        // 2. Draft summary using AI (Placeholder logic)
        $summaryTitle = "⚡ Community Pulse";
        $summaryText = $this->composeVibeSummary($topPost, $prayerCount);

        return [
            'title' => $summaryTitle,
            'description' => $summaryText,
            'metadata' => [
                'type' => 'pulse',
                'ai_generated' => true,
                'highlights' => [
                    'popular_post_id' => $topPost?->id,
                    'prayers_requested' => $prayerCount,
                ]
            ]
        ];
    }

    protected function composeVibeSummary(?MemberPost $topPost, int $prayerCount): string
    {
        $text = "Hari ini komunitas kita sangat aktif! ";

        if ($topPost) {
            $text .= "Refleksi dari " . ($topPost->user->name ?? 'seorang jemaat') . " menarik banyak perhatian. ";
        }

        if ($prayerCount > 0) {
            $text .= "Ada {$prayerCount} pokok doa baru yang masuk. Mari terus saling menguatkan dalam doa.";
        } else {
            $text .= "Teruslah berbagi refleksi dan berkat Anda di sini.";
        }

        return $text;
    }
}
