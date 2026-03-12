<?php

namespace App\Filament\Resources\DailyContents;

use App\Filament\Resources\DailyContents\Pages\CreateDailyContent;
use App\Filament\Resources\DailyContents\Pages\EditDailyContent;
use App\Filament\Resources\DailyContents\Pages\ListDailyContents;
use App\Filament\Resources\DailyContents\Schemas\DailyContentForm;
use App\Filament\Resources\DailyContents\Tables\DailyContentsTable;
use App\Models\DailyContent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DailyContentResource extends Resource
{
    protected static ?string $model = DailyContent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'content_type';

    public static function form(Schema $schema): Schema
    {
        return DailyContentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DailyContentsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDailyContents::route('/'),
            'create' => CreateDailyContent::route('/create'),
            'edit' => EditDailyContent::route('/{record}/edit'),
        ];
    }
}
