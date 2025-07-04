<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnifiedOrder extends Model
{
    protected $table = 'unified_orders'; // nombre de la vista
    public $timestamps = false; // no tiene timestamps gestionados por Laravel

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
