<?php

namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedItemResource extends JsonResource
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
            'type' => $this->type,
            'payload' => $this->payload,
            'priority' => $this->priority,
            'visible_from' => $this->visible_from?->toIso8601String(),
            'visible_until' => $this->visible_until?->toIso8601String(),
        ];
    }
}
