<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wa_client_id')->nullable()->constrained('wa_clients')->nullOnDelete();
            $table->unsignedInteger('row_number')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('toko')->nullable();
            $table->text('message')->nullable();
            $table->string('status', 64);
            $table->string('fonnte_message_id')->nullable();
            $table->longText('response')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['wa_client_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_logs');
    }
};

