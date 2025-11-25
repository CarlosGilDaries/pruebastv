<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
        protected $fillable = [
        'title',
        'brand',
        'type',
        'url',
        'duration',
        'slug',
    ];

    public function movies()
    {
        return $this->belongsToMany(Movie::class)
            ->withPivot('type', 'midroll_time', 'skippable', 'skip_time', 'image', 'description', 'redirect_url');
    }

    public function series()
    {
        return $this->belongsToMany(Serie::class)
            ->withPivot('type', 'midroll_time', 'skippable', 'skip_time');
    }
}
