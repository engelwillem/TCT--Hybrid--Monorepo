<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('verse_relationships', function (Blueprint $table) {
            $table->id();
            $table->string('from_ref', 40)->index();   // e.g. "yoh-3-16"
            $table->string('to_ref', 40)->index();     // e.g. "rom-5-8"
            $table->string('lang', 5)->default('id');  // "id" | "en"
            $table->enum('relation_type', [
                'cross_ref',    // standard cross-reference
                'theme',        // shares a common theme
                'fulfillment',  // NT fulfils OT (direction: OT → NT)
                'contrast',     // theological contrast / tension
                'quote',        // direct quotation
                'parallel',     // parallel passage (e.g. synoptic gospels)
            ])->index();
            $table->unsignedTinyInteger('strength')->default(3); // 1–5 editorial confidence
            $table->timestamps();

            $table->unique(['from_ref', 'to_ref', 'relation_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verse_relationships');
    }
};
