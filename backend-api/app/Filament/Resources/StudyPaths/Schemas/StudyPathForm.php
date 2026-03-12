<?php

namespace App\Filament\Resources\StudyPaths\Schemas;

use Filament\Schemas\Components\Checkbox;
use Filament\Schemas\Components\Select;
use Filament\Schemas\Components\Textarea;
use Filament\Schemas\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class StudyPathForm
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
                TextInput::make('cover_color')
                    ->placeholder('e.g. from-amber-900 to-slate-900'),
                Select::make('difficulty')
                    ->options([
                        'beginner' => 'Beginner',
                        'intermediate' => 'Intermediate',
                        'advanced' => 'Advanced',
                    ])
                    ->default('beginner')
                    ->required(),
                TextInput::make('estimated_minutes')
                    ->numeric()
                    ->default(15),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Checkbox::make('is_published')
                    ->default(true),
            ]);
    }
}
