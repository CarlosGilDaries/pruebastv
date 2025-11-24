<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Script extends Model
{
    protected $fillable = [
        'key',
        'type', 
        'code',
        'site_id',
        'movie_id',
        'tag_id',
        'gender_id',
        'category_id'
    ];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    public function serie()
    {
        return $this->belongsTo(Serie::class);
    }

    public function action()
    {
        return $this->belongsTo(Action::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}
