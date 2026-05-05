@extends('layouts.app')

@section('title', 'Kam na dovolenku? — Nájdite svoju ideálnu destináciu')

@section('content')
<div class="page-header">
    <h1><i class="fas fa-compass"></i> Čo od dovolenky chcem?</h1>
    <p>Vyplňte formulár a my vám nájdeme ideálnu destináciu</p>
</div>

<div class="card" style="max-width: 800px; margin: 0 auto;">
    <form action="{{ route('search') }}" method="POST" id="searchForm">
        @csrf
        <div class="search-form-grid">
            {{-- Month --}}
            <div class="form-group">
                <label for="travel_month"><i class="fas fa-calendar-alt"></i> Kedy chcete cestovať?</label>
                <select name="travel_month" id="travel_month" class="form-control" required>
                    <option value="">— Vyberte mesiac —</option>
                    @foreach($months as $num => $name)
                        <option value="{{ $num }}" {{ old('travel_month') == $num ? 'selected' : '' }}>{{ $name }}</option>
                    @endforeach
                </select>
            </div>

            {{-- Duration --}}
            <div class="form-group">
                <label for="duration_days"><i class="fas fa-clock"></i> Ako dlho? (počet dní)</label>
                <input type="number" name="duration_days" id="duration_days" class="form-control"
                       min="1" max="90" value="{{ old('duration_days', 7) }}" required>
            </div>

            {{-- Vacation type --}}
            <div class="form-group full-width">
                <label><i class="fas fa-tags"></i> Čo hľadáte? (vyberte aspoň jedno)</label>
                <div class="checkbox-group">
                    @php
                        $types = [
                            'beach' => ['icon' => 'fa-umbrella-beach', 'label' => 'More a pláž'],
                            'mountains' => ['icon' => 'fa-mountain', 'label' => 'Hory a príroda'],
                            'historical' => ['icon' => 'fa-landmark', 'label' => 'Historické mestá'],
                            'city' => ['icon' => 'fa-city', 'label' => 'Mestský výlet'],
                            'adventure' => ['icon' => 'fa-hiking', 'label' => 'Aktivity a dobrodružstvo'],
                        ];
                    @endphp
                    @foreach($types as $value => $info)
                        <div class="checkbox-item">
                            <input type="checkbox" name="types[]" value="{{ $value }}"
                                   id="type_{{ $value }}"
                                   {{ is_array(old('types')) && in_array($value, old('types')) ? 'checked' : '' }}>
                            <label for="type_{{ $value }}">
                                <i class="fas {{ $info['icon'] }}"></i> {{ $info['label'] }}
                            </label>
                        </div>
                    @endforeach
                </div>
            </div>

            {{-- Temperature --}}
            <div class="form-group full-width">
                <label><i class="fas fa-thermometer-half"></i> Preferovaná teplota</label>
                <div class="radio-group">
                    @php
                        $temps = [
                            'hot' => '🔥 Horúco (30 °C+)',
                            'warm' => '☀️ Teplo (20–29 °C)',
                            'pleasant' => '🌤️ Príjemne (10–19 °C)',
                            'any' => '🤷 Jedno mi to',
                        ];
                    @endphp
                    @foreach($temps as $value => $label)
                        <div class="radio-item">
                            <input type="radio" name="temperature_pref" value="{{ $value }}"
                                   id="temp_{{ $value }}"
                                   {{ old('temperature_pref', 'any') === $value ? 'checked' : '' }}>
                            <label for="temp_{{ $value }}">{{ $label }}</label>
                        </div>
                    @endforeach
                </div>
            </div>

            {{-- Distance --}}
            <div class="form-group full-width">
                <label><i class="fas fa-plane"></i> Vzdialenosť (z Viedne)</label>
                <div class="radio-group">
                    @php
                        $distances = [
                            '3h' => '✈️ Do 3 hodín letu',
                            '5h' => '✈️ Do 5 hodín letu',
                            'anywhere' => '🌍 Kdekoľvek',
                        ];
                    @endphp
                    @foreach($distances as $value => $label)
                        <div class="radio-item">
                            <input type="radio" name="distance_pref" value="{{ $value }}"
                                   id="dist_{{ $value }}"
                                   {{ old('distance_pref', 'anywhere') === $value ? 'checked' : '' }}>
                            <label for="dist_{{ $value }}">{{ $label }}</label>
                        </div>
                    @endforeach
                </div>
            </div>

            {{-- Submit --}}
            <div class="full-width" style="text-align: center; margin-top: 0.5rem;">
                <button type="submit" class="btn btn-primary" id="searchButton">
                    <i class="fas fa-search"></i> Nájsť destinácie
                </button>
            </div>
        </div>
    </form>
</div>
@endsection
