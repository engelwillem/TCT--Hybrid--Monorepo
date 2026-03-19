<?php

namespace App\Filament\Resources\MemberPostComments\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class MemberPostCommentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('member_post_id')
                    ->relationship('post', 'id')
                    ->searchable()
                    ->preload()
                    ->required(),

                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),

                Select::make('reply_to_comment_id')
                    ->relationship('replyTo', 'id')
                    ->searchable()
                    ->preload()
                    ->label('Reply to comment'),

                Textarea::make('body')
                    ->required()
                    ->rows(5)
                    ->columnSpanFull(),
            ])
            ->columns(2);
    }
}
