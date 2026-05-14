<?php

namespace App\Enums;

enum WhatsappVerificationStatus: string
{
    case PENDING = 'pending';
    case VERIFIED = 'verified';
    case EXPIRED = 'expired';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
}
