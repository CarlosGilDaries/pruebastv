<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $fillable = [
        'name',
        'priority'
    ]; 

    public function movies()
    {
        return $this->belongsToMany(Movie::class);
    }
}
