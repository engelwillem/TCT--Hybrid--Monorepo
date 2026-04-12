<?php

namespace App\Http\Requests\Analytics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ComposerAnalyticsIndexRequest extends FormRequest
{
    public const POST_TYPES = [
        'all',
        'quote',
        'reflection',
        'prayer_request',
        'testimony',
        'user_post',
    ];

    public const MEDIA_FILTERS = [
        'all',
        'with_media',
        'without_media',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'timeframe' => ['nullable', Rule::in(['7d', '30d'])],
            'postType' => ['nullable', Rule::in(self::POST_TYPES)],
            'media' => ['nullable', Rule::in(self::MEDIA_FILTERS)],
        ];
    }
}
