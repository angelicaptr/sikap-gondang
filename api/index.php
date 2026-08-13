<?php

// 1. Siapkan folder sementara di /tmp untuk seluruh kebutuhan penulisan Laravel
$tmpDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/framework/cache',
    '/tmp/storage/logs',
    '/tmp/bootstrap/cache',
];

foreach ($tmpDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// 2. Override variabel Environment untuk mengarahkan cache & views ke /tmp
$_ENV['APP_CONFIG_CACHE'] = '/tmp/bootstrap/cache/config.php';
$_ENV['APP_SERVICES_CACHE'] = '/tmp/bootstrap/cache/services.php';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/bootstrap/cache/packages.php';
$_ENV['APP_ROUTES_CACHE'] = '/tmp/bootstrap/cache/routes.php';

// PAKSA Mode Debug agar kita bisa melihat error aslinya!
$_ENV['APP_DEBUG'] = 'true';
putenv('APP_DEBUG=true');
$_ENV['LOG_CHANNEL'] = 'stderr';
putenv('LOG_CHANNEL=stderr');

// 3. Matikan penulisan cache otomatis yang bikin crash
unset($_ENV['APP_CONFIG_CACHE']);
unset($_ENV['APP_SERVICES_CACHE']);
unset($_ENV['APP_PACKAGES_CACHE']);
unset($_ENV['APP_ROUTES_CACHE']);

// 4. Jalankan Laravel
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// PAKSA Laravel untuk menggunakan folder /tmp/storage agar tidak error Read-Only!
$app->useStoragePath('/tmp/storage');

$app->handleRequest(Request::capture());
