<?php

namespace App\Filament\Resources\MemberPostComments;

use App\Filament\Resources\MemberPostComments\Pages\CreateMemberPostComment;
use App\Filament\Resources\MemberPostComments\Pages\EditMemberPostComment;
use App\Filament\Resources\MemberPostComments\Pages\ListMemberPostComments;
use App\Filament\Resources\MemberPostComments\Schemas\MemberPostCommentForm;
use App\Filament\Resources\MemberPostComments\Tables\MemberPostCommentsTable;
use App\Models\MemberPostComment;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class MemberPostCommentResource extends Resource
{
    protected static ?string $model = MemberPostComment::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftRight;

    protected static string|UnitEnum|null $navigationGroup = 'Community';

    protected static ?string $navigationLabel = 'Member Comments';

    protected static ?int $navigationSort = 31;

    public static function form(Schema $schema): Schema
    {
        return MemberPostCommentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MemberPostCommentsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMemberPostComments::route('/'),
            'create' => CreateMemberPostComment::route('/create'),
            'edit' => EditMemberPostComment::route('/{record}/edit'),
        ];
    }
}
