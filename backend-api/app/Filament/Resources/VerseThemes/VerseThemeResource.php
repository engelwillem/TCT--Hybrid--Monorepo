<?php

namespace App\Filament\Resources\VerseThemes;

use App\Filament\Resources\VerseThemes\Pages\CreateVerseTheme;
use App\Filament\Resources\VerseThemes\Pages\EditVerseTheme;
use App\Filament\Resources\VerseThemes\Pages\ListVerseThemes;
use App\Filament\Resources\VerseThemes\Schemas\VerseThemeForm;
use App\Filament\Resources\VerseThemes\Tables\VerseThemesTable;
use App\Models\VerseTheme;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class VerseThemeResource extends Resource
{
    protected static ?string $model = VerseTheme::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBookmark;

    protected static string|UnitEnum|null $navigationGroup = 'VerseHub Mentor';

    protected static ?string $navigationLabel = 'Verse Themes';

    protected static ?int $navigationSort = 30;

    public static function form(Schema $schema): Schema
    {
        return VerseThemeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return VerseThemesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListVerseThemes::route('/'),
            'create' => CreateVerseTheme::route('/create'),
            'edit' => EditVerseTheme::route('/{record}/edit'),
        ];
    }
}
