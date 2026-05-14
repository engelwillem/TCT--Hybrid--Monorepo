<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'surface',
        'subject_type',
        'subject_id',
        'lang',
        'revision',
        'prompt_version',
        'style_version',
        'status',
        'share_title',
        'share_description',
        'share_eyebrow',
        'share_meta',
        'og_style',
        'source_image_url',
        'generated_image_url',
        'final_og_image_url',
        'error_message',
        'failure_count',
    ];

    protected $casts = [
        'share_meta' => 'array',
        'failure_count' => 'integer',
    ];

    public function isReady(): bool
    {
        return $this->status === 'ready';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Resolve the best available OG image URL for this asset.
     */
    public function resolveOgImageUrl(): ?string
    {
        return $this->final_og_image_url
            ?? $this->generated_image_url
            ?? $this->source_image_url
            ?? null;
    }

    /**
     * Find the most recent ready asset for a given surface + subject + revision.
     */
    public static function findReady(string $surface, string $subjectId, string $revision): ?self
    {
        return self::query()
            ->where('surface', $surface)
            ->where('subject_id', $subjectId)
            ->where('revision', $revision)
            ->where('status', 'ready')
            ->latest()
            ->first();
    }

    /**
     * Find any existing asset record (pending/ready/failed) for surface+subject+revision.
     */
    public static function findForRevision(string $surface, string $subjectId, string $revision): ?self
    {
        return self::query()
            ->where('surface', $surface)
            ->where('subject_id', $subjectId)
            ->where('revision', $revision)
            ->latest()
            ->first();
    }
}
