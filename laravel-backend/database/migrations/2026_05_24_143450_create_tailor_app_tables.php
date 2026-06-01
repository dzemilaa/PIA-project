<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('klijenti', function (Blueprint $table) {
            $table->id('klijentid');
            $table->string('ime', 50);
            $table->string('prezime', 50);
            $table->string('telefon', 20);
            $table->string('email', 100)->unique();
            $table->text('napomene')->nullable();
        });

        Schema::create('mere', function (Blueprint $table) {
            $table->id('mereid');
            $table->unsignedBigInteger('klijentid');
            $table->string('tipodece', 100);
            $table->decimal('obimgrudi', 5, 2);
            $table->decimal('obimstruka', 5, 2);
            $table->decimal('obimkukova', 5, 2);
            $table->decimal('duzinarukava', 5, 2);
            $table->date('datumunosa');

            $table->foreign('klijentid')
                  ->references('klijentid')
                  ->on('klijenti')
                  ->onDelete('cascade');
        });

        Schema::create('narudzbine', function (Blueprint $table) {
            $table->id('narudzbinaid');
            $table->unsignedBigInteger('klijentid');
            $table->unsignedBigInteger('korisnikid')->default(1);
            $table->string('tipodece', 100);
            $table->date('datumkreiranja');
            $table->date('rokprobe')->nullable();
            $table->date('rokizrade')->nullable();
            $table->date('rokisporuke');
            $table->enum('status', ['u obradi', 'u izradi', 'završeno', 'otkazano']);
            $table->text('napomene')->nullable();
            $table->decimal('cena', 10, 2);

            $table->foreign('klijentid')
                  ->references('klijentid')
                  ->on('klijenti')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('narudzbine');
        Schema::dropIfExists('mere');
        Schema::dropIfExists('klijenti');
    }
};
