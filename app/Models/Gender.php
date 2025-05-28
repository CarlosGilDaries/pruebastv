<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gender extends Model
{
    protected $fillable = ['name'];

    public function movies() 
    {
        return $this->hasMany(Movie::class);
    }
}
