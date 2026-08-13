<?php

// Paksa Laravel menggunakan folder /tmp untuk compiled views dan cache di Vercel
unset($_ENV['APP_CONFIG_CACHE']);
unset($_ENV['APP_SERVICES_CACHE']);
unset($_ENV['APP_PACKAGES_CACHE']);
unset($_ENV['APP_ROUTES_CACHE']);

require __DIR__ . '/../public/index.php';
