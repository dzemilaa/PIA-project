<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Korisnik extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'korisnici';
    protected $primaryKey = 'korisnikid';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'korisnikid',
        'username',
        'password',
        'uloga',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->uloga === 'admin';
    }

    public function isKrojac(): bool
    {
        return $this->uloga === 'krojac';
    }
}
