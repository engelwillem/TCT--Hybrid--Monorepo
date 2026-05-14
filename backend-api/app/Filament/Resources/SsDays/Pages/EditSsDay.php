<?php

namespace App\Filament\Resources\SsDays\Pages;

use App\Filament\Resources\SsDays\SsDayResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSsDay extends EditRecord
{
    protected static string $resource = SsDayResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
