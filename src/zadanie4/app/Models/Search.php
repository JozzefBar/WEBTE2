<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Search extends Model
{
    protected $fillable = [
        'destination_id', 'travel_month', 'duration_days',
        'types', 'temperature_pref', 'distance_pref', 'searched_at',
    ];
    public $timestamps = false;

    protected $casts = [
        'types' => 'array',
        'searched_at' => 'datetime',
    ];

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
