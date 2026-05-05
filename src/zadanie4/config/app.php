<?php

return [
    'name' => env('APP_NAME', 'Kam na dovolenku?'),
    'env' => env('APP_ENV', 'local'),
    'debug' => (bool) env('APP_DEBUG', true),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'Europe/Bratislava',
    'locale' => 'sk',
    'fallback_locale' => 'en',
    'faker_locale' => 'sk_SK',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'maintenance' => [
        'driver' => 'file',
    ],
    'providers' => Illuminate\Support\ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
    ])->toArray(),
    'aliases' => Illuminate\Support\Facades\Facade::defaultAliases()->merge([
    ])->toArray(),
];
