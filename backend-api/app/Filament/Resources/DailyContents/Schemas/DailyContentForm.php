<?php

namespace App\Filament\Resources\DailyContents\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Schemas\Schema;

class DailyContentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('General Information')
                    ->columns(2)
                    ->schema([
                        DatePicker::make('date')
                            ->required()
                            ->unique(ignoreRecord: true),
                        Select::make('content_type')
                            ->options([
                                'today_verse' => 'Daily Verse',
                                'quote_of_day' => 'Quote of the Day',
                                'reflection_prompt' => 'Reflection Prompt',
                                'prayer_prompt' => 'Prayer Prompt',
                                'community_highlight' => 'Community Highlight',
                            ])
                            ->required()
                            ->live(),
                        DateTimePicker::make('published_at')
                            ->default(now()),
                        Select::make('source_type')
                            ->options(\App\Enums\SourceType::class)
                            ->default(\App\Enums\SourceType::OFFICIAL)
                            ->required(),
                        Select::make('review_status')
                            ->options(\App\Enums\ReviewStatus::class)
                            ->default(\App\Enums\ReviewStatus::APPROVED)
                            ->required()
                            ->columnSpan('full'),
                        Toggle::make('payload.auto_post')
                            ->label('Auto-Post to Community Feed')
                            ->helperText('Jika dicentang, konten ini akan otomatis menjadi postingan resmi di feed komunitas pada tanggal yang ditentukan.')
                            ->default(true)
                            ->columnSpanFull(),
                    ]),

                // 1. Today's Verse Payload
                Section::make('Verse Details')
                    ->visible(fn(Get $get) => $get('content_type') === 'today_verse')
                    ->schema([
                        TextInput::make('payload.reference')
                            ->label('Bible Reference')
                            ->placeholder('e.g., Yeremia 29:11')
                            ->required(),
                        Textarea::make('payload.text')
                            ->label('Verse Text')
                            ->rows(3)
                            ->required(),
                        TextInput::make('payload.author')
                            ->label('Author')
                            ->placeholder('e.g., Nabi Yeremia'),
                        TextInput::make('payload.cta_label')
                            ->label('CTA Label')
                            ->placeholder('e.g., Baca Selengkapnya')
                            ->default('Baca Selengkapnya'),
                        TextInput::make('payload.cta_href')
                            ->label('CTA Link')
                            ->placeholder('e.g., /versehub/id')
                            ->default('/versehub/id'),
                        FileUpload::make('payload.image')
                            ->label('Background Image (9:16)')
                            ->image()
                            ->directory('rituals')
                            ->imageEditor()
                            ->imageEditorAspectRatios(['9:16'])
                            ->imageCropAspectRatio('9:16')
                            ->rules(['dimensions:ratio=9/16'])
                            ->helperText('Wajib portrait 9:16. Disarankan 1080x1920.'),
                    ]),

                // 2. Quote Payload
                Section::make('Quote Details')
                    ->visible(fn(Get $get) => $get('content_type') === 'quote_of_day')
                    ->schema([
                        Textarea::make('payload.text')
                            ->label('Quote Text')
                            ->rows(3)
                            ->required(),
                        TextInput::make('payload.author')
                            ->label('Author')
                            ->placeholder('e.g., Ellen G. White')
                            ->required(),
                    ]),

                // 3. Reflection Prompt Payload
                Section::make('Reflection Details')
                    ->visible(fn(Get $get) => $get('content_type') === 'reflection_prompt')
                    ->schema([
                        Textarea::make('payload.question')
                            ->label('Reflection Question')
                            ->rows(3)
                            ->required()
                            ->hintAction(
                                \Filament\Forms\Components\Actions\Action::make('ai_suggest')
                                    ->label('✨ AI Suggest')
                                    ->action(function ($set, $get) {
                                        $assistant = app(\App\Services\AI\AIContentAssistant::class);
                                        $context = [
                                            'reference' => $get('payload.reference'),
                                        ];
                                        $suggestion = $assistant->suggest('reflection_prompt', $context);
                                        $set('payload.question', $suggestion);
                                        $set('source_type', \App\Enums\SourceType::AI_ASSISTED);
                                        $set('review_status', \App\Enums\ReviewStatus::PENDING);
                                    })
                            ),
                    ]),

                // 4. Prayer Prompt Payload
                Section::make('Prayer Details')
                    ->visible(fn(Get $get) => $get('content_type') === 'prayer_prompt')
                    ->schema([
                        TextInput::make('payload.target')
                            ->label('Prayer Target')
                            ->placeholder('e.g., Misionaris kita di pedalaman'),
                        TextInput::make('payload.theme')
                            ->label('Prayer Theme')
                            ->placeholder('e.g., Kekuatan dan Perlindungan')
                            ->required()
                            ->hintAction(
                                \Filament\Forms\Components\Actions\Action::make('ai_suggest_prayer')
                                    ->label('✨ AI Suggest')
                                    ->action(function ($set, $get) {
                                        $assistant = app(\App\Services\AI\AIContentAssistant::class);
                                        $context = [
                                            'reference' => $get('payload.reference'),
                                        ];
                                        $suggestion = $assistant->suggest('prayer_prompt', $context);
                                        $set('payload.theme', $suggestion);
                                        $set('source_type', \App\Enums\SourceType::AI_ASSISTED);
                                        $set('review_status', \App\Enums\ReviewStatus::PENDING);
                                    })
                            ),
                    ]),

                // 5. Community Highlight Payload
                Section::make('Highlight Details')
                    ->visible(fn(Get $get) => $get('content_type') === 'community_highlight')
                    ->schema([
                        TextInput::make('payload.title')
                            ->label('Highlight Title')
                            ->required(),
                        Textarea::make('payload.description')
                            ->label('Short Description')
                            ->rows(3)
                            ->required(),
                        TextInput::make('payload.cta_label')
                            ->label('Button Label'),
                        TextInput::make('payload.cta_href')
                            ->label('Button Link'),
                    ]),
            ]);
    }
}

