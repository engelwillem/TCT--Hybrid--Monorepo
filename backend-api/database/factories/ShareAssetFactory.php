<?php

namespace Database\Factories;

use App\Models\ShareAsset;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ShareAsset>
 */
class ShareAssetFactory extends Factory
{
    protected $model = ShareAsset::class;

    public function definition(): array
    {
        $surface = $this->faker->randomElement(['community', 'versehub', 'renungan']);

        return [
            'surface'           => $surface,
            'subject_type'      => match ($surface) {
                'community' => 'community_post',
                'versehub'  => 'versehub_verse',
                'renungan'  => 'renungan_snapshot',
                default     => 'unknown',
            },
            'subject_id'        => (string) $this->faker->numberBetween(1, 9999),
            'lang'              => 'id',
            'revision'          => substr(sha1(Str::random(40)), 0, 16),
            'prompt_version'    => 'v1',
            'style_version'     => 'v1',
            'status'            => 'ready',
            'share_title'       => $this->faker->sentence(4),
            'share_description' => $this->faker->sentence(12),
            'share_eyebrow'     => $this->faker->randomElement(['Community Share', 'VerseHub Share', 'Renungan Share']),
            'og_style'          => 'scripture',
            'source_image_url'  => null,
            'final_og_image_url' => null,
            'share_meta'        => null,
            'failure_count'     => 0,
            'error_message'     => null,
        ];
    }

    public function ready(): static
    {
        return $this->state(fn () => ['status' => 'ready']);
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending']);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status'        => 'failed',
            'error_message' => 'AI generation failed',
            'failure_count' => 1,
        ]);
    }
}
