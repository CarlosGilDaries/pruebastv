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
        'commercial_registry_text',
        'lopd_text',
        'favicon',
        'logo',
        'facebook',
        'instagram',
        'twitter',
    ];
}