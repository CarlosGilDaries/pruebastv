<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\CustomResetPassword;

class User extends Authenticatable implements MustVerifyEmail
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
        'phone_code',
        'phone',
        'city',
        'country',
        'birth_year',
        'gender',
        'password',
        'free_available',
        'plan_id',
        'rol',
        'role_id',
        'plan_expires_at',
        'email_verified_at'
    ];

    protected $casts = [
        'plan_expires_at' => 'datetime',
    ];

    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmail);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    public function favorites()
    {
        return $this->belongsToMany(Movie::class, 'favorites');
    }

    public function viewed()
    {
        return $this->belongsToMany(Movie::class, 'viewed_content');
    }

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

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function permissions()
    {
        return $this->role->permissions();
    }

    public function movieProgress() 
    {
        return $this->hasMany(UserMovieProgress::class);
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
