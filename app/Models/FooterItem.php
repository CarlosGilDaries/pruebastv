<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterItem extends Model
{
    protected $table = 'footer_items';
    protected $fillable = [
        'name',
        'logo',
        'url',
        'description'
    ]; 
}
