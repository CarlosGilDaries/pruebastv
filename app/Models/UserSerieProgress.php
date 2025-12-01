<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSerieProgress extends Model
{
     protected $fillable = [
        'user_id', 
        'serie_id', 
        'progress_seconds'
    ];

    public function serie()
    {
        return $this->belongsTo(Serie::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
