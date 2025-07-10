<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserMovieProgress extends Model
{
    protected $fillable = [
        'user_id', 
        'movie_id', 
        'progress_seconds'
    ];
}
