<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgresConnector;

class NeonPostgresConnector extends PostgresConnector
{
    protected function getDsn(array $config): string
    {
        $dsn  = parent::getDsn($config);
        $host = $config['host'] ?? '';

        if (str_contains($host, 'neon.tech')) {
            $endpointId = explode('.', $host)[0];
            $dsn .= ";options='endpoint=$endpointId'";
        }

        return $dsn;
    }
}
