<?php

namespace App\Filament\Resources\AppSettings\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AppSettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('key')
                    ->options([
                        'site.favicon_url' => 'site.favicon_url',
                        'site.og_image_url' => 'site.og_image_url',
                        'site.og_home_image_url' => 'site.og_home_image_url',
                        'site.og_today_image_url' => 'site.og_today_image_url',
                        'site.og_community_image_url' => 'site.og_community_image_url',
                        'site.og_channels_image_url' => 'site.og_channels_image_url',
                        'site.og_channels_sabbath_image_url' => 'site.og_channels_sabbath_image_url',
                        'site.og_channels_god_first_image_url' => 'site.og_channels_god_first_image_url',
                        'site.og_channels_faith_journey_image_url' => 'site.og_channels_faith_journey_image_url',
                        'site.og_channels_family_image_url' => 'site.og_channels_family_image_url',
                        'site.og_profile_image_url' => 'site.og_profile_image_url',
                        'site.og_inbox_image_url' => 'site.og_inbox_image_url',
                        'site.channels_cover_fallback' => 'site.channels_cover_fallback',
                        'site.sabbath_cover_fallback' => 'site.sabbath_cover_fallback',
                        'site.sabbath_sat_cover' => 'site.sabbath_sat_cover',
                        'site.sabbath_sun_cover' => 'site.sabbath_sun_cover',
                        'site.sabbath_mon_cover' => 'site.sabbath_mon_cover',
                        'site.sabbath_tue_cover' => 'site.sabbath_tue_cover',
                        'site.sabbath_wed_cover' => 'site.sabbath_wed_cover',
                        'site.sabbath_thu_cover' => 'site.sabbath_thu_cover',
                        'site.sabbath_fri_cover' => 'site.sabbath_fri_cover',
                    ])
                    ->searchable()
                    ->allowHtml(false)
                    ->required(),

                TextInput::make('value')
                    ->label('Value (URL)')
                    ->maxLength(2048)
                    ->rule(function () {
                        return function (string $attribute, $value, \Closure $fail): void {
                            $raw = is_string($value) ? trim($value) : '';
                            if ($raw === '') {
                                $fail('Value wajib diisi.');

                                return;
                            }

                            if (str_starts_with($raw, '/')) {
                                return;
                            }

                            if (filter_var($raw, FILTER_VALIDATE_URL) !== false) {
                                return;
                            }

                            $fail('Gunakan URL https/http atau path absolut app (contoh: /og/versehub-bg.png).');
                        };
                    })
                    ->helperText('Gunakan URL https atau path absolut app seperti /images/favicon.svg')
                    ->required(),

                Textarea::make('note')
                    ->dehydrated(false)
                    ->rows(2)
                    ->placeholder('Opsional: catatan internal (tidak disimpan)'),
            ]);
    }
}
