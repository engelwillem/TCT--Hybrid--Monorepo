<?php

namespace Database\Seeders;

use App\Enums\ChannelType;
use App\Models\Channel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ChannelSeeder extends Seeder
{
    public function run(): void
    {
        $channels = [
            [
                'title' => 'Sekolah Sabat Harian',
                'description' => 'Diskusi harian mengenai pelajaran sekolah sabat kita.',
                'type' => ChannelType::PUBLIC ,
            ],
            [
                'title' => 'Youth Community',
                'description' => 'Grup khusus untuk pemuda dan remaja TheChosenTalks.',
                'type' => ChannelType::PUBLIC ,
            ],
            [
                'title' => 'Warta Jemaat',
                'description' => 'Update dan informasi seputar kegiatan jemaat kita.',
                'type' => ChannelType::PUBLIC ,
            ],
            [
                'title' => 'Doa & Syafaat',
                'description' => 'Fokus khusus untuk saling mendoakan setiap saat.',
                'type' => ChannelType::PUBLIC ,
            ],
        ];

        foreach ($channels as $data) {
            Channel::updateOrCreate(
                ['slug' => Str::slug($data['title'])],
                [
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'type' => $data['type'],
                ]
            );
        }
    }
}
