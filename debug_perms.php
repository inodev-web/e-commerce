<?php
$path = __DIR__ . '/bootstrap/cache';
echo "Path: " . $path . "\n";
echo "Exists: " . (is_dir($path) ? 'Yes' : 'No') . "\n";
echo "Writable: " . (is_writable($path) ? 'Yes' : 'No') . "\n";
echo "Permissions: " . substr(sprintf('%o', fileperms($path)), -4) . "\n";
echo "Owner: " . fileowner($path) . "\n";

// Try to write a test file
$testFile = $path . '/test_write.txt';
@file_put_contents($testFile, 'test');
if (file_exists($testFile)) {
    echo "Test write successful.\n";
    unlink($testFile);
} else {
    echo "Test write failed.\n";
    print_r(error_get_last());
}
