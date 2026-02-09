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
        $cacheKey = "loyalty_balance_{$clientId}";
        
        $actualBalance = (int) LoyaltyPoint::where('client_id', $clientId)->sum('points');
        
        \Log::info('LoyaltyService::getBalance', [
            'client_id' => $clientId,
            'actual_balance' => $actualBalance,
            'cache_key' => $cacheKey,
        ]);
        
        // Clear cache if actual balance is 0 to avoid stale cache issues
        if ($actualBalance === 0) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            \Log::info('LoyaltyService::getBalance - Cache cleared (balance was 0)');
        }
        
        return (int) \Illuminate\Support\Facades\Cache::remember(
            $cacheKey,
            now()->addMinutes(5), // Cache 5 minutes
            fn() => $actualBalance
        );
    }

    /**
     * Convertir des points en remise - 🛡 SÉCURISÉ (Race Condition)
     */
    public function convertToDiscount(int $clientId, int $points, ?float $maxAmount = null): float
    {
        \Log::info('LoyaltyService::convertToDiscount - Start', [
            'clientId' => $clientId,
            'points' => $points,
            'maxAmount' => $maxAmount,
        ]);
        
        return \Illuminate\Support\Facades\DB::transaction(function() use ($clientId, $points, $maxAmount) {
            // 🔒 LOCK FOR UPDATE sur le client pour éviter les accès concurrents sur le solde
            $client = Client::where('id', $clientId)->lockForUpdate()->first();

            if (!$client) {
                throw new \Exception("Client non trouvé");
            }

            $balance = $this->getBalance($clientId);
            
            \Log::info('LoyaltyService::convertToDiscount - Balance check', [
                'clientId' => $clientId,
                'balance' => $balance,
                'pointsRequested' => $points,
            ]);

            if ($points > $balance) {
                throw new \Exception("Points insuffisants. Disponible: {$balance}");
            }

            if ($points <= 0) {
                throw new \Exception("Le nombre de points doit être positif");
            }

            $setting = \App\Models\LoyaltySetting::first();
            $conversionRate = $setting ? $setting->points_conversion_rate : 1.00;
            
            \Log::info('LoyaltyService::convertToDiscount - Conversion settings', [
                'conversionRate' => $conversionRate,
                'settingExists' => !is_null($setting),
            ]);

            // Calculate potential discount from points
            $potentialDiscount = $points * $conversionRate;
            
            \Log::info('LoyaltyService::convertToDiscount - Potential discount', [
                'potentialDiscount' => $potentialDiscount,
                'maxAmount' => $maxAmount,
                'willCap' => $maxAmount !== null && $potentialDiscount > $maxAmount,
            ]);

            // Cap if maxAmount is provided
            $actualPointsToDeduct = $points;
            $finalDiscount = $potentialDiscount;

            if ($maxAmount !== null && $potentialDiscount > $maxAmount) {
                $finalDiscount = $maxAmount;
                // Calculate points needed for this amount (ceil to ensure we cover it, or floor? 
                // Usually Ceil to cover the amount, but here we are giving money.
                // If 10 DA needed and rate is 1, need 10 points.
                // If 10 DA needed and rate is 0.5, need 20 points.
                // points = amount / rate.
                $actualPointsToDeduct = (int) ceil($maxAmount / ($conversionRate > 0 ? $conversionRate : 1));
                
                \Log::info('LoyaltyService::convertToDiscount - Capping discount', [
                    'originalPoints' => $points,
                    'actualPointsToDeduct' => $actualPointsToDeduct,
                    'finalDiscount' => $finalDiscount,
                ]);
            }

            LoyaltyPoint::create([
                'client_id' => $clientId,
                'points' => -$actualPointsToDeduct,
                'description' => "Conversion de {$actualPointsToDeduct} points en remise de {$finalDiscount} DA (Commande)",
            ]);

            \Illuminate\Support\Facades\Cache::forget("loyalty_balance_{$clientId}");
            
            \Log::info('LoyaltyService::convertToDiscount - Complete', [
                'clientId' => $clientId,
                'finalDiscount' => $finalDiscount,
                'pointsDeducted' => $actualPointsToDeduct,
            ]);

            return (float) $finalDiscount;
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
