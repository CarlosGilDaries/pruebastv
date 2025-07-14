<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Creagia\LaravelRedsys\Concerns\CanCreateRedsysRequests;
use Creagia\LaravelRedsys\Contracts\RedsysPayable;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class PlanOrder extends Model implements RedsysPayable
{
    protected $fillable = [
        'reference',
        'months',
        'amount',
        'status',
        'user_id',
        'plan_id',
		'description',
        'payment_method'
    ];

    use CanCreateRedsysRequests;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

        public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
	
    public function bill(): MorphOne
    {
        return $this->morphOne(Bill::class, 'billable');
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
		
		app(\App\Http\Controllers\BillPdfController::class)->generatePlanOrderInvoice($this);
	}
}