<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Core Personas
        User::updateOrCreate(
            ['email' => 'editor@thechoosentalks.com'],
            [
                'name' => 'The Shepherd',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'avatar_path' => 'avatars/shepherd.jpg',
            ]
        );

        User::updateOrCreate(
            ['email' => 'encourager@thechoosentalks.com'],
            [
                'name' => 'The Encourager',
                'password' => Hash::make('password'),
                'avatar_path' => 'avatars/encourager.jpg',
            ]
        );

        User::updateOrCreate(
            ['email' => 'student@thechoosentalks.com'],
            [
                'name' => 'Bible Student',
                'password' => Hash::make('password'),
                'avatar_path' => 'avatars/student.jpg',
            ]
        );

        // 2. Random Community Members
        User::factory()->count(10)->create();
    }
}
