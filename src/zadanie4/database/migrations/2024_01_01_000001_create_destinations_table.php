<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('country');
            $table->char('country_code', 2);
            $table->string('capital');
            $table->char('currency_code', 3);
            $table->string('currency_name');
            $table->decimal('latitude', 8, 5);
            $table->decimal('longitude', 8, 5);
            $table->decimal('flight_hours_from_vienna', 3, 1);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};
