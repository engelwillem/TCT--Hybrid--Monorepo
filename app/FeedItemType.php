<?php

namespace App;

enum FeedItemType: string
{
    case Quote = 'quote';
    case Reflection = 'reflection';
    case Community = 'community';
    case Talk = 'talk';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $t) => $t->value, self::cases());
    }
}
