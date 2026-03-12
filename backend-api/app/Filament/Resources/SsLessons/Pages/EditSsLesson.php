<?php

namespace App\Filament\Resources\SsLessons\Pages;

use App\Filament\Resources\SsLessons\SsLessonResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSsLesson extends EditRecord
{
    protected static string $resource = SsLessonResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
