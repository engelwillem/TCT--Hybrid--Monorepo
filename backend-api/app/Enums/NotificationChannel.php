<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case IN_APP = 'in_app';
    case EMAIL = 'email';
    case WHATSAPP = 'whatsapp';
}
