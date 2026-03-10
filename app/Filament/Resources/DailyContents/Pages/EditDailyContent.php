<?php

namespace App\Filament\Resources\DailyContents\Pages;

use App\Filament\Resources\DailyContents\DailyContentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditDailyContent extends EditRecord
{
    protected static string $resource = DailyContentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
