<?php

namespace App\Filament\Resources\VerseRelationships\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class VerseRelationshipsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('from_ref')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('to_ref')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('relation_type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'parallel' => 'info',
                        'prophecy' => 'success',
                        'clarification' => 'warning',
                        'thematic' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('strength')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ]);
    }
}
