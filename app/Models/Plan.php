<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'max_devices',
        'max_streams',
        'ads'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function movies()
    {
        return $this->belongsToMany(Movie::class);
    }

    public function planOrders()
    {
        return $this->hasMany(PlanOrder::class);
    }

}
