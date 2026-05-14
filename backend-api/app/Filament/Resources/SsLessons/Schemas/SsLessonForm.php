<?php

namespace App\Filament\Resources\SsLessons\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SsLessonForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('quarter_id')
                    ->relationship('quarter', 'title')
                    ->required(),
                TextInput::make('lesson_number')
                    ->required()
                    ->numeric(),
                TextInput::make('title'),
                DatePicker::make('start_date')
                    ->required(),
                DatePicker::make('end_date')
                    ->required(),
            ]);
    }
}
