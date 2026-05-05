@extends('layouts.app')

@section('title', $destination->name . ' — Kam na dovolenku?')

@section('content')
<a href="javascript:history.back()" class="back-link">
    <i class="fas fa-arrow-left"></i> Späť na výsledky
</a>

<div class="page-header">
    <h1>
        <img src="{{ $destination->flag_url }}" alt="{{ $destination->country }}" class="flag-img flag-img-lg">
        {{ $destination->name }}
    </h1>
    <p>{{ $destination->country }} · {{ $monthName }}</p>
</div>

{{-- Why now section --}}
<div class="why-now">
    <h3><i class="fas fa-lightbulb"></i> Prečo práve teraz?</h3>
    <p>{{ $whyNow }}</p>
</div>

<div class="detail-grid">
    {{-- 1. Weather --}}
    <div class="detail-section">
        <h3><i class="fas fa-cloud-sun"></i> Počasie v {{ $monthName }}</h3>
        @if($historicalWeather)
            <div style="margin-bottom: 1rem;">
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 4px;">Historický priemer</p>
                <div style="display: flex; gap: 1.5rem;">
                    <div>
                        <div class="stat-value">{{ $historicalWeather->avg_temp }} °C</div>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">priemer</span>
                    </div>
                    <div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--info);">{{ $historicalWeather->avg_min_temp }} °C</div>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">minimum</span>
                    </div>
                    <div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--danger);">{{ $historicalWeather->avg_max_temp }} °C</div>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">maximum</span>
                    </div>
                </div>
            </div>
        @else
            <p style="color: var(--text-muted);">Historické údaje nie sú dostupné.</p>
        @endif

        @if($forecast)
            <div>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 4px;">Aktuálna predpoveď</p>
                <div style="display: flex; gap: 1.5rem; align-items: center;">
                    <div>
                        <div style="font-size: 1.4rem; font-weight: 700; color: var(--warning);">
                            {{ $forecast['temperature_2m'] ?? '—' }} °C
                        </div>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">teraz</span>
                    </div>
                    @if(isset($forecast['wind_speed_10m']))
                        <div>
                            <div style="font-size: 1rem; color: var(--text-secondary);">
                                <i class="fas fa-wind"></i> {{ $forecast['wind_speed_10m'] }} km/h
                            </div>
                        </div>
                    @endif
                    @if(isset($forecast['relative_humidity_2m']))
                        <div>
                            <div style="font-size: 1rem; color: var(--text-secondary);">
                                <i class="fas fa-tint"></i> {{ $forecast['relative_humidity_2m'] }}%
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        @else
            <p style="color: var(--text-muted); margin-top: 0.5rem;">Aktuálna predpoveď nie je dostupná.</p>
        @endif
    </div>

    {{-- 2. Country info --}}
    <div class="detail-section">
        <h3><i class="fas fa-globe-europe"></i> Štát a základné informácie</h3>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem;">
            <img src="{{ $destination->flag_url }}" alt="{{ $destination->country }}" style="width: 64px; height: 48px; border-radius: 4px; border: 1px solid var(--border);">
            <div>
                <div style="font-size: 1.2rem; font-weight: 600;">{{ $destination->country }}</div>
                <div style="color: var(--text-secondary);">{{ $destination->name }}</div>
            </div>
        </div>
        <div style="color: var(--text-secondary);">
            <p><i class="fas fa-building"></i> <strong>Hlavné mesto:</strong> {{ $destination->capital }}</p>
            <p style="margin-top: 0.5rem;"><i class="fas fa-plane-departure"></i> <strong>Let z Viedne:</strong> ~{{ $destination->flight_hours_from_vienna }} hodín</p>
        </div>
        <div style="margin-top: 1rem;">
            <p style="color: var(--text-secondary); font-size: 0.85rem;"><strong>Typ destinácie:</strong></p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
                @foreach($destination->destinationTypes as $dt)
                    <span style="background: var(--accent-dim); color: var(--accent); padding: 4px 12px; border-radius: 12px; font-size: 0.8rem;">
                        {{ \App\Models\DestinationType::label($dt->type) }}
                    </span>
                @endforeach
            </div>
        </div>
    </div>

    {{-- 3. Currency --}}
    <div class="detail-section">
        <h3><i class="fas fa-coins"></i> Mena a kurz</h3>
        <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">
            {{ $destination->currency_name }} ({{ $destination->currency_code }})
        </div>
        @if($destination->currency_code === 'EUR')
            <p style="color: var(--success);">
                <i class="fas fa-check-circle"></i> Krajina používa euro — nie je potrebná výmena meny.
            </p>
        @elseif($exchangeRate)
            <div style="margin-top: 0.5rem;">
                <div class="stat-value">1 EUR = {{ number_format($exchangeRate['rate'], 2) }} {{ $destination->currency_code }}</div>
                <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">
                    Kurz k {{ $exchangeRate['date'] }} (zdroj: Frankfurter)
                </p>
            </div>
        @else
            <p style="color: var(--text-muted);">Aktuálny kurz nie je dostupný.</p>
        @endif
    </div>

    {{-- 4. Description --}}
    <div class="detail-section">
        <h3><i class="fas fa-info-circle"></i> O destinácii</h3>
        <p style="color: var(--text-secondary); line-height: 1.8;">
            {{ $destination->description ?? 'Popis nie je dostupný.' }}
        </p>
    </div>
</div>
@endsection
