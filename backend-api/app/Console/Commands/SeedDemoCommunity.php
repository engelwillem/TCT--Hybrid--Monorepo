<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SeedDemoCommunity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'community:seed-demo';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the Faith Community Engagement Engine with realistic demo data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->confirm('This will seed the database with demo users and community content. Do you wish to continue?')) {
            return;
        }

        $this->info('Starting Faith Community seed process...');

        $this->call('db:seed', [
            '--class' => \Database\Seeders\DemoCommunitySeeder::class,
        ]);

        $this->info('✅ Demo community successfully brought to life!');
    }
}
