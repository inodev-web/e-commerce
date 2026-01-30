<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ProductImage;

ProductImage::where('is_primary', true)->update(['is_main' => true]);
echo "Migrated " . ProductImage::where('is_main', true)->count() . " images to is_main=true.\n";
