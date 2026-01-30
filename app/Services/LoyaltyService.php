<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Client;
use App\Models\LoyaltyPoint;

class LoyaltyService
{
    /**
     * Pourcentage de points accordés (1% du montant)
     */
    private const POINTS_PERCENTAGE = 0.01;

    /**
     * Attribuer des points de fidélité après une commande
     */
    public function awardPoints(int $clientId, float $orderTotal): LoyaltyPoint
    {
        $points = (int) floor($orderTotal * self::POINTS_PERCENTAGE);
        
        $loyaltyPoint = LoyaltyPoint::create([
            'client_id' => $clientId,
            'points' => $points,
            'description' => "Points gagnés pour commande de {$orderTotal} DA",
        ]);
        
        // Invalider le cache après attribution
        \Illuminate\Support\Facades\Cache::forget("loyalty_balance_{$clientId}");
        
        return $loyaltyPoint;
    }

    /**
     * Obtenir le solde total de points d'un client (avec cache)
     */
    public function getBalance(int $clientId): int
    {
        return (int) \Illuminate\Support\Facades\Cache::remember(
            "loyalty_balance_{$clientId}",
            now()->addMinutes(5), // Cache 5 minutes
            fn() => (int) LoyaltyPoint::where('client_id', $clientId)->sum('points')
        );
    }

    /**
     * Convertir des points en remise (1 point = 1 DA) - 🛡 SÉCURISÉ (Race Condition)
     */
    public function convertToDiscount(int $clientId, int $points): float
    {
        return \Illuminate\Support\Facades\DB::transaction(function() use ($clientId, $points) {
            // 🔒 LOCK FOR UPDATE sur le client pour éviter les accès concurrents sur le solde
            $client = Client::where('id', $clientId)->lockForUpdate()->first();
            
            if (!$client) {
                throw new \Exception("Client non trouvé");
            }

            $balance = $this->getBalance($clientId);
            
            if ($points > $balance) {
                throw new \Exception("Points insuffisants. Disponible: {$balance}");
            }
            
            if ($points <= 0) {
                throw new \Exception("Le nombre de points doit être positif");
            }
            
            // Déduire les points
            LoyaltyPoint::create([
                'client_id' => $clientId,
                'points' => -$points,
                'description' => "Conversion de {$points} points en remise (Commande)",
            ]);
            
            // Invalider le cache après conversion
            \Illuminate\Support\Facades\Cache::forget("loyalty_balance_{$clientId}");
            
            return (float) $points; // 1 point = 1 DA
        });
    }

    /**
     * Historique des points
     */
    public function getHistory(int $clientId)
    {
        return LoyaltyPoint::where('client_id', $clientId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
