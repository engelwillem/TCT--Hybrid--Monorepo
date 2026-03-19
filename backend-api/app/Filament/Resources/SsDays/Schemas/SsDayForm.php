<?php

namespace App\Filament\Resources\SsDays\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\ToggleButtons;
use Filament\Schemas\Schema;

class SsDayForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('lesson_id')
                    ->relationship('lesson', 'title')
                    ->required(),
                Select::make('day_key')
                    ->options([
                        'sat' => 'Saturday',
                        'sun' => 'Sunday',
                        'mon' => 'Monday',
                        'tue' => 'Tuesday',
                        'wed' => 'Wednesday',
                        'thu' => 'Thursday',
                        'fri' => 'Friday',
                    ])
                    ->required(),
                DatePicker::make('date')
                    ->required(),
                TextInput::make('title'),
                TextInput::make('cover_image_url')
                    ->label('Cover image URL')
                    ->url()
                    ->maxLength(2048),
                Repeater::make('media_links')
                    ->label('Media links (carousel)')
                    ->schema([
                        TextInput::make('url')
                            ->label('URL')
                            ->required()
                            ->maxLength(2048),
                    ])
                    ->default([])
                    ->addActionLabel('Add media URL')
                    ->columnSpanFull(),
                RichEditor::make('content')
                    ->columnSpanFull(),
                ToggleButtons::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                    ])
                    ->inline()
                    ->required()
                    ->default('draft'),
            ]);
    }
}
