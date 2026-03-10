<?php

namespace App\Filament\Resources\MemberPostComments\Pages;

use App\Filament\Resources\MemberPostComments\MemberPostCommentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListMemberPostComments extends ListRecords
{
    protected static string $resource = MemberPostCommentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

