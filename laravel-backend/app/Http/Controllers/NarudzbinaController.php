<?php

namespace App\Http\Controllers;

use App\Models\Narudzbina;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NarudzbinaController extends Controller
{
    // GET /api/narudzbine
    // Vraća listu svih narudžbina sa spojenim imenom klijenta
    public function index()
    {
        $narudzbine = Narudzbina::with('klijent')->get()->map(function ($n) {
            $data = $n->toArray();
            $data['klijentImePrezime'] = $n->klijent
                ? $n->klijent->ime . ' ' . $n->klijent->prezime
                : 'Nepoznat klijent';
            unset($data['klijent']);
            return $data;
        });

        return response()->json($narudzbine, 200);
    }

    // GET /api/narudzbine/{id}
    // Vraća detalje jedne narudžbine
    public function show($id)
    {
        $n = Narudzbina::find($id);

        if (!$n) {
            return response()->json(['poruka' => 'Narudžbina nije pronađena.'], 404);
        }

        return response()->json($n, 200);
    }

    // POST /api/narudzbine
    // Kreira novu narudžbinu sa striktnom validacijom obaveznih polja
    public function store(Request $request)
    {
        // Validacija: klijentid, tipodece (opis odeće) i rokisporuke su obavezni
        // Ako validacija padne, Laravel automatski vraća HTTP 422
        $data = $request->validate([
            'klijentid'   => 'required|exists:klijenti,klijentid',
            'tipodece'    => [
                'required',
                'string',
                'max:100',
                Rule::exists('mere', 'tipodece')->where(fn ($query) => $query->where('klijentid', $request->input('klijentid'))),
            ],
            'rokizrade'   => 'required|date|after_or_equal:today',
            'rokprobe'    => 'required|date|after_or_equal:rokizrade',
            'rokisporuke' => 'required|date|after_or_equal:rokprobe',
            'cena'        => 'required|numeric|gt:0',
            'status'      => 'nullable|in:u obradi',
            'napomene'    => 'nullable|string',
        ], [
            'tipodece.exists' => 'Izabrani klijent nema unet tip odeće i mere. Unesite ih u formi za mere klijenta.',
            'rokizrade.after_or_equal' => 'Rok izrade ne može biti datum iz prošlosti.',
            'rokprobe.after_or_equal' => 'Rok probe mora biti nakon roka izrade.',
            'rokisporuke.after_or_equal' => 'Rok isporuke mora biti nakon roka probe.',
            'cena.gt' => 'Cena mora biti veća od 0.',
        ]);

        $n = new Narudzbina();
        $n->klijentid      = $data['klijentid'];
        $n->korisnikid     = $request->input('korisnikid', 1); // Krojač/korisnik ID
        $n->tipodece       = $data['tipodece'];
        $n->datumkreiranja = now()->toDateString();
        $n->rokprobe       = $data['rokprobe'];
        $n->rokizrade      = $data['rokizrade'];
        $n->rokisporuke    = $data['rokisporuke'];
        $n->status         = 'u obradi';
        $n->napomene       = $data['napomene'];
        $n->cena           = $data['cena'];
        $n->save();

        return response()->json([
            'poruka' => 'Narudžbina je uspešno kreirana.',
            'narudzbina' => $n
        ], 201);
    }

    // PUT /api/narudzbine/{id}
    // Ažurira narudžbinu
    public function update(Request $request, $id)
    {
        $n = Narudzbina::find($id);

        if (!$n) {
            return response()->json(['poruka' => 'Narudžbina nije pronađena.'], 404);
        }

        // Validacija promena
        $data = $request->validate([
            'klijentid'   => 'required|exists:klijenti,klijentid',
            'tipodece'    => [
                'required',
                'string',
                'max:100',
                Rule::exists('mere', 'tipodece')->where(fn ($query) => $query->where('klijentid', $request->input('klijentid'))),
            ],
            'rokizrade'   => 'required|date|after_or_equal:today',
            'rokprobe'    => 'required|date|after_or_equal:rokizrade',
            'rokisporuke' => 'required|date|after_or_equal:rokprobe',
            'cena'        => 'required|numeric|gt:0',
            'status'      => 'required|in:u obradi,u izradi,završeno,otkazano',
            'napomene'    => 'nullable|string',
        ], [
            'tipodece.exists' => 'Izabrani klijent nema unet tip odeće i mere. Unesite ih u formi za mere klijenta.',
            'rokizrade.after_or_equal' => 'Rok izrade ne može biti datum iz prošlosti.',
            'rokprobe.after_or_equal' => 'Rok probe mora biti nakon roka izrade.',
            'rokisporuke.after_or_equal' => 'Rok isporuke mora biti nakon roka probe.',
            'cena.gt' => 'Cena mora biti veća od 0.',
        ]);

        $n->klijentid   = $data['klijentid'];
        $n->tipodece    = $data['tipodece'];
        $n->rokprobe    = $data['rokprobe'];
        $n->rokizrade   = $data['rokizrade'];
        $n->rokisporuke = $data['rokisporuke'];
        $n->status      = $data['status'];
        $n->napomene    = $data['napomene'];
        $n->cena        = $data['cena'];
        $n->save();

        return response()->json([
            'poruka' => 'Narudžbina je uspešno ažurirana.',
            'narudzbina' => $n
        ], 200);
    }

    // DELETE /api/narudzbine/{id}
    // Briše narudžbinu
    public function destroy($id)
    {
        $n = Narudzbina::find($id);

        if (!$n) {
            return response()->json(['poruka' => 'Narudžbina nije pronađena.'], 404);
        }

        $n->delete();

        return response()->json(['poruka' => 'Narudžbina je uspešno obrisana.'], 200);
    }
}
