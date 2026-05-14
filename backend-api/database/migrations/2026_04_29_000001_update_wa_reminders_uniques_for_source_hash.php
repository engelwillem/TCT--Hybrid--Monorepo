<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wa_reminders', function (Blueprint $table): void {
            $table->dropUnique('wa_reminders_client_row_unique');
            $table->unique(['wa_client_id', 'source_hash'], 'wa_reminders_client_source_hash_unique');
        });
    }

    public function down(): void
    {
        Schema::table('wa_reminders', function (Blueprint $table): void {
            $table->dropUnique('wa_reminders_client_source_hash_unique');
            $table->unique(['wa_client_id', 'sheet_row_number'], 'wa_reminders_client_row_unique');
        });
    }
};

