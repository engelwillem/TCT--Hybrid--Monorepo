<?php

namespace App\Services\Engagement;

use App\Models\DailyContent;
use App\Models\MemberPost;
use App\Models\MemberPostComment;
use App\Services\AI\AIContentAssistant;
use App\Services\Engagement\SystemAccountService;
use App\Enums\PostType;
use App\Enums\SourceType;
use Illuminate\Support\Facades\Log;

class DailyAutomationService
{
    public function __construct(
        protected SystemAccountService $accounts,
        protected AIContentAssistant $ai
    ) {
    }

    /**
     * Bridge a specific DailyContent to the Community feed.
     */
    public function bridgeDailyContent(DailyContent $content): ?MemberPost
    {
        $shepherd = $this->accounts->getShepherd();

        // Check if already bridged
        $exists = MemberPost::where('user_id', $shepherd->id)
            ->where('daily_content_id', $content->id)
            ->exists();

        if ($exists) {
            return null;
        }

        $postType = $this->mapContentTypeToPostType($content->content_type->value);
        $text = $this->formatContentText($content);

        $post = MemberPost::create([
            'user_id' => $shepherd->id,
            'type' => $postType,
            'source_type' => SourceType::OFFICIAL,
            'text' => $text,
            'metadata' => array_merge($content->payload ?? [], [
                'is_official' => true,
            ]),
            'is_featured' => true,
            'daily_content_id' => $content->id,
        ]);

        return $post;
    }

    /**
     * Add an AI-generated starter comment to a post.
     */
    public function ignitePost(MemberPost $post): ?MemberPostComment
    {
        $encourager = $this->accounts->getEncourager();

        // Avoid double ignition
        $exists = MemberPostComment::where('member_post_id', $post->id)
            ->where('user_id', $encourager->id)
            ->exists();

        if ($exists) {
            return null;
        }

        $ignitionText = $this->ai->generateIgnitionComment($post);

        return MemberPostComment::create([
            'member_post_id' => $post->id,
            'user_id' => $encourager->id,
            'body' => $ignitionText,
        ]);
    }

    protected function mapContentTypeToPostType(string $contentType): PostType
    {
        return match ($contentType) {
            'today_verse' => PostType::VERSE_REFLECTION,
            'quote_of_day' => PostType::REFLECTION,
            'reflection_prompt' => PostType::REFLECTION,
            'prayer_prompt' => PostType::PRAYER_REQUEST,
            'community_highlight' => PostType::COMMUNITY_HIGHLIGHT,
            default => PostType::EDITORIAL,
        };
    }

    protected function formatContentText(DailyContent $content): string
    {
        $payload = $content->payload;

        return match ($content->content_type->value) {
            'today_verse' => "📖 **Ayat Hari Ini:**\n\n_" . ($payload['text'] ?? '') . "_\n\n— " . ($payload['reference'] ?? ''),
            'quote_of_day' => "✍️ **Kutipan Rohani:**\n\n\"" . ($payload['text'] ?? '') . "\"\n\n— " . ($payload['author'] ?? ''),
            'reflection_prompt' => "🤔 **Mari Berefleksi:**\n\n" . ($payload['question'] ?? ''),
            'prayer_prompt' => "🙏 **Mari Berdoa:**\n\n" . ($payload['theme'] ?? '') . "\n\n" . ($payload['target'] ?? ''),
            default => $payload['title'] ?? 'Pengumuman Komunitas',
        };
    }
}
