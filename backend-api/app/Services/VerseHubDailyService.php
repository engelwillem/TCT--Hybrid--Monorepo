<?php

namespace App\Services;

use App\Http\Controllers\VerseHubReaderController;
use App\Models\BibleVerse;
use App\Models\Post;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class VerseHubDailyService
{
    private const CHANNEL_SLUG = 'versehub-daily';
    private const DAILY_KIND = 'versehub_daily';
    private const DAILY_TIMEZONE = 'Asia/Jakarta';

    public function getTodayDailyVerse(?Carbon $today = null, string $lang = 'id'): ?array
    {
        if ($lang !== 'id') {
            return null;
        }

        $nowJakarta = Carbon::now(self::DAILY_TIMEZONE);
        $targetDayJakarta = ($today?->copy() ?? $nowJakarta)->timezone(self::DAILY_TIMEZONE);

        $appTimezone = config('app.timezone', 'UTC');
        $startOfDay = $targetDayJakarta->copy()->startOfDay()->timezone($appTimezone);
        $endOfDay = $targetDayJakarta->copy()->endOfDay()->timezone($appTimezone);

        $post = $this->findPostByChannelSlug(
            self::CHANNEL_SLUG,
            $startOfDay,
            $endOfDay,
            $nowJakarta->copy()->timezone($appTimezone),
        );

        if (! $post) {
            return $this->buildFallbackDailyVerseFromBibleDb($targetDayJakarta)
                ?? $this->buildFallbackFromLatestDailyPost($nowJakarta->copy()->timezone($appTimezone));
        }

        $meta = is_array($post->meta) ? $post->meta : [];

        $bookCode = $this->normalizeBookCode((string) ($meta['book_code'] ?? ''));
        $chapter = (int) ($meta['chapter'] ?? 0);
        $verse = (int) ($meta['verse'] ?? 0);

        if ($bookCode === '' || $chapter < 1 || $verse < 1) {
            return $this->buildFallbackDailyVerseFromBibleDb($targetDayJakarta)
                ?? $this->buildFallbackFromLatestDailyPost($nowJakarta->copy()->timezone($appTimezone));
        }

        $ref = "{$bookCode}-{$chapter}-{$verse}";
        $defaultHref = "/versehub/id/{$ref}";

        $ctaHref = trim((string) ($meta['cta_href'] ?? ''));
        if (! $this->isValidCtaHref($ctaHref)) {
            $ctaHref = $defaultHref;
        }

        $quote = trim((string) ($meta['quote'] ?? ''));
        if ($quote === '') {
            $row = BibleVerse::query()
                ->select(['text'])
                ->where('provider', 'ayt')
                ->where('lang', 'id')
                ->where('book_code', $bookCode)
                ->where('chapter', $chapter)
                ->where('verse', $verse)
                ->first();
            $quote = trim((string) ($row?->text ?? ''));
        }

        $bookLabel = VerseHubReaderController::ID_BOOK_LABELS[$bookCode] ?? Str::upper($bookCode);
        $reference = "{$bookLabel} {$chapter}:{$verse}";

        return [
            'ref' => $ref,
            'book_code' => $bookCode,
            'chapter' => $chapter,
            'verse' => $verse,
            'quote' => $quote !== '' ? $quote : null,
            'cta_label' => trim((string) ($meta['cta_label'] ?? '')) ?: 'Baca Alkitab',
            'cta_href' => $ctaHref,
            'source_post_id' => $post->id,
            'reference' => $reference,
            'title' => $post->title,
        ];
    }

    private function normalizeBookCode(string $code): string
    {
        $code = Str::lower(trim($code));
        if ($code === '') {
            return '';
        }

        $aliases = config('versehub_books.aliases', []);
        if (isset($aliases[$code]) && is_string($aliases[$code])) {
            return Str::lower(trim((string) $aliases[$code]));
        }

        return $code;
    }

    private function isValidCtaHref(string $href): bool
    {
        if ($href === '') {
            return false;
        }

        if (Str::startsWith($href, '/')) {
            return true;
        }

        return filter_var($href, FILTER_VALIDATE_URL) !== false;
    }

    private function findPostByChannelSlug(string $slug, Carbon $startOfDay, Carbon $endOfDay, Carbon $nowInAppTz): ?Post
    {
        return Post::query()
            ->whereHas('channel', fn ($q) => $q->where('slug', $slug))
            ->where('status', 'published')
            ->where('publish_at', '<=', $nowInAppTz)
            ->whereBetween('publish_at', [$startOfDay, $endOfDay])
            ->where('meta->kind', self::DAILY_KIND)
            ->orderByDesc('publish_at')
            ->orderByDesc('id')
            ->first();
    }

    private function buildFallbackDailyVerseFromBibleDb(Carbon $targetDayJakarta): ?array
    {
        $baseQuery = BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->where('chapter', '>=', 1)
            ->where('verse', '>=', 1)
            ->whereNotNull('text')
            ->where('text', '<>', '');

        $total = (int) (clone $baseQuery)->count();
        if ($total < 1) {
            return null;
        }

        $offset = abs(crc32($targetDayJakarta->format('Y-m-d'))) % $total;

        $row = (clone $baseQuery)
            ->select(['book_code', 'chapter', 'verse', 'text'])
            ->orderBy('book_code')
            ->orderBy('chapter')
            ->orderBy('verse')
            ->offset($offset)
            ->first();

        if (! $row) {
            return null;
        }

        $bookCode = $this->normalizeBookCode((string) $row->book_code);
        $chapter = (int) $row->chapter;
        $verse = (int) $row->verse;
        if ($bookCode === '' || $chapter < 1 || $verse < 1) {
            return null;
        }

        $ref = "{$bookCode}-{$chapter}-{$verse}";
        $bookLabel = VerseHubReaderController::ID_BOOK_LABELS[$bookCode] ?? Str::upper($bookCode);

        return [
            'ref' => $ref,
            'book_code' => $bookCode,
            'chapter' => $chapter,
            'verse' => $verse,
            'quote' => trim((string) $row->text) ?: null,
            'cta_label' => 'Baca Alkitab',
            'cta_href' => "/versehub/id/{$ref}",
            'source_post_id' => null,
            'reference' => "{$bookLabel} {$chapter}:{$verse}",
            'title' => 'Ayat Hari Ini',
        ];
    }

    private function buildFallbackFromLatestDailyPost(Carbon $nowInAppTz): ?array
    {
        $post = Post::query()
            ->whereHas('channel', fn ($q) => $q->where('slug', self::CHANNEL_SLUG))
            ->where('status', 'published')
            ->where('publish_at', '<=', $nowInAppTz)
            ->where('meta->kind', self::DAILY_KIND)
            ->orderByDesc('publish_at')
            ->orderByDesc('id')
            ->first();

        if (! $post) return null;

        $meta = is_array($post->meta) ? $post->meta : [];
        $bookCode = $this->normalizeBookCode((string) ($meta['book_code'] ?? ''));
        $chapter = (int) ($meta['chapter'] ?? 0);
        $verse = (int) ($meta['verse'] ?? 0);
        $quote = trim((string) ($meta['quote'] ?? ''));
        if ($bookCode === '' || $chapter < 1 || $verse < 1 || $quote === '') {
            return null;
        }

        $ref = "{$bookCode}-{$chapter}-{$verse}";
        $bookLabel = VerseHubReaderController::ID_BOOK_LABELS[$bookCode] ?? Str::upper($bookCode);

        return [
            'ref' => $ref,
            'book_code' => $bookCode,
            'chapter' => $chapter,
            'verse' => $verse,
            'quote' => $quote,
            'cta_label' => trim((string) ($meta['cta_label'] ?? '')) ?: 'Baca Alkitab',
            'cta_href' => trim((string) ($meta['cta_href'] ?? '')) ?: "/versehub/id/{$ref}",
            'source_post_id' => $post->id,
            'reference' => "{$bookLabel} {$chapter}:{$verse}",
            'title' => $post->title ?: 'Ayat Hari Ini',
        ];
    }
}
