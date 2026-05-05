<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\StatisticsController;

// Main search form
Route::get('/', [HomeController::class, 'index'])->name('home');

// Search results
Route::post('/search', [SearchController::class, 'search'])->name('search');

// Destination detail
Route::get('/destination/{id}', [DestinationController::class, 'show'])->name('destination.show');

// Compare two destinations
Route::post('/compare', [DestinationController::class, 'compare'])->name('destination.compare');

// Statistics
Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics');
