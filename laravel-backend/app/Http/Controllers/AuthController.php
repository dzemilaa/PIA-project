<?php

namespace App\Http\Controllers;

use App\Models\Korisnik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[\pL]+$/u'],
            'password' => 'required|string',
        ], [
            'username.regex' => 'Korisničko ime sme da sadrži samo slova.',
            'username.min' => 'Korisničko ime mora imati najmanje 3 karaktera.',
            'username.max' => 'Korisničko ime može imati najviše 50 karaktera.',
        ]);

        $korisnik = Korisnik::where('username', $data['username'])->first();

        if (!$korisnik || !Hash::check($data['password'], $korisnik->password)) {
            throw ValidationException::withMessages([
                'username' => ['Pogrešno korisničko ime ili lozinka.'],
            ]);
        }

        $token = $korisnik->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'korisnik' => [
                'korisnikid' => $korisnik->korisnikid,
                'username' => $korisnik->username,
                'uloga' => $korisnik->uloga,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $korisnik = $request->user();

        return response()->json([
            'korisnikid' => $korisnik->korisnikid,
            'username' => $korisnik->username,
            'uloga' => $korisnik->uloga,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['poruka' => 'Uspešno ste se odjavili.']);
    }
}
