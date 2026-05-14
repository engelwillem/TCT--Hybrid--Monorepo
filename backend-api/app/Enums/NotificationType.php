<?php

namespace App\Enums;

enum NotificationType: string
{
    case NEW_REACTION = 'new_reaction';
    case NEW_COMMENT = 'new_comment';
    case RITUAL_REMINDER = 'ritual_reminder';
    case SYSTEM_ALERT = 'system_alert';

    public function icon(): string
    {
        return match ($this) {
            self::NEW_REACTION => 'heart',
            self::NEW_COMMENT => 'message-square',
            self::RITUAL_REMINDER => 'bell',
            self::SYSTEM_ALERT => 'shield-alert',
        };
    }
}
