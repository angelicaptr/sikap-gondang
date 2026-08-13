<?php

// 1. Buat folder sementara /tmp/views untuk menyimpan hasil render Blade di Vercel
if (!is_dir('/tmp/views')) {
    mkdir('/tmp/views', 0755, true);
}

// 2. Paksa Laravel mengarahkan tempat penyimpanan view compiled ke /tmp/views
$_ENV['VIEW_COMPILED_PATH'] = '/tmp/views';
putenv('VIEW_COMPILED_PATH=/tmp/views');

// 3. Bersihkan cache bawaan agar tidak membaca cache lokal/read-only
unset($_ENV['APP_CONFIG_CACHE']);
unset($_ENV['APP_SERVICES_CACHE']);
unset($_ENV['APP_PACKAGES_CACHE']);
unset($_ENV['APP_ROUTES_CACHE']);

// 4. Jalankan entrypoint utama Laravel
require __DIR__ . '/../public/index.php';
