<?php

namespace App\Filament\Resources\SsLessons\Pages;

use App\Filament\Resources\SsLessons\SsLessonResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSsLessons extends ListRecords
{
    protected static string $resource = SsLessonResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
