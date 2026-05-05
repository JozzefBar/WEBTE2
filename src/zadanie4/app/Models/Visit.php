<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    protected $fillable = ['ip_hash', 'visited_at', 'time_slot'];
    public $timestamps = false;

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    /**
     * Determine time slot from hour.
     */
    public static function getTimeSlot(int $hour): string
    {
        if ($hour >= 6 && $hour < 15) return 'morning';
        if ($hour >= 15 && $hour < 21) return 'afternoon';
        if ($hour >= 21 && $hour < 24) return 'evening';
        return 'night'; // 0-6
    }

    /**
     * Get human-readable label for a time slot (Slovak).
     */
    public static function timeSlotLabel(string $slot): string
    {
        return match ($slot) {
            'morning' => '6:00 – 15:00',
            'afternoon' => '15:00 – 21:00',
            'evening' => '21:00 – 24:00',
            'night' => '0:00 – 6:00',
            default => $slot,
        };
    }
}
