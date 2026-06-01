<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgresConnector;

/**
 * Custom connector for Neon PostgreSQL that injects the endpoint ID
 * into the DSN options string, which is required for SNI-based routing.
 */
class NeonPostgresConnector extends PostgresConnector
{
    /**
     * Create a DSN string from a configuration.
     *
     * @param  array  $config
     * @return string
     */
    protected function getDsn(array $config): string
    {
        $dsn = parent::getDsn($config);

        // Extract endpoint ID from host (e.g. ep-dawn-paper-al3025ee-pooler)
        $host = $config['host'] ?? '';
        if (str_contains($host, 'neon.tech')) {
            // Endpoint ID is the first segment of the host before the first dot
            $endpointId = explode('.', $host)[0];
            // Append options to DSN so Neon can identify the compute endpoint
            $dsn .= ";options='endpoint=" . $endpointId . "'";
        }

        return $dsn;
    }
}
