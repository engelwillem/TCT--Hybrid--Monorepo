<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class SeedSystemAccounts extends Seeder
{
    public function run(): void
    {
        // 1. Shepherd Account
        User::updateOrCreate(
            ['email' => 'shepherd@thechoosentalks.com'],
            [
                'name' => 'The Shepherd',
                'password' => \Illuminate\Support\Facades\Hash::make('system-account-secret'),
                'is_system' => true,
                'system_type' => \App\Enums\SystemType::SHEPHERD,
            ]
        );

        // 2. Encourager Account
        User::updateOrCreate(
            ['email' => 'encourager@thechoosentalks.com'],
            [
                'name' => 'The Encourager',
                'password' => \Illuminate\Support\Facades\Hash::make('system-account-secret'),
                'is_system' => true,
                'system_type' => \App\Enums\SystemType::ENCOURAGER,
            ]
        );

        // 3. Pulse Account
        User::updateOrCreate(
            ['email' => 'pulse@thechoosentalks.com'],
            [
                'name' => 'Community Pulse',
                'password' => \Illuminate\Support\Facades\Hash::make('system-account-secret'),
                'is_system' => true,
                'system_type' => \App\Enums\SystemType::PULSE,
            ]
        );
    }
}
