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

    public function seoSetting()
    {
        return $this->belongsTo(SeoSetting::class);
    }

    public function scripts()
    {
        return $this->hasMany(Script::class);
    }
}
