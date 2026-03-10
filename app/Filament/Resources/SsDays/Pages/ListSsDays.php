<?php

namespace App\Filament\Resources\SsDays\Pages;

use App\Filament\Resources\SsDays\SsDayResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSsDays extends ListRecords
{
    protected static string $resource = SsDayResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
