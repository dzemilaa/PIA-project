<?php

namespace App\Http\Controllers;

use App\Models\Klijent;
use App\Models\Mere;
use Illuminate\Http\Request;

class KlijentController extends Controller
{
    private const VALIDATION_MESSAGES = [
        'ime.regex'     => 'Ime sme da sadrži samo slova.',
        'prezime.regex' => 'Prezime sme da sadrži samo slova.',
        'telefon.regex' => 'Telefon sme da sadrži samo brojeve.',
    ];

    private function clientRules(int|string|null $exceptId = null): array
    {
        return [
            'ime'      => ['required', 'string', 'max:50', 'regex:/^[\pL]+(?:\s+[\pL]+)*$/u'],
            'prezime'  => ['required', 'string', 'max:50', 'regex:/^[\pL]+(?:\s+[\pL]+)*$/u'],
            'telefon'  => ['required', 'string', 'max:20', 'regex:/^\d+$/'],
            'email'    => 'required|email|max:100|unique:klijenti,email' . ($exceptId ? ",$exceptId,klijentid" : ''),
            'napomene' => 'nullable|string',
        ];
    }

    private function findOrFail(int|string $id): Klijent|\Illuminate\Http\JsonResponse
    {
        $klijent = Klijent::find($id);
        return $klijent ?? response()->json(['poruka' => 'Klijent nije pronađen.'], 404);
    }

    public function index()
    {
        return response()->json(Klijent::all());
    }

    public function show($id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;
        return response()->json($result);
    }

    public function store(Request $request)
    {
        $klijent = Klijent::create($request->validate($this->clientRules(), self::VALIDATION_MESSAGES));
        return response()->json(['poruka' => 'Klijent je uspešno kreiran.', 'klijent' => $klijent], 201);
    }

    public function update(Request $request, $id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;

        $result->update($request->validate($this->clientRules($id), self::VALIDATION_MESSAGES));
        return response()->json(['poruka' => 'Podaci o klijentu su uspešno ažurirani.', 'klijent' => $result]);
    }

    public function destroy($id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;

        $result->delete();
        return response()->json(['poruka' => 'Klijent je uspešno obrisan.']);
    }

    public function getMere($id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;

        return response()->json(Mere::where('klijentid', $id)->get());
    }

    public function addMere(Request $request, $id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;

        $data = $request->validate([
            'tipodece'     => 'required|string|max:100',
            'obimgrudi'    => 'required|numeric|min:40|max:150',
            'obimstruka'   => 'required|numeric|min:40|max:150',
            'obimkukova'   => 'required|numeric|min:40|max:150',
            'duzinarukava' => 'required|numeric|min:40|max:150',
        ]);

        $mere = Mere::create(array_merge($data, [
            'klijentid'  => $id,
            'datumunosa' => now()->toDateString(),
        ]));

        return response()->json(['poruka' => 'Mere su uspešno sačuvane.', 'mere' => $mere], 201);
    }

    public function obrisiMere($id, $mereid)
    {
        $mere = Mere::where('klijentid', $id)->where('mereid', $mereid)->first();

        if (!$mere) {
            return response()->json(['poruka' => 'Mere nisu pronađene.'], 404);
        }

        $mere->delete();
        return response()->json(['poruka' => 'Mere su uspešno obrisane.']);
    }
}
