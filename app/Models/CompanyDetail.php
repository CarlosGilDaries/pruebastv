<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyDetail extends Model
{
        protected $fillable = [
        'name',
        'fiscal_address',
        'nif_cif',
        'email',
        'phone_number',
        'facebook',
		'instagram',
		'twitter',
		'github',
    ];
}