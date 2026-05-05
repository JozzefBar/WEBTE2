<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->string('ip_hash', 64); // SHA-256 hash of IP
            $table->timestamp('visited_at');
            $table->enum('time_slot', ['morning', 'afternoon', 'evening', 'night']);
            $table->index('ip_hash');
            $table->index('visited_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
