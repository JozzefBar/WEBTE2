<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyWeather extends Model
{
    protected $table = 'monthly_weather';
    protected $fillable = ['destination_id', 'month', 'avg_temp', 'avg_min_temp', 'avg_max_temp'];
    public $timestamps = false;

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
