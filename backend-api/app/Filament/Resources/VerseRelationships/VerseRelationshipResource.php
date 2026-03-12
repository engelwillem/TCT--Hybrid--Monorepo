<?php

namespace App\Filament\Resources\VerseRelationships;

use App\Filament\Resources\VerseRelationships\Pages\CreateVerseRelationship;
use App\Filament\Resources\VerseRelationships\Pages\EditVerseRelationship;
use App\Filament\Resources\VerseRelationships\Pages\ListVerseRelationships;
use App\Filament\Resources\VerseRelationships\Schemas\VerseRelationshipForm;
use App\Filament\Resources\VerseRelationships\Tables\VerseRelationshipsTable;
use App\Models\VerseRelationship;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class VerseRelationshipResource extends Resource
{
    protected static ?string $model = VerseRelationship::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedLink;

    protected static string|UnitEnum|null $navigationGroup = 'VerseHub Mentor';

    protected static ?string $navigationLabel = 'Verse Relationships';

    protected static ?int $navigationSort = 20;

    public static function form(Schema $schema): Schema
    {
        return VerseRelationshipForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return VerseRelationshipsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListVerseRelationships::route('/'),
            'create' => CreateVerseRelationship::route('/create'),
            'edit' => EditVerseRelationship::route('/{record}/edit'),
        ];
    }
}
