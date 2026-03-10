<?php

namespace App\Filament\Resources\MemberPostComments\Pages;

use App\Filament\Resources\MemberPostComments\MemberPostCommentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditMemberPostComment extends EditRecord
{
    protected static string $resource = MemberPostCommentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

