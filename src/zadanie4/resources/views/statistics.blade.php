@extends('layouts.app')

@section('title', 'Štatistiky — Kam na dovolenku?')

@section('content')
<div class="page-header">
    <h1><i class="fas fa-chart-bar"></i> Štatistiky portálu</h1>
    <p>Prehľad využívania aplikácie</p>
</div>

{{-- Visit counters --}}
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-label"><i class="fas fa-eye"></i> Celkový počet návštev</div>
        <div class="stat-value">{{ number_format($totalVisits) }}</div>
    </div>
    <div class="stat-card">
        <div class="stat-label"><i class="fas fa-user"></i> Unikátne návštevy</div>
        <div class="stat-value">{{ number_format($uniqueVisits) }}</div>
    </div>
</div>

{{-- Visits by time of day --}}
<div class="chart-container">
    <h3><i class="fas fa-clock"></i> Návštevnosť podľa dennej doby</h3>
    <canvas id="timeSlotChart" height="100"></canvas>
</div>

{{-- Preference charts --}}
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
    <div class="chart-container">
        <h3><i class="fas fa-tags"></i> Najhľadanejšie typy dovolenky</h3>
        <canvas id="typeChart" height="150"></canvas>
    </div>
    <div class="chart-container">
        <h3><i class="fas fa-thermometer-half"></i> Klimatické preferencie</h3>
        <canvas id="tempChart" height="150"></canvas>
    </div>
</div>

{{-- Most searched destinations --}}
<div class="chart-container">
    <h3><i class="fas fa-search"></i> Čo ľudia hľadajú</h3>
    @if($searchedDestinations->isEmpty())
        <p style="color: var(--text-muted); text-align: center; padding: 2rem;">Zatiaľ žiadne vyhľadávania.</p>
    @else
        <table class="data-table" id="searchTable">
            <thead>
                <tr>
                    <th data-sort="name" id="sort-name">
                        Destinácia <span class="sort-icon">⇕</span>
                    </th>
                    <th data-sort="country" id="sort-country">
                        Štát <span class="sort-icon">⇕</span>
                    </th>
                    <th data-sort="count" id="sort-count">
                        Počet vyhľadávaní <span class="sort-icon">⇕</span>
                    </th>
                </tr>
            </thead>
            <tbody id="searchTableBody">
                @foreach($searchedDestinations as $item)
                    <tr>
                        <td data-name="{{ $item['name'] }}">{{ $item['name'] }}</td>
                        <td data-country="{{ $item['country'] }}">{{ $item['country'] }}</td>
                        <td data-count="{{ $item['count'] }}">{{ $item['count'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Chart.js defaults for dark theme
    Chart.defaults.color = '#8899aa';
    Chart.defaults.borderColor = '#2a3a4a';

    const chartColors = ['#00d4aa', '#4d96ff', '#ff6b6b', '#ffd93d', '#6bcb77', '#9b59b6'];

    // Time slot chart
    const timeSlotCtx = document.getElementById('timeSlotChart');
    if (timeSlotCtx) {
        new Chart(timeSlotCtx, {
            type: 'bar',
            data: {
                labels: {!! json_encode(array_column($timeSlotData, 'label')) !!},
                datasets: [{
                    label: 'Počet návštev',
                    data: {!! json_encode(array_column($timeSlotData, 'count')) !!},
                    backgroundColor: chartColors.slice(0, {{ count($timeSlotData) }}),
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    // Type preferences chart
    const typeCtx = document.getElementById('typeChart');
    if (typeCtx) {
        new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: {!! json_encode(array_column($typeChartData, 'label')) !!},
                datasets: [{
                    data: {!! json_encode(array_column($typeChartData, 'count')) !!},
                    backgroundColor: chartColors,
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 15 } }
                }
            }
        });
    }

    // Temperature preferences chart
    const tempCtx = document.getElementById('tempChart');
    if (tempCtx) {
        new Chart(tempCtx, {
            type: 'doughnut',
            data: {
                labels: {!! json_encode(array_column($tempChartData, 'label')) !!},
                datasets: [{
                    data: {!! json_encode(array_column($tempChartData, 'count')) !!},
                    backgroundColor: ['#ff6b6b', '#ffd93d', '#4d96ff', '#8899aa'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 15 } }
                }
            }
        });
    }

    // Sortable table
    const table = document.getElementById('searchTable');
    if (table) {
        let currentSort = { column: null, dir: 'asc' };

        table.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', function() {
                const column = this.dataset.sort;
                const dir = (currentSort.column === column && currentSort.dir === 'asc') ? 'desc' : 'asc';
                currentSort = { column, dir };

                const tbody = document.getElementById('searchTableBody');
                const rows = Array.from(tbody.querySelectorAll('tr'));

                rows.sort((a, b) => {
                    let valA, valB;

                    if (column === 'count') {
                        valA = parseInt(a.querySelector(`td[data-${column}]`).dataset[column]);
                        valB = parseInt(b.querySelector(`td[data-${column}]`).dataset[column]);
                        return dir === 'asc' ? valA - valB : valB - valA;
                    } else if (column === 'country') {
                        // Sort by country first, then by name
                        valA = a.querySelector('td[data-country]').dataset.country.toLowerCase();
                        valB = b.querySelector('td[data-country]').dataset.country.toLowerCase();
                        if (valA !== valB) {
                            return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                        }
                        // Secondary sort by name
                        let nameA = a.querySelector('td[data-name]').dataset.name.toLowerCase();
                        let nameB = b.querySelector('td[data-name]').dataset.name.toLowerCase();
                        return nameA.localeCompare(nameB);
                    } else {
                        valA = a.querySelector(`td[data-${column}]`).dataset[column].toLowerCase();
                        valB = b.querySelector(`td[data-${column}]`).dataset[column].toLowerCase();
                        return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    }
                });

                rows.forEach(row => tbody.appendChild(row));

                // Update sort indicators
                table.querySelectorAll('.sort-icon').forEach(icon => icon.textContent = '⇕');
                this.querySelector('.sort-icon').textContent = dir === 'asc' ? '↑' : '↓';
            });
        });
    }
});
</script>

<style>
    @media (max-width: 768px) {
        div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
        }
    }
</style>
@endsection
