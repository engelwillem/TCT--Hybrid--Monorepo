<?php

namespace App\Filament\Resources\MemberPosts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class MemberPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),

                Select::make('type')
                    ->options(\App\Enums\PostType::class)
                    ->required(),

                Select::make('source_type')
                    ->options(\App\Enums\SourceType::class)
                    ->default(\App\Enums\SourceType::HUMAN)
                    ->required(),

                Toggle::make('is_featured')
                    ->label('Featured')
                    ->helperText('Featured posts get a significant ranking boost in the feed.')
                    ->default(false),

                Textarea::make('text')
                    ->rows(6)
                    ->columnSpanFull(),

                TextInput::make('image_path')
                    ->maxLength(255),

                TextInput::make('thumb_path')
                    ->maxLength(255),

                DateTimePicker::make('expires_at')
                    ->seconds(false),

                DateTimePicker::make('hidden_at')
                    ->seconds(false),

                Select::make('hidden_by')
                    ->label('Hidden by')
                    ->relationship('hiddenBy', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->columns(2);
    }
}
