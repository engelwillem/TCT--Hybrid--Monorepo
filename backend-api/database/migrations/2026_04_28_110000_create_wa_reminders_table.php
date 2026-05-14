<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('wa_client_id')->nullable()->constrained('wa_clients')->nullOnDelete();
            $table->unsignedInteger('sheet_row_number')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('tanggal')->nullable();
            $table->string('jam')->nullable();
            $table->string('zona_waktu')->nullable();
            $table->string('timezone')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->text('message_template')->nullable();
            $table->text('message_final')->nullable();
            $table->string('toko')->nullable();
            $table->string('status', 32)->default('Pending');
            $table->string('fonnte_message_id')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->longText('response')->nullable();
            $table->text('last_error')->nullable();
            $table->string('source_hash')->nullable();
            $table->timestamps();

            $table->index(['wa_client_id', 'status', 'scheduled_at']);
            $table->index(['wa_client_id', 'sheet_row_number']);
            $table->unique(['wa_client_id', 'sheet_row_number'], 'wa_reminders_client_row_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_reminders');
    }
};

