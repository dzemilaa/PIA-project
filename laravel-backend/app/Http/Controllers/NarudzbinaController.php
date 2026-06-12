<?php

namespace App\Http\Controllers;

use App\Models\Narudzbina;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NarudzbinaController extends Controller
{
    private const VALIDATION_MESSAGES = [
        'tipodece.exists'           => 'Izabrani klijent nema unet tip odeće i mere. Unesite ih u formi za mere klijenta.',
        'rokizrade.after_or_equal'  => 'Rok izrade ne može biti datum iz prošlosti.',
        'rokprobe.after_or_equal'   => 'Rok probe mora biti nakon roka izrade.',
        'rokisporuke.after_or_equal' => 'Rok isporuke mora biti nakon roka probe.',
        'cena.gt'                   => 'Cena mora biti veća od 0.',
    ];

    private function baseRules(Request $request, bool $isUpdate = false): array
    {
        return [
            'klijentid'   => 'required|exists:klijenti,klijentid',
            'tipodece'    => [
                'required',
                'string',
                'max:100',
                Rule::exists('mere', 'tipodece')->where(fn($q) => $q->where('klijentid', $request->input('klijentid'))),
            ],
            'rokizrade'   => 'required|date|after_or_equal:today',
            'rokprobe'    => 'required|date|after_or_equal:rokizrade',
            'rokisporuke' => 'required|date|after_or_equal:rokprobe',
            'cena'        => 'required|numeric|gt:0',
            'status'      => $isUpdate ? 'required|in:u obradi,u izradi,završeno,otkazano' : 'nullable|in:u obradi',
            'napomene'    => 'nullable|string',
        ];
    }

    private function findOrFail(int|string $id): Narudzbina|\Illuminate\Http\JsonResponse
    {
        $n = Narudzbina::find($id);
        return $n ?? response()->json(['poruka' => 'Narudžbina nije pronađena.'], 404);
    }

    public function index()
    {
        $narudzbine = Narudzbina::with('klijent')->get()->map(function ($n) {
            return array_merge(
                collect($n->toArray())->except('klijent')->all(),
                ['klijentImePrezime' => $n->klijent ? "{$n->klijent->ime} {$n->klijent->prezime}" : 'Nepoznat klijent']
            );
        });

        return response()->json($narudzbine);
    }

    public function show($id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;
        return response()->json($result);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->baseRules($request), self::VALIDATION_MESSAGES);

        $n = Narudzbina::create(array_merge($data, [
            'korisnikid'     => $request->user()->korisnikid,
            'datumkreiranja' => now()->toDateString(),
            'status'         => 'u obradi',
        ]));

        return response()->json(['poruka' => 'Narudžbina je uspešno kreirana.', 'narudzbina' => $n], 201);
    }

    public function update(Request $request, $id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;

        $result->update($request->validate($this->baseRules($request, true), self::VALIDATION_MESSAGES));
        return response()->json(['poruka' => 'Narudžbina je uspešno ažurirana.', 'narudzbina' => $result]);
    }

    public function destroy($id)
    {
        $result = $this->findOrFail($id);
        if ($result instanceof \Illuminate\Http\JsonResponse) return $result;

        $result->delete();
        return response()->json(['poruka' => 'Narudžbina je uspešno obrisana.']);
    }
}
