<?php

namespace App\Filament\Resources\SsLessons;

use App\Filament\Resources\SsLessons\Pages\CreateSsLesson;
use App\Filament\Resources\SsLessons\Pages\EditSsLesson;
use App\Filament\Resources\SsLessons\Pages\ListSsLessons;
use App\Filament\Resources\SsLessons\Schemas\SsLessonForm;
use App\Filament\Resources\SsLessons\Tables\SsLessonsTable;
use App\Models\SsLesson;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class SsLessonResource extends Resource
{
    protected static ?string $model = SsLesson::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'Sabbath School';

    protected static ?string $navigationLabel = 'Lessons';

    protected static ?int $navigationSort = 21;

    public static function form(Schema $schema): Schema
    {
        return SsLessonForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SsLessonsTable::configure($table);
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
            'index' => ListSsLessons::route('/'),
            'create' => CreateSsLesson::route('/create'),
            'edit' => EditSsLesson::route('/{record}/edit'),
        ];
    }
}
