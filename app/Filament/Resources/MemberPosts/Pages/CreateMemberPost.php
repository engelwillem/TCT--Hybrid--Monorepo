<?php

namespace App\Filament\Resources\MemberPosts\Pages;

use App\Filament\Resources\MemberPosts\MemberPostResource;
use Filament\Resources\Pages\CreateRecord;

class CreateMemberPost extends CreateRecord
{
    protected static string $resource = MemberPostResource::class;
}

