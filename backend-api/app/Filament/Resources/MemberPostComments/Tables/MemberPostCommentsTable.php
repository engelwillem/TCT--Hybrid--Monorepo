<?php

namespace App\Filament\Resources\MemberPostComments\Tables;

use App\Models\MemberPostComment;
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
use Illuminate\Support\Carbon;

class MemberPostCommentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->sortable(),
                TextColumn::make('post.id')
                    ->label('Post ID')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('user.name')
                    ->label('Author')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('replyTo.id')
                    ->label('Reply to')
                    ->toggleable(),
                TextColumn::make('body')
                    ->limit(120)
                    ->wrap()
                    ->searchable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('member_post_id')
                    ->label('Post')
                    ->relationship('post', 'id'),
                SelectFilter::make('user_id')
                    ->label('Author')
                    ->relationship('user', 'name')
                    ->searchable(),
                TernaryFilter::make('has_reply_parent')
                    ->label('Reply comment')
                    ->nullable()
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('reply_to_comment_id'),
                        false: fn ($query) => $query->whereNull('reply_to_comment_id'),
                        blank: fn ($query) => $query,
                    ),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                EditAction::make(),
                Action::make('deleteNow')
                    ->label('Delete')
                    ->color('danger')
                    ->icon('heroicon-o-trash')
                    ->requiresConfirmation()
                    ->action(fn ($record) => $record->delete()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('exportAndDeleteSelected')
                        ->label('Export CSV + Delete selected')
                        ->icon('heroicon-o-arrow-down-tray')
                        ->color('warning')
                        ->requiresConfirmation()
                        ->modalHeading('Soft Moderation Preset')
                        ->modalDescription('Komentar terpilih akan diexport ke CSV terlebih dahulu, lalu dihapus permanen.')
                        ->deselectRecordsAfterCompletion()
                        ->action(function ($records) {
                            $rows = [];
                            foreach ($records as $record) {
                                if (! $record instanceof MemberPostComment) {
                                    continue;
                                }
                                $rows[] = [
                                    'id' => (int) $record->id,
                                    'member_post_id' => (int) $record->member_post_id,
                                    'user_id' => (int) $record->user_id,
                                    'user_name' => (string) ($record->user?->name ?? ''),
                                    'reply_to_comment_id' => $record->reply_to_comment_id ? (int) $record->reply_to_comment_id : '',
                                    'body' => (string) $record->body,
                                    'created_at_wib' => (string) $record->created_at?->timezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                                ];
                            }

                            if (empty($rows)) {
                                Notification::make()
                                    ->title('Tidak ada komentar dipilih')
                                    ->warning()
                                    ->send();

                                return null;
                            }

                            foreach ($records as $record) {
                                if ($record instanceof MemberPostComment) {
                                    $record->delete();
                                }
                            }

                            $filename = 'member-post-comments-moderation-'.Carbon::now('Asia/Jakarta')->format('Ymd-His').'.csv';

                            return response()->streamDownload(function () use ($rows): void {
                                $handle = fopen('php://output', 'w');
                                if (! $handle) {
                                    return;
                                }

                                fputcsv($handle, [
                                    'id',
                                    'member_post_id',
                                    'user_id',
                                    'user_name',
                                    'reply_to_comment_id',
                                    'body',
                                    'created_at_wib',
                                ]);

                                foreach ($rows as $row) {
                                    fputcsv($handle, [
                                        $row['id'],
                                        $row['member_post_id'],
                                        $row['user_id'],
                                        $row['user_name'],
                                        $row['reply_to_comment_id'],
                                        $row['body'],
                                        $row['created_at_wib'],
                                    ]);
                                }

                                fclose($handle);
                            }, $filename, [
                                'Content-Type' => 'text/csv; charset=UTF-8',
                            ]);
                        }),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
