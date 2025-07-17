<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivacyPolitic extends Model
{
    protected $fillable = [
        'title',
        'text'
    ];
}
