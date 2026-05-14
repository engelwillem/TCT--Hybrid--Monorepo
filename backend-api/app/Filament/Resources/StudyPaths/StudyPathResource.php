<?php

namespace App\Filament\Resources\StudyPaths;

use App\Filament\Resources\StudyPaths\Pages\CreateStudyPath;
use App\Filament\Resources\StudyPaths\Pages\EditStudyPath;
use App\Filament\Resources\StudyPaths\Pages\ListStudyPaths;
use App\Filament\Resources\StudyPaths\Schemas\StudyPathForm;
use App\Filament\Resources\StudyPaths\Tables\StudyPathsTable;
use App\Models\StudyPath;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class StudyPathResource extends Resource
{
    protected static ?string $model = StudyPath::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMap;

    protected static string|UnitEnum|null $navigationGroup = 'VerseHub Mentor';

    protected static ?string $navigationLabel = 'Study Paths';

    protected static ?int $navigationSort = 40;

    public static function form(Schema $schema): Schema
    {
        return StudyPathForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StudyPathsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStudyPaths::route('/'),
            'create' => CreateStudyPath::route('/create'),
            'edit' => EditStudyPath::route('/{record}/edit'),
        ];
    }
}
