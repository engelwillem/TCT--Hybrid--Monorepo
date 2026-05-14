<?php

namespace App\Filament\Resources\MemberPosts;

use App\Filament\Resources\MemberPosts\Pages\CreateMemberPost;
use App\Filament\Resources\MemberPosts\Pages\EditMemberPost;
use App\Filament\Resources\MemberPosts\Pages\ListMemberPosts;
use App\Filament\Resources\MemberPosts\Schemas\MemberPostForm;
use App\Filament\Resources\MemberPosts\Tables\MemberPostsTable;
use App\Models\MemberPost;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class MemberPostResource extends Resource
{
    protected static ?string $model = MemberPost::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleBottomCenterText;

    protected static string|UnitEnum|null $navigationGroup = 'Community';

    protected static ?string $navigationLabel = 'Member Posts';

    protected static ?int $navigationSort = 30;

    public static function form(Schema $schema): Schema
    {
        return MemberPostForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MemberPostsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMemberPosts::route('/'),
            'create' => CreateMemberPost::route('/create'),
            'edit' => EditMemberPost::route('/{record}/edit'),
        ];
    }
}
