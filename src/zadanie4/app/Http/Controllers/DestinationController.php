<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Destination;
use App\Models\Search;
use App\Models\DestinationType;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class DestinationController extends Controller
{
    /**
     * Show a destination's detail card.
     */
    public function show(Request $request, $id)
    {
        $destination = Destination::with(['destinationTypes', 'monthlyWeather'])->findOrFail($id);
        $month = $request->get('month', now()->month);

        // Log that this destination was viewed
        Search::create([
            'destination_id' => $destination->id,
            'travel_month' => $month,
            'searched_at' => now(),
        ]);

        // Historical weather for the selected month
        $historicalWeather = $destination->weatherForMonth($month);

        // Current forecast from Open-Meteo API (cached for 1 hour)
        $forecast = $this->getCurrentForecast($destination);

        // Currency exchange rate (cached for 24 hours)
        $exchangeRate = $this->getExchangeRate($destination->currency_code);

        // Generate "Why now" text
        $whyNow = $this->generateWhyNow($destination, $month, $historicalWeather, $exchangeRate);

        $months = [
            1 => 'Január', 2 => 'Február', 3 => 'Marec',
            4 => 'Apríl', 5 => 'Máj', 6 => 'Jún',
            7 => 'Júl', 8 => 'August', 9 => 'September',
            10 => 'Október', 11 => 'November', 12 => 'December',
        ];

        return view('destination', [
            'destination' => $destination,
            'month' => $month,
            'monthName' => $months[$month],
            'historicalWeather' => $historicalWeather,
            'forecast' => $forecast,
            'exchangeRate' => $exchangeRate,
            'whyNow' => $whyNow,
            'months' => $months,
            'searchParams' => $request->only(['travel_month', 'duration_days', 'types', 'temperature_pref', 'distance_pref']),
        ]);
    }

    /**
     * Compare two destinations side by side.
     */
    public function compare(Request $request)
    {
        $ids = $request->input('destinations', []);
        $month = $request->input('month', now()->month);

        if (count($ids) !== 2) {
            return redirect()->back()->with('error', 'Vyberte presne 2 destinácie na porovnanie.');
        }

        $destinations = Destination::with(['destinationTypes', 'monthlyWeather'])
            ->whereIn('id', $ids)
            ->get();

        if ($destinations->count() !== 2) {
            return redirect()->back()->with('error', 'Destinácie neboli nájdené.');
        }

        $comparisonData = $destinations->map(function ($dest) use ($month) {
            return [
                'destination' => $dest,
                'weather' => $dest->weatherForMonth($month),
                'forecast' => $this->getCurrentForecast($dest),
                'exchangeRate' => $this->getExchangeRate($dest->currency_code),
                'types' => $dest->destinationTypes->pluck('type')->map(fn($t) => DestinationType::label($t))->toArray(),
            ];
        });

        $months = [
            1 => 'Január', 2 => 'Február', 3 => 'Marec',
            4 => 'Apríl', 5 => 'Máj', 6 => 'Jún',
            7 => 'Júl', 8 => 'August', 9 => 'September',
            10 => 'Október', 11 => 'November', 12 => 'December',
        ];

        return view('compare', [
            'data' => $comparisonData,
            'month' => $month,
            'monthName' => $months[$month],
        ]);
    }

    /**
     * Fetch current weather forecast from Open-Meteo.
     */
    private function getCurrentForecast(Destination $dest): ?array
    {
        $cacheKey = "forecast_{$dest->id}";
        return Cache::remember($cacheKey, 3600, function () use ($dest) {
            try {
                $response = Http::timeout(5)->get('https://api.open-meteo.com/v1/forecast', [
                    'latitude' => $dest->latitude,
                    'longitude' => $dest->longitude,
                    'current' => 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
                    'timezone' => 'auto',
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return $data['current'] ?? null;
                }
            } catch (\Exception $e) {
                // Silently fail — forecast is optional
            }
            return null;
        });
    }

    /**
     * Fetch currency exchange rate from Frankfurter API.
     */
    private function getExchangeRate(string $currencyCode): ?array
    {
        if ($currencyCode === 'EUR') {
            return null; // No need to show rate for Euro
        }

        $cacheKey = "exchange_rate_{$currencyCode}";
        return Cache::remember($cacheKey, 86400, function () use ($currencyCode) {
            try {
                $response = Http::timeout(5)->get("https://api.frankfurter.dev/v1/latest", [
                    'from' => 'EUR',
                    'to' => $currencyCode,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $rate = $data['rates'][$currencyCode] ?? null;
                    if ($rate) {
                        return [
                            'rate' => $rate,
                            'date' => $data['date'] ?? now()->toDateString(),
                        ];
                    }
                }
            } catch (\Exception $e) {
                // Silently fail
            }
            return null;
        });
    }

    /**
     * Auto-generate "Why now" text based on destination data for the given month.
     */
    private function generateWhyNow(Destination $dest, int $month, $weather, $exchangeRate): string
    {
        $monthNames = [
            1 => 'januári', 2 => 'februári', 3 => 'marci',
            4 => 'apríli', 5 => 'máji', 6 => 'júni',
            7 => 'júli', 8 => 'auguste', 9 => 'septembri',
            10 => 'októbri', 11 => 'novembri', 12 => 'decembri',
        ];
        $monthName = $monthNames[$month];

        $parts = [];

        // Temperature part
        if ($weather) {
            $temp = $weather->avg_temp;
            if ($temp >= 30) {
                $parts[] = "V {$monthName} je v destinácii {$dest->name} horúco s priemernou teplotou {$temp} °C — ideálne pre milovníkov slnka a pláže.";
            } elseif ($temp >= 20) {
                $parts[] = "V {$monthName} sa v destinácii {$dest->name} dá očakávať príjemné teplo okolo {$temp} °C — skvelé podmienky pre mestský výlet aj outdoorové aktivity.";
            } elseif ($temp >= 10) {
                $parts[] = "V {$monthName} je v destinácii {$dest->name} príjemne s teplotami okolo {$temp} °C — ideálne na turistiku a prehliadky bez horúčav.";
            } else {
                $parts[] = "V {$monthName} je v destinácii {$dest->name} chladnejšie ({$temp} °C), čo ocenia milovníci zimných aktivít a zasneženej prírody.";
            }
        }

        // Types part
        $types = $dest->destinationTypes->pluck('type')->map(fn($t) => DestinationType::label($t))->toArray();
        if (count($types) > 0) {
            $parts[] = 'Destinácia ponúka: ' . implode(', ', $types) . '.';
        }

        // Flight part
        $parts[] = "Let z Viedne trvá približne {$dest->flight_hours_from_vienna} hodín.";

        // Currency part
        if ($exchangeRate && isset($exchangeRate['rate'])) {
            $parts[] = "Miestna mena je {$dest->currency_name} (1 EUR = {$exchangeRate['rate']} {$dest->currency_code}).";
        } elseif ($dest->currency_code === 'EUR') {
            $parts[] = "Platí sa eurom, takže nepotrebujete meniť menu.";
        }

        return implode(' ', $parts);
    }
}
