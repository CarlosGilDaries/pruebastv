<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'cover'
    ];

    public function movies()
    {
        return $this->belongsToMany(Movie::class);
    }
}
