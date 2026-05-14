<?php

namespace App\Enums;

enum AiActivityStatus: string
{
    case SUCCESS = 'success';
    case FAILED = 'failed';
    case FALLBACK = 'fallback';
    case SKIPPED = 'skipped';
}
