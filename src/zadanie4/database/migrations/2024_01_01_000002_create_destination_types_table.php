<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['beach', 'mountains', 'historical', 'city', 'adventure']);
            $table->unique(['destination_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_types');
    }
};
