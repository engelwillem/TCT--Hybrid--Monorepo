<?php

namespace App\Enums;

enum ReactionType: string
{
    case LIKE = 'like';
    case PRAY = 'pray';
    case ENCOURAGED = 'encouraged';
    case AMEN = 'amen';

    public function label(): string
    {
        return match ($this) {
            self::LIKE => 'Suka',
            self::PRAY => 'Amin / Doakan',
            self::ENCOURAGED => 'Terberkati',
            self::AMEN => 'Amin',
        };
    }

    public function emoji(): string
    {
        return match ($this) {
            self::LIKE => '❤️',
            self::PRAY => '🙏',
            self::ENCOURAGED => '✨',
            self::AMEN => '🙌',
        };
    }
}
