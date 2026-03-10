<?php

namespace App\Filament\Resources\VerseRelationships\Schemas;

use Filament\Schemas\Components\Select;
use Filament\Schemas\Components\TextInput;
use Filament\Schemas\Schema;

class VerseRelationshipForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('from_ref')
                    ->label('From Verse Ref')
                    ->placeholder('e.g. yoh-3-16')
                    ->required(),
                TextInput::make('to_ref')
                    ->label('To Verse Ref')
                    ->placeholder('e.g. mzm-51-1')
                    ->required(),
                Select::make('relation_type')
                    ->options([
                        'parallel' => 'Parallel',
                        'prophecy' => 'Prophecy/Fulfillment',
                        'clarification' => 'Clarification',
                        'thematic' => 'Thematic connection',
                    ])
                    ->required(),
                TextInput::make('strength')
                    ->numeric()
                    ->default(1)
                    ->minValue(1)
                    ->maxValue(5),
            ]);
    }
}
