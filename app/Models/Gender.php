<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gender extends Model
{
    protected $fillable = ['
    name',
    'cover'
];

    public function movies() 
    {
        return $this->hasMany(Movie::class);
    }
}
