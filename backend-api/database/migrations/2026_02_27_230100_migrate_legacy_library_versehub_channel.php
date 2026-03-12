<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $legacy = DB::table('channels')->where('slug', 'library-versehub')->first();
        $primary = DB::table('channels')->where('slug', 'versehub-daily')->first();

        if (! $legacy && ! $primary) {
            DB::table('channels')->insert([
                'slug' => 'versehub-daily',
                'title' => 'VerseHub Daily',
                'description' => 'Ayat harian VerseHub (admin only).',
                'type' => 'versehub',
                'cover_image_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return;
        }

        if ($legacy && ! $primary) {
            DB::table('channels')
                ->where('id', $legacy->id)
                ->update([
                    'slug' => 'versehub-daily',
                    'title' => $legacy->title ?: 'VerseHub Daily',
                    'updated_at' => now(),
                ]);
            return;
        }

        if ($legacy && $primary) {
            DB::table('posts')
                ->where('channel_id', $legacy->id)
                ->update([
                    'channel_id' => $primary->id,
                    'updated_at' => now(),
                ]);

            DB::table('channels')->where('id', $legacy->id)->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Irreversible safely: this migration consolidates legacy channel data into versehub-daily.
    }
};

