<?php

namespace App\Filament\Resources\VerseThemes\Schemas;

use Filament\Schemas\Components\Checkbox;
use Filament\Schemas\Components\Textarea;
use Filament\Schemas\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class VerseThemeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title_id')
                    ->label('Title (ID)')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn(string $operation, $state, $set) => $operation === 'create' ? $set('slug', Str::slug($state)) : null),
                TextInput::make('title_en')
                    ->label('Title (EN)')
                    ->required(),
                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true),
                Textarea::make('description_id')
                    ->label('Description (ID)')
                    ->rows(3),
                Textarea::make('description_en')
                    ->label('Description (EN)')
                    ->rows(3),
                TextInput::make('color_key')
                    ->placeholder('e.g. amber, sky, rose'),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Checkbox::make('is_published')
                    ->default(true),
            ]);
    }
}
