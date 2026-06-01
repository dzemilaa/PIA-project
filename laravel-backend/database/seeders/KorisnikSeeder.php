<?php

namespace Database\Seeders;

use App\Models\Korisnik;
use Illuminate\Database\Seeder;

class KorisnikSeeder extends Seeder
{
    public function run(): void
    {
        Korisnik::updateOrCreate(
            ['korisnikid' => 1],
            [
                'username' => 'admin',
                'password' => 'admin123',
                'uloga' => 'admin',
            ]
        );

        Korisnik::updateOrCreate(
            ['korisnikid' => 2],
            [
                'username' => 'krojac',
                'password' => 'krojac123',
                'uloga' => 'krojac',
            ]
        );
    }
}
