<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureKrojac
{
    public function handle(Request $request, Closure $next): Response
    {
        $korisnik = $request->user();

        if (!$korisnik || !$korisnik->isKrojac()) {
            return response()->json([
                'poruka' => 'Nemate dozvolu za ovu akciju. Samo krojač može da menja podatke.',
            ], 403);
        }

        return $next($request);
    }
}
