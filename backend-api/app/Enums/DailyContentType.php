<?php

namespace App\Enums;

enum DailyContentType: string
{
    case TODAY_VERSE = 'today_verse';
    case QUOTE_OF_DAY = 'quote_of_day';
    case REFLECTION_PROMPT = 'reflection_prompt';
    case PRAYER_PROMPT = 'prayer_prompt';
    case COMMUNITY_HIGHLIGHT = 'community_highlight';

    public function label(): string
    {
        return match ($this) {
            self::TODAY_VERSE => 'Ayat Hari Ini',
            self::QUOTE_OF_DAY => 'Kutipan Hari Ini',
            self::REFLECTION_PROMPT => 'Refleksi Harian',
            self::PRAYER_PROMPT => 'Pokok Doa',
            self::COMMUNITY_HIGHLIGHT => 'Sorotan Komunitas',
        };
    }
}
