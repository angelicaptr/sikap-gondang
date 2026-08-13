<?php

// PAKSA HTTPS agar file JS & CSS (asset()) tidak di-block oleh browser (Mixed Content)
$_SERVER['HTTPS'] = 'on';

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

// Salin database lokal ke /tmp agar bisa dibaca (meskipun perubahannya tidak akan permanen)
$sourceDb = __DIR__.'/../database/database.sqlite';
$targetDb = '/tmp/database.sqlite';
if (file_exists($sourceDb) && !file_exists($targetDb)) {
    copy($sourceDb, $targetDb);
} elseif (!file_exists($targetDb)) {
    touch($targetDb); // Buat kosong jika tidak ada
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
$_ENV['SESSION_DRIVER'] = 'cookie';
putenv('SESSION_DRIVER=cookie');

// Cache sudah diarahkan ke /tmp, Laravel tidak akan crash saat menulis cache.

try {
    // 4. Jalankan Laravel
    define('LARAVEL_START', microtime(true));

    // Register the Composer autoloader...
    require __DIR__.'/../vendor/autoload.php';

    // Bootstrap Laravel and handle the request...
    $app = require_once __DIR__.'/../bootstrap/app.php';

    // PAKSA Laravel untuk menggunakan folder /tmp/storage agar tidak error Read-Only!
    $app->useStoragePath('/tmp/storage');

    // Override config secara paksa (Bypass .env) agar Vercel tidak crash
    $app->booting(function() use ($app) {
        $app['config']->set('session.driver', 'cookie');
        $app['config']->set('cache.default', 'array');
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', '/tmp/database.sqlite');
        $app['config']->set('app.maintenance.driver', 'file');
        $app['config']->set('broadcasting.default', 'log');
        $app['config']->set('queue.default', 'sync');
        $app['config']->set('mail.default', 'log');
        $app['config']->set('filesystems.default', 'local');
    });

    $app->handleRequest(\Illuminate\Http\Request::capture());
} catch (\Throwable $e) {
    http_response_code(500);
    echo "<h1>🔥 SISTEM CRASH 🔥</h1>";
    echo "<p>Pesan Error Asli:</p>";
    echo "<pre style='background: #111; color: #ff5555; padding: 20px; border-radius: 8px; overflow-x: auto;'>";
    echo htmlspecialchars((string) $e);
    echo "</pre>";
    exit;
}
