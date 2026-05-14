<?php

namespace App\Filament\Resources\MemberPosts\Tables;

use App\Models\MemberPost;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class MemberPostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Author')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->badge()
                    ->color(fn (\App\Enums\PostType $state): string => $state->color())
                    ->searchable()
                    ->sortable(),
                TextColumn::make('source_type')
                    ->badge()
                    ->sortable(),
                \Filament\Tables\Columns\IconColumn::make('is_featured')
                    ->boolean()
                    ->label('Star')
                    ->sortable(),
                TextColumn::make('text')
                    ->limit(80)
                    ->wrap(),
                TextColumn::make('interactions')
                    ->label('Interactions')
                    ->state(
                        fn ($record) => ($record->metadata['pray_count'] ?? 0).' 🙏 | '.
                        ($record->metadata['encouraged_count'] ?? 0).' ❤️'
                    ),
                TextColumn::make('comments_count')
                    ->counts('comments')
                    ->label('Comments')
                    ->sortable(),
                TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('hidden_at')
                    ->dateTime()
                    ->label('Hidden')
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
                SelectFilter::make('type')
                    ->options([
                        'member_post' => 'Member Post',
                        'prayer_request' => 'Prayer Request',
                        'reflection' => 'Reflection',
                        'question' => 'Daily Question',
                        'daily_prayer' => 'Daily Prayer',
                    ]),
                SelectFilter::make('user_id')
                    ->label('Author')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('expires_state')
                    ->label('Expiry')
                    ->options([
                        'active' => 'Active (not expired)',
                        'expired' => 'Expired',
                    ])
                    ->query(function ($query, array $data) {
                        $value = $data['value'] ?? null;
                        if ($value === 'active') {
                            return $query->where(function ($q) {
                                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                            });
                        }
                        if ($value === 'expired') {
                            return $query->whereNotNull('expires_at')->where('expires_at', '<=', now());
                        }

                        return $query;
                    }),
                TernaryFilter::make('is_hidden')
                    ->label('Hidden state')
                    ->nullable()
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('hidden_at'),
                        false: fn ($query) => $query->whereNull('hidden_at'),
                        blank: fn ($query) => $query,
                    ),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                EditAction::make(),
                Action::make('makeHighlight')
                    ->label('Highlight')
                    ->icon('heroicon-m-sparkles')
                    ->color('amber')
                    ->action(function (MemberPost $record) {
                        \App\Models\DailyContent::create([
                            'date' => now(),
                            'content_type' => \App\Enums\DailyContentType::COMMUNITY_HIGHLIGHT,
                            'source_type' => \App\Enums\SourceType::OFFICIAL,
                            'review_status' => \App\Enums\ReviewStatus::APPROVED,
                            'payload' => [
                                'title' => 'Sorotan Komunitas',
                                'description' => $record->text,
                                'member_post_id' => $record->id,
                                'author' => $record->user->name,
                            ],
                            'published_at' => now(),
                        ]);
                        Notification::make()->title('Added to Community Highlights')->success()->send();
                    })
                    ->requiresConfirmation(),
                Action::make('toggleHidden')
                    ->label(fn (MemberPost $record) => $record->hidden_at ? 'Unhide' : 'Hide')
                    ->icon(fn (MemberPost $record) => $record->hidden_at ? 'heroicon-o-eye' : 'heroicon-o-eye-slash')
                    ->requiresConfirmation()
                    ->action(function (MemberPost $record): void {
                        if ($record->hidden_at) {
                            $record->forceFill([
                                'hidden_at' => null,
                                'hidden_by' => null,
                            ])->save();
                            Notification::make()->title('Post restored')->success()->send();

                            return;
                        }

                        $record->forceFill([
                            'hidden_at' => now(),
                            'hidden_by' => auth()->id(),
                        ])->save();
                        Notification::make()->title('Post hidden')->success()->send();
                    }),
                Action::make('deleteNow')
                    ->label('Delete')
                    ->color('danger')
                    ->icon('heroicon-o-trash')
                    ->requiresConfirmation()
                    ->action(function (MemberPost $record): void {
                        $record->delete();
                        Notification::make()->title('Post deleted')->success()->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('bulkHide')
                        ->label('Hide selected')
                        ->icon('heroicon-o-eye-slash')
                        ->color('gray')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $count = 0;
                            foreach ($records as $record) {
                                if (! $record instanceof MemberPost) {
                                    continue;
                                }
                                if ($record->hidden_at) {
                                    continue;
                                }
                                $record->forceFill([
                                    'hidden_at' => now(),
                                    'hidden_by' => auth()->id(),
                                ])->save();
                                $count++;
                            }

                            Notification::make()
                                ->title("{$count} post hidden")
                                ->success()
                                ->send();
                        }),
                    BulkAction::make('bulkUnhide')
                        ->label('Unhide selected')
                        ->icon('heroicon-o-eye')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $count = 0;
                            foreach ($records as $record) {
                                if (! $record instanceof MemberPost) {
                                    continue;
                                }
                                if (! $record->hidden_at) {
                                    continue;
                                }
                                $record->forceFill([
                                    'hidden_at' => null,
                                    'hidden_by' => null,
                                ])->save();
                                $count++;
                            }

                            Notification::make()
                                ->title("{$count} post restored")
                                ->success()
                                ->send();
                        }),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
