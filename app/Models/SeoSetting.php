<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    protected $fillable = [
        'key', 
        'title', 
        'description', 
        'keywords', 
        'robots', 
        'url', 
        'canonical'
    ];

    public function movie()
    {
        return $this->hasOne(Movie::class);
    }

    public function seoSetting()
    {
        return $this->hasOne(Serie::class);
    }

    public function episode()
    {
        return $this->hasOne(Serie::class);
    }

    public function tag()
    {
        return $this->hasOne(Tag::class);
    }

    public function gender()
    {
        return $this->hasOne(Gender::class);
    }

    public function category()
    {
        return $this->hasOne(Category::class);
    }

    public function action()
    {
        return $this->hasOne(Action::class);
    }
}
