<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('renungan_share_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token', 96)->unique()->index();
            $table->string('lang', 5)->default('id')->index();
            $table->string('verse_reference', 120);
            $table->text('verse_text');
            $table->text('meditation_excerpt');
            $table->string('theme', 80)->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamp('revoked_at')->nullable()->index();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'expires_at', 'revoked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('renungan_share_snapshots');
    }
};

