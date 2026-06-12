<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KlijentController;
use App\Http\Controllers\NarudzbinaController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


    Route::get('/klijenti', [KlijentController::class, 'index']);
    Route::get('/klijenti/{id}', [KlijentController::class, 'show']);
    Route::get('/klijenti/{id}/mere', [KlijentController::class, 'getMere']);
    Route::get('/narudzbine', [NarudzbinaController::class, 'index']);
    Route::get('/narudzbine/{id}', [NarudzbinaController::class, 'show']);

   
    Route::middleware('krojac')->group(function () {
        Route::post('/klijenti', [KlijentController::class, 'store']);
        Route::put('/klijenti/{id}', [KlijentController::class, 'update']);
        Route::delete('/klijenti/{id}', [KlijentController::class, 'destroy']);
        Route::post('/klijenti/{id}/mere', [KlijentController::class, 'addMere']);
        Route::delete('/klijenti/{id}/mere/{mereid}', [KlijentController::class, 'obrisiMere']);
        Route::post('/narudzbine', [NarudzbinaController::class, 'store']);
        Route::put('/narudzbine/{id}', [NarudzbinaController::class, 'update']);
        Route::patch('/narudzbine/{id}/status', [NarudzbinaController::class, 'updateStatus']);
        Route::delete('/narudzbine/{id}', [NarudzbinaController::class, 'destroy']);
    });
});


