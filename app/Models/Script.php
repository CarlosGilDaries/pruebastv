<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Script extends Model
{
    protected $fillable = [
        'key', 
        'code'
    ];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
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
