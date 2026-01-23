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
        
        return LoyaltyPoint::create([
            'client_id' => $clientId,
            'points' => $points,
            'description' => "Points gagnés pour commande de {$orderTotal} DA",
        ]);
    }

    /**
     * Obtenir le solde total de points d'un client
     */
    public function getBalance(int $clientId): int
    {
        return (int) LoyaltyPoint::where('client_id', $clientId)->sum('points');
    }

    /**
     * Convertir des points en remise (1 point = 1 DA)
     */
    public function convertToDiscount(int $clientId, int $points): float
    {
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
            'description' => "Conversion de {$points} points en remise",
        ]);
        
        return (float) $points; // 1 point = 1 DA
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
