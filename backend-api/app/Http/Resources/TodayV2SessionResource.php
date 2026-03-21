<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TodayV2SessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'contractVersion' => data_get($this->resource, 'contractVersion', 'today-v2.session.v1'),
            'user' => [
                'name' => data_get($this->resource, 'user.name'),
                'avatarInitial' => data_get($this->resource, 'user.avatarInitial'),
            ],
            'greeting' => data_get($this->resource, 'greeting'),
            'dateLabel' => data_get($this->resource, 'dateLabel'),
            'openingLine' => data_get($this->resource, 'openingLine'),
            'verse' => [
                'label' => data_get($this->resource, 'verse.label'),
                'text' => data_get($this->resource, 'verse.text'),
                'reference' => data_get($this->resource, 'verse.reference'),
            ],
            'reflection' => [
                'prompt' => data_get($this->resource, 'reflection.prompt'),
                'placeholder' => data_get($this->resource, 'reflection.placeholder'),
                'ctaLabel' => data_get($this->resource, 'reflection.ctaLabel'),
                'sealedLabel' => data_get($this->resource, 'reflection.sealedLabel'),
            ],
            'prayer' => [
                'label' => data_get($this->resource, 'prayer.label'),
                'text' => data_get($this->resource, 'prayer.text'),
                'ctaLabel' => data_get($this->resource, 'prayer.ctaLabel'),
                'completionLabel' => data_get($this->resource, 'prayer.completionLabel'),
            ],
            'completion' => [
                'title' => data_get($this->resource, 'completion.title'),
                'body' => data_get($this->resource, 'completion.body'),
                'softProgressLabel' => data_get($this->resource, 'completion.softProgressLabel'),
                'progressValue' => data_get($this->resource, 'completion.progressValue'),
                'tomorrowCueLabel' => data_get($this->resource, 'completion.tomorrowCueLabel'),
                'tomorrowCueText' => data_get($this->resource, 'completion.tomorrowCueText'),
            ],
        ];
    }
}
