<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\DeliveryType;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\Wilaya;
use Illuminate\Support\Collection;

class LocationService
{
    /**
     * Obtenir toutes les wilayas actives avec leurs communes
     */
    public function getActiveWilayas(): Collection
    {
        return Wilaya::active()
            ->with('communes')
            ->orderBy('name')
            ->get();
    }

    /**
     * Obtenir les communes d'une wilaya
     */
    public function getCommunesByWilaya(int $wilayaId): Collection
    {
        return Commune::where('wilaya_id', $wilayaId)
            ->orderBy('name')
            ->get();
    }

    /**
     * CRITIQUE: Obtenir le tarif de livraison dynamique au moment de la requête
     */
    public function getDeliveryPrice(int $wilayaId, DeliveryType $type): float
    {
        $tariff = DeliveryTariff::where('wilaya_id', $wilayaId)
            ->where('type', $type)
            ->where('is_active', true)
            ->first();
            
        if (!$tariff) {
            throw new \Exception("Aucun tarif de livraison trouvé pour cette wilaya et ce type");
        }
        
        return (float) $tariff->price;
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
        return Wilaya::active()
            ->with('deliveryTariffs')
            ->orderBy('name')
            ->get();
    }
}
