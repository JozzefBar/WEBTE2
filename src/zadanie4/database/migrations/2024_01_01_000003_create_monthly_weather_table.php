<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_weather', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('month'); // 1-12
            $table->decimal('avg_temp', 4, 1);
            $table->decimal('avg_min_temp', 4, 1);
            $table->decimal('avg_max_temp', 4, 1);
            $table->unique(['destination_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_weather');
    }
};
