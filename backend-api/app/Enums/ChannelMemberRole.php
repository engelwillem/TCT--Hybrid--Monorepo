<?php

namespace App\Enums;

enum ChannelMemberRole: string
{
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MODERATOR = 'moderator';
    case MEMBER = 'member';

    public function label(): string
    {
        return match ($this) {
            self::OWNER => 'Pemilik',
            self::ADMIN => 'Administrator',
            self::MODERATOR => 'Moderator',
            self::MEMBER => 'Anggota',
        };
    }
}
