<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    protected $fillable = [
        'title',
        'cover',
        'tall_cover',
        'trailer',
        'overview',
        'tagline',
        'gender_id',
        'type',
        'url',
        'pay_per_view',
        'pay_per_view_price',
        'start_time',
        'end_time',
        'duration',
        'slug',
    ];

    public function plans()
    {
        return $this->belongsToMany(Plan::class);
    }

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }
	
	public function ppvOrders()
    {
        return $this->hasMany(PpvOrder::class);
    }

    public function ads()
    {
        return $this->belongsToMany(Ad::class)
            ->withPivot('type', 'midroll_time', 'skippable', 'skip_time', 'image', 'description', 'redirect_url');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function usersWhoViewed()
    {
        return $this->belongsToMany(User::class, 'viewed_content');
    }

    public function usersWhoFavorited()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }
}
