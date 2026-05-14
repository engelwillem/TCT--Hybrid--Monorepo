<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('share_assets', function (Blueprint $table): void {
            $table->id();

            // Identity
            $table->string('surface', 32)->index();       // renungan | versehub | community
            $table->string('subject_type', 64)->nullable(); // renungan_snapshot | versehub_verse | community_post
            $table->string('subject_id', 255)->nullable();  // token / slug / post_id
            $table->string('lang', 8)->default('id');

            // Revision (changes when source content or prompt version changes)
            $table->string('revision', 64)->index();
            $table->string('prompt_version', 16)->default('v1');
            $table->string('style_version', 16)->default('v1');

            // Status lifecycle
            $table->string('status', 16)->default('pending')->index(); // pending | ready | failed

            // AI-generated copy
            $table->string('share_title', 220)->nullable();
            $table->string('share_description', 500)->nullable();
            $table->string('share_eyebrow', 80)->nullable();
            $table->json('share_meta')->nullable(); // extra key/value metadata

            // OG visual
            $table->string('og_style', 32)->default('scripture'); // scripture | media | editorial
            $table->string('source_image_url', 512)->nullable();
            $table->string('generated_image_url', 512)->nullable();
            $table->string('final_og_image_url', 512)->nullable();

            // Error info
            $table->string('error_message', 500)->nullable();
            $table->unsignedSmallInteger('failure_count')->default(0);

            $table->timestamps();

            // Unique constraint: only 1 ready asset per surface+subject+revision
            $table->unique(['surface', 'subject_id', 'revision'], 'share_assets_identity_revision_unique');
            $table->index(['surface', 'subject_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('share_assets');
    }
};
