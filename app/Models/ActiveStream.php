<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActiveStream extends Model
{
    protected $fillable = [
        'user_id', 
        'device_id', 
        'started_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function user_session()
    {
        return $this->belongsTo(UserSession::class);
    }
}
