<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'site.favicon_url' => '/favicon.svg',
            'site.og_image_url' => '/og/versehub-bg.png',
            'site.og_home_image_url' => '/og/versehub-bg.png',
            'site.og_today_image_url' => '/og/versehub-bg.png',
            'site.og_community_image_url' => '/og/versehub-bg.png',
            'site.og_channels_image_url' => '/og/versehub-bg.png',
            'site.og_channels_sabbath_image_url' => '/og/versehub-bg.png',
            'site.og_channels_god_first_image_url' => '/og/versehub-bg.png',
            'site.og_channels_faith_journey_image_url' => '/og/versehub-bg.png',
            'site.og_channels_family_image_url' => '/og/versehub-bg.png',
            'site.og_profile_image_url' => '/og/versehub-bg.png',
            'site.og_inbox_image_url' => '/og/versehub-bg.png',

            // Global image fallback (Channels page)
            'site.channels_cover_fallback' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',

            // Global image fallback (Sabbath School pages)
            'site.sabbath_cover_fallback' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',

            // Optional per-day defaults (Sabbath School Day view)
            'site.sabbath_sat_cover' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop',
            'site.sabbath_sun_cover' => 'https://images.unsplash.com/photo-1455885666463-5ad9996b2d45?q=80&w=1200&auto=format&fit=crop',
            'site.sabbath_mon_cover' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop',
            'site.sabbath_tue_cover' => 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1200&auto=format&fit=crop',
            'site.sabbath_wed_cover' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
            'site.sabbath_thu_cover' => 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop',
            'site.sabbath_fri_cover' => 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
        ];

        foreach ($defaults as $key => $value) {
            AppSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }
    }
}
