<?php

namespace App\Enums;

enum ChannelType: string
{
    case SABBATH_SCHOOL = 'sabbath_school';
    case WEEKLY = 'weekly';
    case PUBLIC = 'public';
    case PRIVATE = 'private';
    case ARCHIVED = 'archived';
    case COMMUNITY = 'community';
    case VERSEHUB_DAILY = 'versehub-daily';

    public function label(): string
    {
        return match ($this) {
            self::SABBATH_SCHOOL => 'Sabbath School',
            self::WEEKLY => 'Weekly',
            self::PUBLIC => 'Publik',
            self::PRIVATE => 'Privat / Terbatas',
            self::ARCHIVED => 'Arsip',
            self::COMMUNITY => 'Komunitas',
            self::VERSEHUB_DAILY => 'VerseHub Daily',
        };
    }
}
