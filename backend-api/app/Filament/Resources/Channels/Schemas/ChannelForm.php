<?php

namespace App\Filament\Resources\Channels\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ChannelForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('slug')
                    ->required(),
                TextInput::make('title')
                    ->required(),
                TextInput::make('description'),
                FileUpload::make('cover_image_url')
                    ->label('Cover Image (9:16)')
                    ->image()
                    ->imageEditor()
                    ->imageEditorAspectRatios(['9:16'])
                    ->imageCropAspectRatio('9:16')
                    ->rules(['dimensions:ratio=9/16'])
                    ->helperText('Wajib portrait 9:16. Disarankan 1080x1920.'),
                TextInput::make('type')
                    ->required(),
            ]);
    }
}
