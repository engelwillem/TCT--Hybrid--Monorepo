<?php

namespace App\Filament\Resources\SsDays\Tables;

use App\Models\SsDay;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SsDaysTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('lesson.lesson_number')
                    ->label('Lesson')
                    ->sortable(),
                TextColumn::make('lesson.title')
                    ->label('Lesson Title')
                    ->toggleable()
                    ->searchable(),
                TextColumn::make('day_key')
                    ->label('Day')
                    ->badge()
                    ->searchable(),
                TextColumn::make('date')
                    ->date()
                    ->sortable(),
                TextColumn::make('title')
                    ->searchable(),
                TextColumn::make('cover_image_url')
                    ->label('Cover URL')
                    ->limit(40)
                    ->toggleable(),
                TextColumn::make('status')
                    ->searchable(),
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
                // Used by Ops Triage deep-link:
                // /admintalk/ss-days?tableFilters[needs_publish][isActive]=1
                Filter::make('needs_publish')
                    ->label('Needs publish (Draft)')
                    ->query(fn ($query) => $query->where('status', 'draft')),
                SelectFilter::make('lesson_id')
                    ->label('Lesson Number')
                    ->relationship('lesson', 'lesson_number')
                    ->searchable(),
                SelectFilter::make('day_key')
                    ->options([
                        'sat' => 'Saturday',
                        'sun' => 'Sunday',
                        'mon' => 'Monday',
                        'tue' => 'Tuesday',
                        'wed' => 'Wednesday',
                        'thu' => 'Thursday',
                        'fri' => 'Friday',
                    ]),
                SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                    ]),
            ])
            ->defaultSort('date', 'desc')
            ->paginationPageOptions([25, 50, 100, 200])
            ->defaultPaginationPageOption(100)
            ->recordActions([
                EditAction::make(),
                Action::make('publish')
                    ->label('Publish')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (SsDay $record) => $record->status !== 'published')
                    ->action(function (SsDay $record): void {
                        $record->forceFill(['status' => 'published'])->save();
                        Notification::make()->title('Day published')->success()->send();
                    }),
                Action::make('draft')
                    ->label('Set draft')
                    ->icon('heroicon-o-document')
                    ->color('gray')
                    ->visible(fn (SsDay $record) => $record->status !== 'draft')
                    ->action(function (SsDay $record): void {
                        $record->forceFill(['status' => 'draft'])->save();
                        Notification::make()->title('Day set to draft')->success()->send();
                    }),
                Action::make('openPublic')
                    ->label('Open')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->url(function (SsDay $record): string {
                        $record->loadMissing('lesson.quarter');
                        $lesson = $record->lesson;
                        $quarter = $lesson?->quarter;
                        if (! $lesson || ! $quarter) {
                            return '#';
                        }

                        return "/channels/sabbath-school/{$quarter->year}/q{$quarter->quarter}/lesson/{$lesson->lesson_number}/{$record->day_key}";
                    }, shouldOpenInNewTab: true),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('bulkPublish')
                        ->label('Publish selected')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $count = 0;
                            foreach ($records as $record) {
                                if (! $record instanceof SsDay) {
                                    continue;
                                }
                                $record->forceFill(['status' => 'published'])->save();
                                $count++;
                            }

                            Notification::make()
                                ->title("{$count} day published")
                                ->success()
                                ->send();
                        }),
                    BulkAction::make('bulkDraft')
                        ->label('Set selected to draft')
                        ->icon('heroicon-o-document')
                        ->color('gray')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $count = 0;
                            foreach ($records as $record) {
                                if (! $record instanceof SsDay) {
                                    continue;
                                }
                                $record->forceFill(['status' => 'draft'])->save();
                                $count++;
                            }

                            Notification::make()
                                ->title("{$count} day set to draft")
                                ->success()
                                ->send();
                        }),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
