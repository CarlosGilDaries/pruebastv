<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalNotice extends Model
{
    protected $fillable = [
        'title',
        'text'
    ];
}
