<?php

use App\Models\Order;
use Illuminate\Support\Facades\DB;

echo "Order Count: " . Order::count() . "\n";
echo "Distinct Statuses: \n";
print_r(Order::select('status')->distinct()->pluck('status')->toArray());

echo "\nFirst 5 Orders:\n";
print_r(Order::limit(5)->get()->toArray());
