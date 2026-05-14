<?php

namespace App\Filament\Resources\VerseThemes\Tables;

use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class VerseThemesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title_id')
                    ->label('Title (ID)')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('slug')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('color_key')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'amber' => 'warning',
                        'sky' => 'info',
                        'rose' => 'danger',
                        default => 'gray',
                    }),
                IconColumn::make('is_published')
                    ->boolean()
                    ->sortable(),
                TextColumn::make('sort_order')
                    ->numeric()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->reorderable('sort_order')
            ->defaultSort('sort_order', 'asc');
    }
}
