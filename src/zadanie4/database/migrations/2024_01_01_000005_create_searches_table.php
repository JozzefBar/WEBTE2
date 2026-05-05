<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->nullable()->constrained()->onDelete('set null');
            $table->tinyInteger('travel_month')->nullable();
            $table->integer('duration_days')->nullable();
            $table->json('types')->nullable();
            $table->string('temperature_pref')->nullable();
            $table->string('distance_pref')->nullable();
            $table->timestamp('searched_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('searches');
    }
};
