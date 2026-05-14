<?php

namespace App\Enums;

enum SourceType: string
{
    case HUMAN = 'human';
    case OFFICIAL = 'official';
    case AI_ASSISTED = 'ai_assisted';

    public function label(): string
    {
        return match ($this) {
            self::HUMAN => 'Anggota',
            self::OFFICIAL => 'Resmi',
            self::AI_ASSISTED => 'Dibantu AI',
        };
    }
}
