<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Http\Controllers\VerseHubReaderController;
use App\Models\Channel;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\ToggleButtons;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        $bookOptions = [];
        foreach (array_keys(config('versehub_books.id', [])) as $code) {
            $bookOptions[$code] = sprintf(
                '%s (%s)',
                VerseHubReaderController::ID_BOOK_LABELS[$code] ?? Str::upper($code),
                $code
            );
        }

        return $schema
            ->components([
                Select::make('channel_id')
                    ->relationship('channel', 'title')
                    ->required(),

                TextInput::make('title')
                    ->required(),

                Section::make('VerseHub Daily')
                    ->description('Field tambahan khusus untuk admin posting ayat harian VerseHub.')
                    ->visible(function (callable $get) {
                        $channelId = $get('channel_id');

                        if (!$channelId) return false;

                        return Channel::query()
                            ->whereKey($channelId)
                            ->where('slug', 'versehub-daily')
                            ->exists();
                    })
                    ->schema([
                        ToggleButtons::make('testament')
                            ->label('Testament (helper)')
                            ->options([
                                'ot' => 'OT',
                                'nt' => 'NT',
                            ])
                            ->inline()
                            ->dehydrated(false),

                        Select::make('meta.book_code')
                            ->label('Book code')
                            ->options($bookOptions)
                            ->searchable()
                            ->required(),

                        TextInput::make('meta.chapter')
                            ->label('Chapter')
                            ->numeric()
                            ->minValue(1)
                            ->required(),

                        TextInput::make('meta.verse')
                            ->label('Verse')
                            ->numeric()
                            ->minValue(1)
                            ->required(),

                        Textarea::make('meta.quote')
                            ->label('Quote')
                            ->rows(4)
                            ->nullable(),

                        TextInput::make('meta.cta_label')
                            ->label('CTA label')
                            ->default('Baca'),

                        TextInput::make('meta.cta_href')
                            ->label('CTA href (optional)')
                            ->helperText('Kosongkan untuk otomatis menggunakan /versehub/id/{book_code}-{chapter}-{verse}.')
                            ->rule(static function () {
                                return static function (string $attribute, mixed $value, \Closure $fail): void {
                                    $href = trim((string) ($value ?? ''));
                                    if ($href === '') {
                                        return;
                                    }

                                    if (Str::startsWith($href, '/')) {
                                        return;
                                    }

                                    if (filter_var($href, FILTER_VALIDATE_URL) !== false) {
                                        return;
                                    }

                                    $fail('CTA href harus URL valid atau path relatif yang diawali /.');
                                };
                            }),
                    ])
                    ->columns(2)
                    ->collapsible(),

                RichEditor::make('content')
                    ->toolbarButtons([
                        'bold',
                        'italic',
                        'underline',
                        'strike',
                        'bulletList',
                        'orderedList',
                        'blockquote',
                        'link',
                        'undo',
                        'redo',
                    ])
                    ->columnSpanFull(),

                DateTimePicker::make('publish_at')
                    ->required(),

                ToggleButtons::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'scheduled' => 'Scheduled',
                        'published' => 'Published',
                    ])
                    ->inline()
                    ->required(),

                DateTimePicker::make('published_at'),
            ]);
    }
}
