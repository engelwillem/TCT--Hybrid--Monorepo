<?php

namespace App\Filament\Resources\SsQuarters\Pages;

use App\Filament\Resources\SsQuarters\SsQuarterResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSsQuarters extends ListRecords
{
    protected static string $resource = SsQuarterResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
