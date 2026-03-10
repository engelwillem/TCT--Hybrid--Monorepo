<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
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
            'quarter_id' => $this->quarter_id,
            'day_number' => $this->day_number,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'estimated_minutes' => $this->estimated_minutes,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
