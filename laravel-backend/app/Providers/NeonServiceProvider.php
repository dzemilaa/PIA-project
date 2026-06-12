<?php

namespace App\Providers;

use App\Database\NeonPostgresConnector;
use Illuminate\Support\ServiceProvider;

class NeonServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind('db.connector.pgsql', fn() => new NeonPostgresConnector());
    }

    public function boot(): void {}
}
