<?php

namespace App\Filament\Resources\SsDays;

use App\Filament\Resources\SsDays\Pages\CreateSsDay;
use App\Filament\Resources\SsDays\Pages\EditSsDay;
use App\Filament\Resources\SsDays\Pages\ListSsDays;
use App\Filament\Resources\SsDays\Schemas\SsDayForm;
use App\Filament\Resources\SsDays\Tables\SsDaysTable;
use App\Models\SsDay;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SsDayResource extends Resource
{
    protected static ?string $model = SsDay::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'Sabbath School';

    protected static ?string $navigationLabel = 'Days';

    protected static ?int $navigationSort = 22;

    public static function form(Schema $schema): Schema
    {
        return SsDayForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SsDaysTable::configure($table);
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
            'index' => ListSsDays::route('/'),
            'create' => CreateSsDay::route('/create'),
            'edit' => EditSsDay::route('/{record}/edit'),
        ];
    }
}
