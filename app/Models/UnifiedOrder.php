<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnifiedOrder extends Model
{
    protected $table = 'unified_orders';
    public $timestamps = false; 

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
