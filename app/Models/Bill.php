<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Bill extends Model
{
        protected $fillable = [
        'user_dni',
        'amount',
        'payment_method',
		'url',
		'bill_number'
    ];
	
	    public function user() 
    {
        return $this->belongsTo(User::class);
    }
	
    public function billable(): MorphTo
    {
        return $this->morphTo(null, 'billable_type', 'billable_reference', 'reference');
    }
}