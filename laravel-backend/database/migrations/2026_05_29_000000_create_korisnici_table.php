<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('korisnici', function (Blueprint $table) {
            $table->unsignedBigInteger('korisnikid')->primary();
            $table->string('username', 50)->unique();
            $table->string('password');
            $table->enum('uloga', ['admin', 'krojac']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('korisnici');
    }
};
