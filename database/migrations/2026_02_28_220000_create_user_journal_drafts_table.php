<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_journal_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('entry_date');
            $table->string('source_type', 24)->default('versehub');
            $table->string('source_ref', 64)->nullable();
            $table->text('body');
            $table->boolean('is_private')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'entry_date'], 'user_journal_drafts_user_date_idx');
            $table->unique(
                ['user_id', 'entry_date', 'source_type', 'source_ref'],
                'user_journal_drafts_unique_ref_per_day'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_journal_drafts');
    }
};

