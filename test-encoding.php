<?php

$corrupted = "PurÃ©va";
$expected = "Puréva";

$fixed = utf8_decode($corrupted);

echo "Original: $corrupted\n";
echo "Fixed:    $fixed\n";
echo "Expected: $expected\n";

if ($fixed === $expected) {
    echo "SUCCESS: Logic works!\n";
} else {
    echo "FAILURE: Logic incorrect.\n";
    echo "Hex Original: " . bin2hex($corrupted) . "\n";
    echo "Hex Fixed:    " . bin2hex($fixed) . "\n";
    echo "Hex Expected: " . bin2hex($expected) . "\n";
}
