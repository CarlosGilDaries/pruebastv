<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rent extends Model
{
    protected $fillable = [
        'movie_id',
        'user_id',
        'expires_at'
    ]; 
}
