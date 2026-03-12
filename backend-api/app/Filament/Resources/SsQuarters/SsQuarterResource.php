<?php

namespace App\Filament\Resources\SsQuarters;

use App\Filament\Resources\SsQuarters\Pages\CreateSsQuarter;
use App\Filament\Resources\SsQuarters\Pages\EditSsQuarter;
use App\Filament\Resources\SsQuarters\Pages\ListSsQuarters;
use App\Filament\Resources\SsQuarters\Schemas\SsQuarterForm;
use App\Filament\Resources\SsQuarters\Tables\SsQuartersTable;
use App\Models\SsQuarter;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SsQuarterResource extends Resource
{
    protected static ?string $model = SsQuarter::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'Sabbath School';

    protected static ?string $navigationLabel = 'Quarters';

    protected static ?int $navigationSort = 20;

    public static function form(Schema $schema): Schema
    {
        return SsQuarterForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SsQuartersTable::configure($table);
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
            'index' => ListSsQuarters::route('/'),
            'create' => CreateSsQuarter::route('/create'),
            'edit' => EditSsQuarter::route('/{record}/edit'),
        ];
    }
}
