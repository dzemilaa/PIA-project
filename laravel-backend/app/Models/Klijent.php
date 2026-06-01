<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Klijent extends Model
{
    protected $table = 'klijenti';
    protected $primaryKey = 'klijentid';
    public $timestamps = false;

    protected $fillable = [
        'ime', 
        'prezime', 
        'telefon', 
        'email', 
        'napomene'
    ];

    public function mere()
    {
        return $this->hasMany(Mere::class, 'klijentid', 'klijentid');
    }

    public function narudzbine()
    {
        return $this->hasMany(Narudzbina::class, 'klijentid', 'klijentid');
    }
}
