<?php

namespace App\Filament\Resources\DailyContents\Pages;

use App\Filament\Resources\DailyContents\DailyContentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListDailyContents extends ListRecords
{
    protected static string $resource = DailyContentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
