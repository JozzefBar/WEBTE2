<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destination extends Model
{
    protected $fillable = [
        'name', 'country', 'country_code', 'capital',
        'currency_code', 'currency_name', 'latitude', 'longitude',
        'flight_hours_from_vienna', 'description',
    ];

    /**
     * Get the monthly weather records for this destination.
     */
    public function monthlyWeather(): HasMany
    {
        return $this->hasMany(MonthlyWeather::class);
    }

    /**
     * Get the types associated with this destination.
     */
    public function destinationTypes(): HasMany
    {
        return $this->hasMany(DestinationType::class);
    }

    /**
     * Get weather for a specific month.
     */
    public function weatherForMonth(int $month): ?MonthlyWeather
    {
        return $this->monthlyWeather()->where('month', $month)->first();
    }

    /**
     * Get array of type strings.
     */
    public function getTypesArrayAttribute(): array
    {
        return $this->destinationTypes->pluck('type')->toArray();
    }

    /**
     * Get the flag URL for this destination's country.
     */
    public function getFlagUrlAttribute(): string
    {
        return 'https://www.geonames.org/flags/x/' . strtolower($this->country_code) . '.gif';
    }

    /**
     * Check if destination matches distance preference.
     */
    public function matchesDistance(string $pref): bool
    {
        return match ($pref) {
            '3h' => $this->flight_hours_from_vienna <= 3,
            '5h' => $this->flight_hours_from_vienna <= 5,
            default => true, // 'anywhere'
        };
    }

    /**
     * Check if destination's temperature in given month matches preference.
     */
    public function matchesTemperature(string $pref, int $month): bool
    {
        $weather = $this->weatherForMonth($month);
        if (!$weather) return false;

        return match ($pref) {
            'hot' => $weather->avg_temp >= 30,
            'warm' => $weather->avg_temp >= 20 && $weather->avg_temp < 30,
            'pleasant' => $weather->avg_temp >= 10 && $weather->avg_temp < 20,
            default => true, // 'any'
        };
    }
}
