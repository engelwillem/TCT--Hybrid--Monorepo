<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_phone_owners', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('wa_client_id')->nullable()->constrained('wa_clients')->nullOnDelete();
            $table->string('phone');
            $table->string('canonical_name')->nullable();
            $table->string('canonical_name_normalized')->nullable();
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->unsignedInteger('confidence')->default(0);
            $table->timestamps();

            $table->unique(['wa_client_id', 'phone'], 'wa_phone_owners_client_phone_unique');
            $table->index(['wa_client_id', 'canonical_name_normalized'], 'wa_phone_owners_client_name_norm_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_phone_owners');
    }
};

