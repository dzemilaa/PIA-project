<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mere extends Model
{
    protected $table = 'mere';
    protected $primaryKey = 'mereid';
    public $timestamps = false;

    protected $fillable = [
        'klijentid', 
        'tipodece', 
        'obimgrudi', 
        'obimstruka', 
        'obimkukova', 
        'duzinarukava', 
        'datumunosa'
    ];

    public function klijent()
    {
        return $this->belongsTo(Klijent::class, 'klijentid', 'klijentid');
    }
}
