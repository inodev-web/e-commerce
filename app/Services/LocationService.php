<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\DeliveryType;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\Wilaya;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class LocationService
{
    /**
     * Obtenir toutes les wilayas actives avec leurs communes
     */
    public function getActiveWilayas(): Collection
    {
        return Cache::rememberForever('active_wilayas_with_communes', function () {
            return Wilaya::active()
                ->with('communes')
                ->orderBy('code')
                ->get();
        });
    }

    /**
     * Obtenir les communes d'une wilaya
     */
    public function getCommunesByWilaya(int $wilayaId): Collection
    {
        return Cache::rememberForever("wilaya_{$wilayaId}_communes", function () use ($wilayaId) {
            return Commune::where('wilaya_id', $wilayaId)
                ->orderBy('name')
                ->get();
        });
    }

    /**
     * CRITIQUE: Chercher le tarif sans lever d'exception (plus rapide)
     */
    public function findDeliveryPrice(int $wilayaId, DeliveryType $type): ?float
    {
        $tariff = DeliveryTariff::where('wilaya_id', $wilayaId)
            ->where('type', $type)
            ->where('is_active', true)
            ->first();
            
        return $tariff ? (float) $tariff->price : null;
    }

    /**
     * Obtenir le tarif de livraison dynamique au moment de la requête
     */
    public function getDeliveryPrice(int $wilayaId, DeliveryType $type): float
    {
        $price = $this->findDeliveryPrice($wilayaId, $type);
            
        if ($price === null) {
            throw new \Exception("Aucun tarif de livraison trouvé pour cette wilaya et ce type");
        }
        
        return $price;
    }

    /**
     * Obtenir tous les tarifs d'une wilaya
     */
    public function getTariffsByWilaya(int $wilayaId): Collection
    {
        return DeliveryTariff::where('wilaya_id', $wilayaId)
            ->get();
    }

    /**
     * Obtenir toutes les wilayas avec leurs tarifs
     */
    public function getWilayasWithTariffs(): Collection
    {
        return Cache::rememberForever('wilayas_with_tariffs', function () {
            return Wilaya::active()
                ->with('deliveryTariffs')
                ->orderBy('code')
                ->get();
        });
    }
}
