<?php

namespace App\Filament\Resources\MemberPosts\Pages;

use App\Filament\Resources\MemberPosts\MemberPostResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditMemberPost extends EditRecord
{
    protected static string $resource = MemberPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
