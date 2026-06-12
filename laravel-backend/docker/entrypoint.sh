#!/bin/sh
set -e

php artisan config:cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
