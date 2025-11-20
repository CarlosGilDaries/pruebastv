<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Serie extends Model
{
    protected $fillable = [
        'title', 
        'slug',
        'movie_id', 
        'type',
        'season_number', 
        'episode_number',
        'url',
        'image_url',
        'seo_setting_id',
        'type'
    ];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    public function seoSetting()
    {
        return $this->belongsTo(SeoSetting::class);
    }
}
