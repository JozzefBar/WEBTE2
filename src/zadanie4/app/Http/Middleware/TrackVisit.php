<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Visit;
use Carbon\Carbon;

class TrackVisit
{
    public function handle(Request $request, Closure $next)
    {
        $ipHash = hash('sha256', $request->ip() . config('app.key'));
        $now = Carbon::now();
        $timeSlot = Visit::getTimeSlot($now->hour);

        // Check if this IP was seen in last 60 minutes
        $recentVisit = Visit::where('ip_hash', $ipHash)
            ->where('visited_at', '>=', $now->copy()->subMinutes(60))
            ->exists();

        // Always log the visit (for total count)
        // But mark unique visits by checking the 60-min window
        Visit::create([
            'ip_hash' => $recentVisit ? $ipHash : $ipHash,
            'visited_at' => $now,
            'time_slot' => $timeSlot,
        ]);

        return $next($request);
    }
}
