<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bible_verses', function (Blueprint $table) {
            $table->enum('testament', ['ot', 'nt'])->nullable()->after('translation_name');
            $table->unsignedTinyInteger('book_canonical_order')->nullable()->after('testament');
        });
    }

    public function down(): void
    {
        Schema::table('bible_verses', function (Blueprint $table) {
            $table->dropColumn(['testament', 'book_canonical_order']);
        });
    }
};
