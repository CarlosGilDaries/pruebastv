<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Creagia\LaravelRedsys\Concerns\CanCreateRedsysRequests;
use Creagia\LaravelRedsys\Contracts\RedsysPayable;

class PpvOrder extends Model implements RedsysPayable
{
    protected $fillable = [
        'reference',
        'amount',
        'status',
        'user_id',
        'movie_id',
		'description',
    ];

    use CanCreateRedsysRequests;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

        public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    public function getTotalAmount(): int
    {
        // Devuelve el importe en céntimos (19.99€ = 1999)
        return (int) ($this->amount * 100);
    }

    public function paidWithRedsys(): void
    {
        // Lógica cuando el pago es exitoso
        $this->update([
            'status' => 'paid',
        ]);
    }

}