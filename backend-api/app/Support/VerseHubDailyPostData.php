<?php

namespace App\Support;

use App\Models\Channel;
use App\Models\Post;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class VerseHubDailyPostData
{
    private const CHANNEL_SLUG = 'versehub-daily';

    private const DAILY_KIND = 'versehub_daily';

    private const DAILY_TIMEZONE = 'Asia/Jakarta';

    public static function mutate(array $data, ?int $ignorePostId = null): array
    {
        $channel = isset($data['channel_id'])
            ? Channel::query()->whereKey($data['channel_id'])->first()
            : null;

        if ($channel?->slug !== self::CHANNEL_SLUG) {
            return $data;
        }

        $meta = is_array($data['meta'] ?? null) ? $data['meta'] : [];
        $meta['kind'] = self::DAILY_KIND;

        $book = self::normalizeBookCode((string) ($meta['book_code'] ?? ''));
        $chapter = (int) ($meta['chapter'] ?? 0);
        $verse = (int) ($meta['verse'] ?? 0);

        $errors = [];
        if ($book === '') {
            $errors['meta.book_code'] = 'Book code wajib diisi untuk VerseHub Daily.';
        }
        if ($chapter < 1) {
            $errors['meta.chapter'] = 'Chapter harus angka minimal 1.';
        }
        if ($verse < 1) {
            $errors['meta.verse'] = 'Verse harus angka minimal 1.';
        }

        $ctaHref = trim((string) ($meta['cta_href'] ?? ''));
        if ($ctaHref !== '' && ! self::isValidCtaHref($ctaHref)) {
            $errors['meta.cta_href'] = 'CTA href harus URL valid atau path relatif yang diawali /.';
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        $meta['book_code'] = $book;
        $meta['chapter'] = $chapter;
        $meta['verse'] = $verse;
        $meta['cta_label'] = trim((string) ($meta['cta_label'] ?? '')) ?: 'Baca Alkitab hari ini';
        $meta['cta_href'] = $ctaHref !== '' ? $ctaHref : "/versehub/id/{$book}-{$chapter}-{$verse}";

        $data['meta'] = $meta;
        $data['title'] = trim((string) ($data['title'] ?? '')) ?: sprintf(
            'Daily Verse — %s %d:%d',
            Str::upper($book),
            $chapter,
            $verse
        );

        if (($data['status'] ?? null) === 'published') {
            self::ensureUniquePublishedPerJakartaDate($data, $ignorePostId);
        }

        return $data;
    }

    private static function ensureUniquePublishedPerJakartaDate(array $data, ?int $ignorePostId): void
    {
        $publishAtRaw = $data['publish_at'] ?? null;
        if (! $publishAtRaw) {
            throw ValidationException::withMessages([
                'publish_at' => 'Publish at wajib diisi untuk validasi Daily Verse.',
            ]);
        }

        try {
            $publishAt = Carbon::parse((string) $publishAtRaw, config('app.timezone', 'UTC'));
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'publish_at' => 'Format publish at tidak valid.',
            ]);
        }

        $appTimezone = config('app.timezone', 'UTC');
        $publishAtJakarta = $publishAt->copy()->timezone(self::DAILY_TIMEZONE);
        $dayStart = $publishAtJakarta->copy()->startOfDay()->timezone($appTimezone);
        $dayEnd = $publishAtJakarta->copy()->endOfDay()->timezone($appTimezone);

        $exists = Post::query()
            ->whereHas('channel', fn ($q) => $q->where('slug', self::CHANNEL_SLUG))
            ->where('status', 'published')
            ->where('meta->kind', self::DAILY_KIND)
            ->whereBetween('publish_at', [$dayStart, $dayEnd])
            ->when($ignorePostId, fn ($q) => $q->whereKeyNot($ignorePostId))
            ->exists();

        if ($exists) {
            $dateLabel = $publishAtJakarta->format('d M Y');
            throw ValidationException::withMessages([
                'publish_at' => "Daily Verse untuk tanggal {$dateLabel} (Asia/Jakarta) sudah ada.",
            ]);
        }
    }

    private static function normalizeBookCode(string $code): string
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

    private static function isValidCtaHref(string $href): bool
    {
        if (Str::startsWith($href, '/')) {
            return true;
        }

        return filter_var($href, FILTER_VALIDATE_URL) !== false;
    }
}
