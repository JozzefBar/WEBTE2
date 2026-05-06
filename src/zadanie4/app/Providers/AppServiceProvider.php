<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Force root URL from .env so links include /Z4 or /zadanie4 prefix
        URL::forceRootUrl(config('app.url'));

        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
