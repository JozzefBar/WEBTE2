<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Search;
use App\Models\DestinationType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * Show the statistics dashboard.
     */
    public function index()
    {
        // 1. Total visits and unique visits
        $totalVisits = Visit::count();

        // Unique visits: count distinct ip_hash values where
        // each ip_hash is only counted once per 60-minute window.
        // We count unique IP hashes that visited in the last 60 minutes for "current unique"
        // For total unique, we count distinct ip_hash overall
        $uniqueVisits = Visit::distinct('ip_hash')->count('ip_hash');

        // 2. Visits by time of day
        $visitsByTimeSlot = Visit::select('time_slot', DB::raw('COUNT(*) as count'))
            ->groupBy('time_slot')
            ->pluck('count', 'time_slot')
            ->toArray();

        // Ensure all slots are present
        $timeSlots = ['morning', 'afternoon', 'evening', 'night'];
        $timeSlotData = [];
        foreach ($timeSlots as $slot) {
            $timeSlotData[] = [
                'label' => Visit::timeSlotLabel($slot),
                'count' => $visitsByTimeSlot[$slot] ?? 0,
            ];
        }

        // 3. Most searched destinations (destination_id is set when viewing a destination)
        $searchedDestinations = Search::whereNotNull('destination_id')
            ->select('destination_id', DB::raw('COUNT(*) as search_count'))
            ->groupBy('destination_id')
            ->with('destination')
            ->orderByDesc('search_count')
            ->get()
            ->filter(fn($s) => $s->destination !== null)
            ->map(fn($s) => [
                'name' => $s->destination->name,
                'country' => $s->destination->country,
                'count' => $s->search_count,
            ])
            ->values();

        // 4. Preference statistics
        // Type preferences
        $allSearchTypes = Search::whereNotNull('types')->pluck('types');
        $typeStats = [];
        foreach ($allSearchTypes as $types) {
            $typesArr = is_array($types) ? $types : json_decode($types, true);
            if (is_array($typesArr)) {
                foreach ($typesArr as $type) {
                    $typeStats[$type] = ($typeStats[$type] ?? 0) + 1;
                }
            }
        }

        $typeChartData = [];
        foreach ($typeStats as $type => $count) {
            $typeChartData[] = [
                'label' => DestinationType::label($type),
                'count' => $count,
            ];
        }

        // Temperature preferences
        $tempStats = Search::whereNotNull('temperature_pref')
            ->select('temperature_pref', DB::raw('COUNT(*) as count'))
            ->groupBy('temperature_pref')
            ->pluck('count', 'temperature_pref')
            ->toArray();

        $tempLabels = [
            'hot' => 'Horúco (30°C+)',
            'warm' => 'Teplo (20–29°C)',
            'pleasant' => 'Príjemne (10–19°C)',
            'any' => 'Jedno mi to',
        ];

        $tempChartData = [];
        foreach ($tempLabels as $key => $label) {
            $tempChartData[] = [
                'label' => $label,
                'count' => $tempStats[$key] ?? 0,
            ];
        }

        return view('statistics', [
            'totalVisits' => $totalVisits,
            'uniqueVisits' => $uniqueVisits,
            'timeSlotData' => $timeSlotData,
            'searchedDestinations' => $searchedDestinations,
            'typeChartData' => $typeChartData,
            'tempChartData' => $tempChartData,
        ]);
    }
}
