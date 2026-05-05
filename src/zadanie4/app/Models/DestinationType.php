<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DestinationType extends Model
{
    protected $fillable = ['destination_id', 'type'];
    public $timestamps = false;

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    /**
     * Human-readable label for the type (in Slovak).
     */
    public static function label(string $type): string
    {
        return match ($type) {
            'beach' => 'More a pláž',
            'mountains' => 'Hory a príroda',
            'historical' => 'Historické mestá',
            'city' => 'Mestský výlet',
            'adventure' => 'Aktivity a dobrodružstvo',
            default => $type,
        };
    }
}
