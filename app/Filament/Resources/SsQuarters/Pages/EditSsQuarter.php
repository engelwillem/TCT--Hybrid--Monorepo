<?php

namespace App\Filament\Resources\SsQuarters\Pages;

use App\Filament\Resources\SsQuarters\SsQuarterResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSsQuarter extends EditRecord
{
    protected static string $resource = SsQuarterResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
