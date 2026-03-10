<?php

namespace App\Filament\Resources\MemberPosts\Pages;

use App\Filament\Resources\MemberPosts\MemberPostResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListMemberPosts extends ListRecords
{
    protected static string $resource = MemberPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

