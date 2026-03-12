<?php

namespace App\Filament\Resources\DailyContents\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class DailyContentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('date')
                    ->date()
                    ->sortable(),
                TextColumn::make('content_type')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'today_verse' => 'success',
                        'quote_of_day' => 'warning',
                        'reflection_prompt' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'today_verse' => 'Verse',
                        'quote_of_day' => 'Quote',
                        'reflection_prompt' => 'Reflection',
                        default => $state,
                    })
                    ->searchable(),
                TextColumn::make('payload_summary')
                    ->label('Summary')
                    ->state(fn($record) => match ($record->content_type) {
                        'today_verse' => $record->payload['reference'] ?? '-',
                        'quote_of_day' => $record->payload['author'] ?? '-',
                        'reflection_prompt' => str($record->payload['question'] ?? '')->limit(30),
                        default => '-',
                    }),
                TextColumn::make('source_type')
                    ->badge()
                    ->sortable(),
                TextColumn::make('review_status')
                    ->badge()
                    ->color(fn(\App\Enums\ReviewStatus $state): string => $state->color())
                    ->sortable(),
                TextColumn::make('published_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable()
                    ->icon(fn($record) => $record->published_at ? 'heroicon-m-check-circle' : 'heroicon-m-clock')
                    ->iconColor(fn($record) => $record->published_at ? 'success' : 'gray'),
            ])
            ->filters([
                SelectFilter::make('content_type')
                    ->options([
                        'today_verse' => 'Verse',
                        'quote_of_day' => 'Quote',
                        'reflection_prompt' => 'Reflection',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                \Filament\Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-m-check')
                    ->color('success')
                    ->visible(fn($record) => $record->review_status === \App\Enums\ReviewStatus::PENDING)
                    ->action(function ($record) {
                        $record->update([
                            'review_status' => \App\Enums\ReviewStatus::APPROVED,
                            'reviewed_by' => auth()->id(),
                            'reviewed_at' => now(),
                        ]);
                    })
                    ->requiresConfirmation(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
