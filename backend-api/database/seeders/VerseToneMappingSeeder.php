<?php

namespace Database\Seeders;

use App\Models\VerseToneMapping;
use Illuminate\Database\Seeder;

class VerseToneMappingSeeder extends Seeder
{
    public function run(): void
    {
        $mappings = [
            ['tone_slug' => 'worshipful', 'verse_ref' => '1tes-5-18', 'weight' => 135],
            ['tone_slug' => 'worshipful', 'verse_ref' => 'mzm-103-2', 'weight' => 125],
            ['tone_slug' => 'tender', 'verse_ref' => 'mzm-34-19', 'weight' => 130],
            ['tone_slug' => 'comforting', 'verse_ref' => 'mzm-121-7', 'weight' => 122],
            ['tone_slug' => 'comforting', 'verse_ref' => 'flp-4-6', 'weight' => 124],
            ['tone_slug' => 'reassuring', 'verse_ref' => 'yoh-14-1', 'weight' => 128],
            ['tone_slug' => 'restorative', 'verse_ref' => '1yoh-1-9', 'weight' => 140],
            ['tone_slug' => 'guiding', 'verse_ref' => 'ams-3-5', 'weight' => 130],
            ['tone_slug' => 'restraining', 'verse_ref' => 'yak-1-19', 'weight' => 145],
            ['tone_slug' => 'restraining', 'verse_ref' => 'ef-4-29', 'weight' => 126],
            ['tone_slug' => 'corrective', 'verse_ref' => 'rom-12-21', 'weight' => 115],
            ['tone_slug' => 'restorative', 'verse_ref' => 'mat-11-28', 'weight' => 123],
        ];

        foreach ($mappings as $index => $mapping) {
            VerseToneMapping::updateOrCreate(
                [
                    'tone_slug' => $mapping['tone_slug'],
                    'verse_ref' => $mapping['verse_ref'],
                    'lang' => 'id',
                ],
                [
                    'weight' => $mapping['weight'],
                    'sort_order' => $index + 1,
                ]
            );
        }
    }
}
