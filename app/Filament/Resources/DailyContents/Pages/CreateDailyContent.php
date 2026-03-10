<?php

namespace App\Filament\Resources\DailyContents\Pages;

use App\Filament\Resources\DailyContents\DailyContentResource;
use Filament\Resources\Pages\CreateRecord;

class CreateDailyContent extends CreateRecord
{
    protected static string $resource = DailyContentResource::class;
}
