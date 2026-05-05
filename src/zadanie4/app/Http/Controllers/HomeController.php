<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Show the search form — the main landing page.
     */
    public function index()
    {
        $months = [
            1 => 'Január', 2 => 'Február', 3 => 'Marec',
            4 => 'Apríl', 5 => 'Máj', 6 => 'Jún',
            7 => 'Júl', 8 => 'August', 9 => 'September',
            10 => 'Október', 11 => 'November', 12 => 'December',
        ];

        return view('home', compact('months'));
    }
}
