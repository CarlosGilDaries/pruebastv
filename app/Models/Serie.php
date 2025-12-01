<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Serie extends Model
{
    protected $fillable = [
        'title', 
        'slug',
        'movie_id', 
        'type',
        'season_number', 
        'episode_number',
        'duration',
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

    public function scripts()
    {
        return $this->hasMany(Script::class);
    }

    public function ads()
    {
        return $this->belongsToMany(Ad::class)
            ->withPivot('type', 'midroll_time', 'skippable', 'skip_time');
    }

    public function episodeProgress() 
    {
        $user = Auth::user();

        return $this->hasMany(UserSerieProgress::class)
                ->where('user_id', $user->id);
    }
}
