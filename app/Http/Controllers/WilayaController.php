<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Wilaya;
use Illuminate\Http\JsonResponse;

class WilayaController extends Controller
{
    /**
     * Lister les 58 wilayas avec leurs frais de livraison
     */
    public function index(): JsonResponse
    {
        $wilayas = app(\App\Services\LocationService::class)->getWilayasWithTariffs();

        return response()->json([
            'data' => $wilayas
        ]);
    }
}
