<?php

namespace App\Services\Engagement;

use Illuminate\Support\Collection;

class FeedComposerService
{
    /**
     * Apply ranking and variety guard logic to raw feed items.
     */
    public function compose(Collection $rawItems, int $displayLimit = 20, array $excludedVerseRefs = []): Collection
    {
        // 1. Scoring Phase
        $scoredItems = $rawItems->map(function ($item) {
            $item->calculation_score = $this->calculateScore($item);

            return $item;
        })->sortByDesc('calculation_score');

        // 2. Variety Guard Phase (Interleaving & Content Deduplication)
        $finalItems = new Collection;
        $seenText = [];
        $seenVerseRefs = $excludedVerseRefs;
        $pool = $scoredItems->values(); // Reset keys for easy filtering

        while ($finalItems->count() < $displayLimit && $pool->isNotEmpty()) {
            $lastTwo = $finalItems->take(-2);
            $forbiddenType = null;

            // Check if we already have two of the same type
            if ($lastTwo->count() === 2 && $lastTwo->first()->type === $lastTwo->last()->type) {
                $forbiddenType = $lastTwo->first()->type;
            }

            // Find best item that satisfies variety and uniqueness
            $nextIndex = $pool->search(function ($item) use ($forbiddenType, $seenText, $seenVerseRefs) {
                // 1. Type Interleaving Guard
                if ($item->type === $forbiddenType) {
                    return false;
                }

                // 2. Content Deduplication Guard
                // Normalize text: remove whitespace, lowercase, first 100 chars
                $content = trim($item->text ?? '');
                $norm = mb_strtolower(mb_substr($content, 0, 100));
                if ($norm !== '' && in_array($norm, $seenText)) {
                    return false;
                }

                // 3. Verse Reference Guard (specifically for reflections)
                $verseRef = $item->metadata['verse_ref'] ?? $item->metadata['ref'] ?? null;
                if ($verseRef && in_array($verseRef, $seenVerseRefs)) {
                    return false;
                }

                return true;
            });

            if ($nextIndex !== false) {
                $item = $pool->pull($nextIndex);

                // Track selected content
                $content = trim($item->text ?? '');
                $norm = mb_strtolower(mb_substr($content, 0, 100));
                if ($norm !== '') {
                    $seenText[] = $norm;
                }

                $verseRef = $item->metadata['verse_ref'] ?? $item->metadata['ref'] ?? null;
                if ($verseRef) {
                    $seenVerseRefs[] = $verseRef;
                }

                $finalItems->push($item);
            } else {
                // If no unique/varied items remain, take the best one left from the pool
                $item = $pool->shift();
                $finalItems->push($item);
            }
        }

        return $finalItems;
    }

    /**
     * Calculate engagement score based on multiple factors.
     */
    protected function calculateScore($item): float
    {
        $baseScore = 100.0;

        // 1. Freshness Decay (Exponential)
        // Content loses 10% of score every 6 hours
        $hoursOld = $item->created_at ? $item->created_at->diffInHours() : 0;
        $freshnessMultiplier = pow(0.9, $hoursOld / 6);
        $score = $baseScore * $freshnessMultiplier;

        // 2. Urgency Bonus (No One Prays Alone)
        if (($item->type === 'prayer_request' || $item->type === 'prayer') && ($item->pray_count ?? 0) === 0) {
            $score += 50.0; // Significant boost for unanswered prayers
        }

        // 3. Engagement Points
        $engagement = ($item->likes_count ?? 0) * 1.5
            + ($item->pray_count ?? 0) * 2.0
            + ($item->encouraged_count ?? 0) * 2.5
            + ($item->comments_count ?? 0) * 3.0;

        $score += $engagement;

        // 4. Editor Choice / Featured
        if (isset($item->metadata['featured']) && $item->metadata['featured']) {
            $score *= 1.5; // 50% boost for editor-picked content
        }

        return $score;
    }
}
