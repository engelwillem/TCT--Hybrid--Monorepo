<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DemoCommunitySeeder extends Seeder
{
    /**
     * Seed the application's demo community state.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ChannelSeeder::class,
            DailyContentSeeder::class,
            PostSeeder::class,
        ]);

        $this->command->info('Faith Community Engagement Engine demo data successfully seeded!');
    }
}
