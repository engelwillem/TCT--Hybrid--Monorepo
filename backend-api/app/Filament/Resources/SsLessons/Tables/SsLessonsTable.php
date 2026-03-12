<?php

namespace App\Filament\Resources\SsLessons\Tables;

use App\Models\SsDay;
use App\Models\SsLesson;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Carbon;

class SsLessonsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('quarter.title')
                    ->label('Quarter')
                    ->searchable(),
                TextColumn::make('lesson_number')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('title')
                    ->searchable(),
                TextColumn::make('start_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('end_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('quarter_id')
                    ->label('Quarter')
                    ->relationship('quarter', 'title')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('lesson_number')
                    ->options(
                        collect(range(1, 13))
                            ->mapWithKeys(fn (int $n) => [(string) $n => (string) $n])
                            ->all()
                    ),
            ])
            ->defaultSort('start_date', 'desc')
            ->recordActions([
                EditAction::make(),
                Action::make('ensureDays')
                    ->label('Ensure days')
                    ->icon('heroicon-o-calendar-days')
                    ->requiresConfirmation()
                    ->action(function (SsLesson $record): void {
                        $start = Carbon::parse($record->start_date)->startOfDay();
                        $dayKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

                        foreach ($dayKeys as $offset => $dayKey) {
                            $date = $start->copy()->addDays($offset);
                            SsDay::query()->updateOrCreate(
                                [
                                    'lesson_id' => $record->id,
                                    'day_key' => $dayKey,
                                ],
                                [
                                    'date' => $date,
                                    'status' => 'draft',
                                ]
                            );
                        }

                        Notification::make()
                            ->title('Days ensured for lesson')
                            ->success()
                            ->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
