@extends('layouts.app')

@section('title', 'Porovnanie destinácií — Kam na dovolenku?')

@section('content')
<a href="javascript:history.back()" class="back-link">
    <i class="fas fa-arrow-left"></i> Späť na výsledky
</a>

<div class="page-header">
    <h1>Porovnanie destinácií</h1>
    <p>{{ $data[0]['destination']->name }} vs {{ $data[1]['destination']->name }} · {{ $monthName }}</p>
</div>

<table class="compare-table">
    <thead>
        <tr>
            <th class="label-col">Vlastnosť</th>
            <th>
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="{{ $data[0]['destination']->flag_url }}" class="flag-img" alt="">
                    {{ $data[0]['destination']->name }}
                </div>
            </th>
            <th>
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="{{ $data[1]['destination']->flag_url }}" class="flag-img" alt="">
                    {{ $data[1]['destination']->name }}
                </div>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="label-col">Krajina</td>
            <td>{{ $data[0]['destination']->country }}</td>
            <td>{{ $data[1]['destination']->country }}</td>
        </tr>
        <tr>
            <td class="label-col">Typ destinácie</td>
            <td>{{ implode(', ', $data[0]['types']) }}</td>
            <td>{{ implode(', ', $data[1]['types']) }}</td>
        </tr>
        <tr>
            <td class="label-col">Priemerná teplota ({{ $monthName }})</td>
            <td>{{ $data[0]['weather'] ? $data[0]['weather']->avg_temp . ' °C' : '—' }}</td>
            <td>{{ $data[1]['weather'] ? $data[1]['weather']->avg_temp . ' °C' : '—' }}</td>
        </tr>
        <tr>
            <td class="label-col">Min. teplota</td>
            <td>{{ $data[0]['weather'] ? $data[0]['weather']->avg_min_temp . ' °C' : '—' }}</td>
            <td>{{ $data[1]['weather'] ? $data[1]['weather']->avg_min_temp . ' °C' : '—' }}</td>
        </tr>
        <tr>
            <td class="label-col">Max. teplota</td>
            <td>{{ $data[0]['weather'] ? $data[0]['weather']->avg_max_temp . ' °C' : '—' }}</td>
            <td>{{ $data[1]['weather'] ? $data[1]['weather']->avg_max_temp . ' °C' : '—' }}</td>
        </tr>
        <tr>
            <td class="label-col">Aktuálna teplota</td>
            <td>{{ $data[0]['forecast']['temperature_2m'] ?? '—' }} °C</td>
            <td>{{ $data[1]['forecast']['temperature_2m'] ?? '—' }} °C</td>
        </tr>
        <tr>
            <td class="label-col">Let z Viedne</td>
            <td>~{{ $data[0]['destination']->flight_hours_from_vienna }} h</td>
            <td>~{{ $data[1]['destination']->flight_hours_from_vienna }} h</td>
        </tr>
        <tr>
            <td class="label-col">Mena</td>
            <td>
                {{ $data[0]['destination']->currency_name }} ({{ $data[0]['destination']->currency_code }})
                @if($data[0]['exchangeRate'])
                    <br><small style="color:var(--text-muted);">1 EUR = {{ number_format($data[0]['exchangeRate']['rate'], 2) }} {{ $data[0]['destination']->currency_code }}</small>
                @elseif($data[0]['destination']->currency_code === 'EUR')
                    <br><small style="color:var(--success);">Euro zóna</small>
                @endif
            </td>
            <td>
                {{ $data[1]['destination']->currency_name }} ({{ $data[1]['destination']->currency_code }})
                @if($data[1]['exchangeRate'])
                    <br><small style="color:var(--text-muted);">1 EUR = {{ number_format($data[1]['exchangeRate']['rate'], 2) }} {{ $data[1]['destination']->currency_code }}</small>
                @elseif($data[1]['destination']->currency_code === 'EUR')
                    <br><small style="color:var(--success);">Euro zóna</small>
                @endif
            </td>
        </tr>
    </tbody>
</table>
@endsection
