<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    protected $fillable = [
        'name',
        'picture',
        'order',
        'text',
        'subtext',
        'button_text',
        'url'
    ];
}
