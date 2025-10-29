<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $fillable = [
        'name',
        'cover',
        'priority',
        'render_at_index'
    ]; 

    public function movies()
    {
        return $this->belongsToMany(Movie::class);
    }

    public function seoSetting()
    {
        return $this->belongsTo(SeoSetting::class);
    }
}
