<?php

namespace App\Models;

//use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'name',
        'surnames',
        'dni',
        'address',
        'city',
        'country',
        'birthday',
        'gender',
        'password',
        'plan_id',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function sessions() 
    {
        return $this->hasMany(UserSession::class);
    }

    public function ActiveStreams() 
    {
        return $this->hasMany(ActiveStream::class);
    }

        public function planOrders()
    {
        return $this->hasMany(PlanOrder::class);
    }
	
	    public function ppvOrders()
    {
        return $this->hasMany(PpvOrder::class);
    }
	
	    public function bills() 
    {
        return $this->hasMany(Bill::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
