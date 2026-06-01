<?php

namespace App\Http\Controllers;

use App\Models\Klijent;
use App\Models\Mere;
use Illuminate\Http\Request;

class KlijentController extends Controller
{
    // GET /api/klijenti
    // Vraća sve klijente
    public function index()
    {
        $klijenti = Klijent::all();
        return response()->json($klijenti, 200);
    }

    // GET /api/klijenti/{id}
    // Vraća detalje jednog klijenta
    public function show($id)
    {
        $klijent = Klijent::find($id);

        if (!$klijent) {
            return response()->json(['poruka' => 'Klijent nije pronađen.'], 404);
        }

        return response()->json($klijent, 200);
    }

    // POST /api/klijenti
    // Kreira novog klijenta sa striktnom validacijom
    public function store(Request $request)
    {
        // Validacija: ime, prezime, telefon i email su obavezni
        // Ako validacija padne, Laravel automatski vraća HTTP 422 sa greškama
        $data = $request->validate([
            'ime'      => ['required', 'string', 'max:50', 'regex:/^[\pL]+(?:\s+[\pL]+)*$/u'],
            'prezime'  => ['required', 'string', 'max:50', 'regex:/^[\pL]+(?:\s+[\pL]+)*$/u'],
            'telefon'  => ['required', 'string', 'max:20', 'regex:/^\d+$/'],
            'email'    => 'required|email|max:100|unique:klijenti,email',
            'napomene' => 'nullable|string',
        ], [
            'ime.regex' => 'Ime sme da sadrži samo slova.',
            'prezime.regex' => 'Prezime sme da sadrži samo slova.',
            'telefon.regex' => 'Telefon sme da sadrži samo brojeve.',
        ]);

        $klijent = Klijent::create($data);

        return response()->json([
            'poruka' => 'Klijent je uspešno kreiran.',
            'klijent' => $klijent
        ], 201);
    }

    // PUT /api/klijenti/{id}
    // Ažurira klijenta
    public function update(Request $request, $id)
    {
        $klijent = Klijent::find($id);

        if (!$klijent) {
            return response()->json(['poruka' => 'Klijent nije pronađen.'], 404);
        }

        $data = $request->validate([
            'ime'      => ['required', 'string', 'max:50', 'regex:/^[\pL]+(?:\s+[\pL]+)*$/u'],
            'prezime'  => ['required', 'string', 'max:50', 'regex:/^[\pL]+(?:\s+[\pL]+)*$/u'],
            'telefon'  => ['required', 'string', 'max:20', 'regex:/^\d+$/'],
            'email'    => 'required|email|max:100|unique:klijenti,email,' . $id . ',klijentid',
            'napomene' => 'nullable|string',
        ], [
            'ime.regex' => 'Ime sme da sadrži samo slova.',
            'prezime.regex' => 'Prezime sme da sadrži samo slova.',
            'telefon.regex' => 'Telefon sme da sadrži samo brojeve.',
        ]);

        $klijent->update($data);

        return response()->json([
            'poruka' => 'Podaci o klijentu su uspešno ažurirani.',
            'klijent' => $klijent
        ], 200);
    }

    // DELETE /api/klijenti/{id}
    // Briše klijenta
    public function destroy($id)
    {
        $klijent = Klijent::find($id);

        if (!$klijent) {
            return response()->json(['poruka' => 'Klijent nije pronađen.'], 404);
        }

        $klijent->delete();

        return response()->json(['poruka' => 'Klijent je uspešno obrisan.'], 200);
    }

    // GET /api/klijenti/{id}/mere
    // Vraća mere određenog klijenta
    public function getMere($id)
    {
        $klijent = Klijent::find($id);
        if (!$klijent) {
            return response()->json(['poruka' => 'Klijent nije pronađen.'], 404);
        }

        $mere = Mere::where('klijentid', $id)->get();
        return response()->json($mere, 200);
    }

    // POST /api/klijenti/{id}/mere
    // Dodaje mere za klijenta sa striktnom validacijom graničnih vrednosti
    public function addMere(Request $request, $id)
    {
        $klijent = Klijent::find($id);
        if (!$klijent) {
            return response()->json(['poruka' => 'Klijent nije pronađen.'], 404);
        }

        // Striktna validacija - mere moraju biti brojevi u realnim granicama (40 do 150 cm)
        $data = $request->validate([
            'tipodece'     => 'required|string|max:100',
            'obimgrudi'    => 'required|numeric|min:40|max:150',
            'obimstruka'   => 'required|numeric|min:40|max:150',
            'obimkukova'   => 'required|numeric|min:40|max:150',
            'duzinarukava' => 'required|numeric|min:40|max:150',
        ]);

        $mere = new Mere();
        $mere->klijentid     = $id;
        $mere->tipodece      = $data['tipodece'];
        $mere->obimgrudi     = $data['obimgrudi'];
        $mere->obimstruka    = $data['obimstruka'];
        $mere->obimkukova    = $data['obimkukova'];
        $mere->duzinarukava  = $data['duzinarukava'];
        $mere->datumunosa    = now()->toDateString();
        $mere->save();

        return response()->json([
            'poruka' => 'Mere su uspešno sačuvane.',
            'mere' => $mere
        ], 201);
    }

    // DELETE /api/klijenti/{id}/mere/{mereid}
    // Briše mere klijenta
    public function obrisiMere($id, $mereid)
    {
        $mere = Mere::where('klijentid', $id)->where('mereid', $mereid)->first();

        if (!$mere) {
            return response()->json(['poruka' => 'Mere nisu pronađene.'], 404);
        }

        $mere->delete();

        return response()->json(['poruka' => 'Mere su uspešno obrisane.'], 200);
    }
}
