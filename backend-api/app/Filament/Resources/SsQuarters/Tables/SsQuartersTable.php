<?php

namespace App\Filament\Resources\SsQuarters\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\Action;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Filament\Notifications\Notification;

class SsQuartersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('year')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('quarter')
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
                IconColumn::make('is_active')
                    ->boolean(),
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
                SelectFilter::make('year')
                    ->options(
                        SsQuarter::query()
                            ->orderByDesc('year')
                            ->pluck('year', 'year')
                            ->mapWithKeys(fn ($v, $k) => [(string) $k => (string) $v])
                            ->all()
                    ),
                SelectFilter::make('quarter')
                    ->options([
                        '1' => 'Q1',
                        '2' => 'Q2',
                        '3' => 'Q3',
                        '4' => 'Q4',
                    ]),
                TernaryFilter::make('is_active')
                    ->label('Active'),
            ])
            ->defaultSort('year', 'desc')
            ->recordActions([
                EditAction::make(),
                Action::make('setActive')
                    ->label('Set active')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (SsQuarter $record) => ! $record->is_active)
                    ->requiresConfirmation()
                    ->action(function (SsQuarter $record): void {
                        DB::transaction(function () use ($record) {
                            SsQuarter::query()->where('is_active', true)->update(['is_active' => false]);
                            $record->forceFill(['is_active' => true])->save();
                        });

                        Notification::make()
                            ->title('Active quarter updated')
                            ->success()
                            ->send();
                    }),
                Action::make('generate')
                    ->label('Generate lessons & days')
                    ->icon('heroicon-o-sparkles')
                    ->requiresConfirmation()
                    ->modalHeading('Generate lessons & days')
                    ->modalDescription('Akan membuat 13 lessons dan 7 days per lesson (Sat–Fri) untuk quarter ini. Tidak akan menduplikasi jika sudah ada (berdasarkan lesson_number dan day_key).')
                    ->action(function (SsQuarter $record) {
                        DB::transaction(function () use ($record) {
                            $quarterStart = Carbon::parse($record->start_date)->startOfDay();

                            for ($lessonNumber = 1; $lessonNumber <= 13; $lessonNumber++) {
                                $lessonStart = $quarterStart->copy()->addDays(($lessonNumber - 1) * 7);
                                $lessonEnd = $lessonStart->copy()->addDays(6);

                                $lesson = SsLesson::query()->firstOrCreate(
                                    [
                                        'quarter_id' => $record->id,
                                        'lesson_number' => $lessonNumber,
                                    ],
                                    [
                                        'title' => null,
                                        'start_date' => $lessonStart,
                                        'end_date' => $lessonEnd,
                                    ]
                                );

                                // Ensure dates are aligned (in case quarter start date was edited later)
                                $lesson->forceFill([
                                    'start_date' => $lessonStart,
                                    'end_date' => $lessonEnd,
                                ])->save();

                                $dayKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

                                foreach ($dayKeys as $offset => $dayKey) {
                                    $date = $lessonStart->copy()->addDays($offset);

                                    SsDay::query()->firstOrCreate(
                                        [
                                            'lesson_id' => $lesson->id,
                                            'day_key' => $dayKey,
                                        ],
                                        [
                                            'date' => $date,
                                            'title' => null,
                                            'content' => null,
                                            'status' => 'draft',
                                        ]
                                    );
                                }
                            }
                        });

                        Notification::make()
                            ->title('Generated')
                            ->body('Lessons & days ensured for this quarter. (Tidak menduplikasi data yang sudah ada)')
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
