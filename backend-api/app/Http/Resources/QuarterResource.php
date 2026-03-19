<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuarterResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'cover_image_url' => $this->cover_image_url,
            // Pre-formatted for UI (avoid raw ISO rendering).
            'date_range_human' => ($this->start_date && $this->end_date)
                ? ($this->start_date->format('d M Y').' – '.$this->end_date->format('d M Y'))
                : null,
        ];
    }
}
