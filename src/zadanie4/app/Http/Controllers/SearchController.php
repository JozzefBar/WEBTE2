<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Destination;
use App\Models\Search;
use App\Models\DestinationType;

class SearchController extends Controller
{
    /**
     * Process the search form and return ranked results.
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'travel_month' => 'required|integer|between:1,12',
            'duration_days' => 'required|integer|min:1|max:90',
            'types' => 'required|array|min:1',
            'types.*' => 'in:beach,mountains,historical,city,adventure',
            'temperature_pref' => 'required|in:hot,warm,pleasant,any',
            'distance_pref' => 'required|in:3h,5h,anywhere',
        ]);

        $month = (int) $validated['travel_month'];
        $selectedTypes = $validated['types'];
        $tempPref = $validated['temperature_pref'];
        $distPref = $validated['distance_pref'];

        // Log this search (without destination — that's logged on click)
        Search::create([
            'travel_month' => $month,
            'duration_days' => $validated['duration_days'],
            'types' => $selectedTypes,
            'temperature_pref' => $tempPref,
            'distance_pref' => $distPref,
            'searched_at' => now(),
        ]);

        // Get all destinations with their types and weather
        $destinations = Destination::with(['destinationTypes', 'monthlyWeather'])->get();

        // Score each destination
        $scored = $destinations->map(function ($dest) use ($month, $selectedTypes, $tempPref, $distPref) {
            $score = 0;
            $reasons = [];

            // 1. Type matching (max 30 pts per match)
            $destTypes = $dest->types_array;
            $matchedTypes = array_intersect($selectedTypes, $destTypes);
            $typeScore = count($matchedTypes) * 30;
            $score += $typeScore;
            if (count($matchedTypes) > 0) {
                $labels = array_map(fn($t) => DestinationType::label($t), $matchedTypes);
                $reasons[] = '✓ ' . implode(', ', $labels);
            }

            // 2. Temperature matching (max 25 pts)
            $weather = $dest->weatherForMonth($month);
            if ($weather) {
                if ($tempPref === 'any') {
                    $score += 15;
                    $reasons[] = '🌡️ Priemerná teplota: ' . $weather->avg_temp . ' °C';
                } elseif ($dest->matchesTemperature($tempPref, $month)) {
                    $score += 25;
                    $tempLabel = match ($tempPref) {
                        'hot' => 'Horúco (30°C+)',
                        'warm' => 'Teplo (20–29°C)',
                        'pleasant' => 'Príjemne (10–19°C)',
                        default => '',
                    };
                    $reasons[] = "🌡️ {$tempLabel}: {$weather->avg_temp} °C";
                } else {
                    // Partial temperature match — closer = more points
                    $diff = match ($tempPref) {
                        'hot' => max(0, 30 - $weather->avg_temp),
                        'warm' => $weather->avg_temp >= 20 ? max(0, $weather->avg_temp - 29) : max(0, 20 - $weather->avg_temp),
                        'pleasant' => $weather->avg_temp >= 10 ? max(0, $weather->avg_temp - 19) : max(0, 10 - $weather->avg_temp),
                        default => 0,
                    };
                    $partial = max(0, 15 - $diff * 2);
                    $score += $partial;
                    $reasons[] = "🌡️ Teplota: {$weather->avg_temp} °C";
                }
            }

            // 3. Distance matching (max 20 pts)
            if ($dest->matchesDistance($distPref)) {
                $score += 20;
                $reasons[] = '✈️ Let z Viedne: ' . $dest->flight_hours_from_vienna . ' h';
            } else {
                // Still show flight time but no bonus
                $reasons[] = '✈️ Let z Viedne: ' . $dest->flight_hours_from_vienna . ' h (ďalej ako preferované)';
            }

            // 4. Season bonus — if weather is good for the month
            if ($weather && $weather->avg_temp >= 15 && $weather->avg_temp <= 35) {
                $score += 10;
            }

            return [
                'destination' => $dest,
                'score' => $score,
                'reasons' => $reasons,
                'matched_types' => $matchedTypes,
                'weather' => $weather,
            ];
        });

        // Filter: must match at least one type AND distance
        $scored = $scored->filter(function ($item) use ($distPref) {
            return count($item['matched_types']) > 0 && $item['destination']->matchesDistance($distPref);
        });

        // Sort by score descending
        $results = $scored->sortByDesc('score')->values();

        $months = [
            1 => 'Január', 2 => 'Február', 3 => 'Marec',
            4 => 'Apríl', 5 => 'Máj', 6 => 'Jún',
            7 => 'Júl', 8 => 'August', 9 => 'September',
            10 => 'Október', 11 => 'November', 12 => 'December',
        ];

        return view('results', [
            'results' => $results,
            'search' => $validated,
            'monthName' => $months[$month],
        ]);
    }
}
