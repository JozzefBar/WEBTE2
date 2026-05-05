@extends('layouts.app')

@section('title', 'Výsledky vyhľadávania — Kam na dovolenku?')

@section('content')
<a href="{{ route('home') }}" class="back-link">
    <i class="fas fa-arrow-left"></i> Späť na vyhľadávanie
</a>

<div class="page-header">
    <h1>Odporúčané destinácie</h1>
    <p>
        {{ $monthName }} · {{ $search['duration_days'] }} dní ·
        @foreach($search['types'] as $type)
            {{ \App\Models\DestinationType::label($type) }}@if(!$loop->last), @endif
        @endforeach
    </p>
</div>

@if($results->isEmpty())
    <div class="alert alert-info" style="text-align:center;">
        <i class="fas fa-info-circle"></i> Pre zadané kritériá sme nenašli žiadne destinácie. Skúste zmeniť filtre.
    </div>
@else
    <form action="{{ route('destination.compare') }}" method="POST" id="compareForm">
        @csrf
        <input type="hidden" name="month" value="{{ $search['travel_month'] }}">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span style="color: var(--text-secondary); font-size: 0.9rem;">
                Nájdených {{ $results->count() }} destinácií
            </span>
            <button type="submit" class="btn btn-secondary btn-sm" id="compareButton" disabled>
                <i class="fas fa-columns"></i> Porovnať vybrané (0/2)
            </button>
        </div>

        @foreach($results as $item)
            <div class="result-card">
                <div class="compare-check">
                    <input type="checkbox" name="destinations[]" value="{{ $item['destination']->id }}"
                           class="compare-checkbox" data-name="{{ $item['destination']->name }}">
                </div>
                <div class="result-info">
                    <div class="result-header">
                        <img src="{{ $item['destination']->flag_url }}" alt="{{ $item['destination']->country }}" class="flag-img">
                        <h3>
                            <a href="{{ route('destination.show', $item['destination']->id) }}?month={{ $search['travel_month'] }}&{{ http_build_query(array_diff_key($search, ['travel_month' => ''])) }}">
                                {{ $item['destination']->name }}
                            </a>
                        </h3>
                        <span class="country">{{ $item['destination']->country }}</span>
                    </div>
                    <ul class="result-reasons">
                        @foreach($item['reasons'] as $reason)
                            <li>{!! $reason !!}</li>
                        @endforeach
                    </ul>
                </div>
                <div class="score-badge">{{ $item['score'] }}</div>
            </div>
        @endforeach
    </form>
@endif

<script>
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.compare-checkbox');
    const compareBtn = document.getElementById('compareButton');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const checked = document.querySelectorAll('.compare-checkbox:checked');
            compareBtn.textContent = `Porovnať vybrané (${checked.length}/2)`;
            compareBtn.disabled = checked.length !== 2;

            // Only allow max 2 selected
            if (checked.length > 2) {
                this.checked = false;
                const newChecked = document.querySelectorAll('.compare-checkbox:checked');
                compareBtn.textContent = `Porovnať vybrané (${newChecked.length}/2)`;
                compareBtn.disabled = newChecked.length !== 2;
            }
        });
    });
});
</script>
@endsection
