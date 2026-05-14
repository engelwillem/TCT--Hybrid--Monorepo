<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_clients', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('client_key')->unique();
            $table->text('fonnte_token');
            $table->string('status', 32)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_clients');
    }
};

