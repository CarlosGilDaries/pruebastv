<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Bill extends Model
{
        protected $fillable = [
        'user_id',
		'url'
    ];
	
	    public function user() 
    {
        return $this->belongsTo(User::class);
    }
	
    public function billable(): MorphTo
    {
        return $this->morphTo();
    }
}