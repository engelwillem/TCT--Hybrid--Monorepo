<?php

namespace App\Filament\Resources\Posts\Tables;

use App\Models\Post;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('channel.title')
                    ->searchable(),
                TextColumn::make('title')
                    ->searchable(),
                TextColumn::make('publish_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('status')
                    ->badge()
                    ->searchable(),
                TextColumn::make('published_at')
                    ->dateTime()
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
                // Used by Ops Triage deep-link:
                // /admintalk/posts?tableFilters[overdue_scheduled][isActive]=1
                Filter::make('overdue_scheduled')
                    ->label('Overdue Scheduled')
                    ->query(fn ($query) => $query
                        ->where('status', 'scheduled')
                        ->whereNotNull('publish_at')
                        ->where('publish_at', '<', now())),
                SelectFilter::make('channel_id')
                    ->label('Channel')
                    ->relationship('channel', 'title')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'scheduled' => 'Scheduled',
                        'published' => 'Published',
                    ]),
                Filter::make('publish_window')
                    ->label('Publish Date Range')
                    ->form([
                        DatePicker::make('from')->label('From'),
                        DatePicker::make('until')->label('Until'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'] ?? null, fn ($q, $date) => $q->whereDate('publish_at', '>=', $date))
                            ->when($data['until'] ?? null, fn ($q, $date) => $q->whereDate('publish_at', '<=', $date));
                    }),
            ])
            ->defaultSort('publish_at', 'desc')
            ->recordActions([
                EditAction::make(),
                Action::make('publishNow')
                    ->label('Publish now')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('success')
                    ->visible(fn (Post $record) => $record->status !== 'published')
                    ->requiresConfirmation()
                    ->action(function (Post $record): void {
                        $record->forceFill([
                            'status' => 'published',
                            'published_at' => now(),
                            'publish_at' => now(),
                        ])->save();

                        Notification::make()
                            ->title('Post published')
                            ->success()
                            ->send();
                    }),
                Action::make('setDraft')
                    ->label('Set draft')
                    ->icon('heroicon-o-document')
                    ->color('gray')
                    ->visible(fn (Post $record) => $record->status !== 'draft')
                    ->requiresConfirmation()
                    ->action(function (Post $record): void {
                        $record->forceFill([
                            'status' => 'draft',
                            'published_at' => null,
                        ])->save();

                        Notification::make()
                            ->title('Post moved to draft')
                            ->success()
                            ->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('bulkPublish')
                        ->label('Publish selected')
                        ->icon('heroicon-o-paper-airplane')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $count = 0;
                            foreach ($records as $record) {
                                if (! $record instanceof Post) {
                                    continue;
                                }
                                $record->forceFill([
                                    'status' => 'published',
                                    'published_at' => now(),
                                    'publish_at' => now(),
                                ])->save();
                                $count++;
                            }

                            Notification::make()
                                ->title("{$count} post published")
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
                                if (! $record instanceof Post) {
                                    continue;
                                }
                                $record->forceFill([
                                    'status' => 'draft',
                                    'published_at' => null,
                                ])->save();
                                $count++;
                            }

                            Notification::make()
                                ->title("{$count} post moved to draft")
                                ->success()
                                ->send();
                        }),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
