<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Narudzbina extends Model
{
    protected $table = 'narudzbine';
    protected $primaryKey = 'narudzbinaid';
    public $timestamps = false;

    protected $fillable = [
        'klijentid', 
        'korisnikid', 
        'tipodece', 
        'datumkreiranja', 
        'rokprobe', 
        'rokizrade', 
        'rokisporuke', 
        'status', 
        'napomene', 
        'cena'
    ];

    public function klijent()
    {
        return $this->belongsTo(Klijent::class, 'klijentid', 'klijentid');
    }
}
