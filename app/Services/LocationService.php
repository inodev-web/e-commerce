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
     * Obtenir toutes les wilayas actives avec leurs communes et tarifs
     * Filtre par wilaya.is_active=true puis vérifie les types disponibles (domicile ou bureau)
     */
    public function getActiveWilayas(): Collection
    {
        return Cache::remember('active_wilayas_with_communes', 3600, function () {
            return Wilaya::where('is_active', true)
                ->whereHas('deliveryTariffs', function($query) {
                    $query->where('is_active', true);
                })
                ->with(['communes', 'deliveryTariffs' => function($query) {
                    $query->where('is_active', true);
                }])
                ->orderBy('code')
                ->get();
        });
    }

    /**
     * Obtenir les types de livraison disponibles pour une wilaya
     */
    public function getAvailableDeliveryTypes(int $wilayaId): array
    {
        return Cache::remember("wilaya_{$wilayaId}_delivery_types", 3600, function () use ($wilayaId) {
            return DeliveryTariff::where('wilaya_id', $wilayaId)
                ->where('is_active', true)
                ->pluck('type')
                ->toArray();
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

    /**
     * Activer une wilaya - Active automatiquement Domicile ET Bureau
     */
    public function activateWilaya(int $wilayaId): void
    {
        $wilaya = Wilaya::findOrFail($wilayaId);
        $wilaya->update(['is_active' => true]);

        DeliveryTariff::where('wilaya_id', $wilayaId)->update(['is_active' => true]);

        $this->clearWilayaCache($wilayaId);
    }

    /**
     * Désactiver une wilaya - Désactive automatiquement Domicile ET Bureau
     */
    public function deactivateWilaya(int $wilayaId): void
    {
        $wilaya = Wilaya::findOrFail($wilayaId);
        $wilaya->update(['is_active' => false]);

        DeliveryTariff::where('wilaya_id', $wilayaId)->update(['is_active' => false]);

        $this->clearWilayaCache($wilayaId);
    }

    /**
     * Activer un type de livraison pour une wilaya
     * Si la wilaya était désactivée, elle devient activée automatiquement
     */
    public function activateDeliveryType(int $wilayaId, DeliveryType $type): void
    {
        $wilaya = Wilaya::findOrFail($wilayaId);

        DeliveryTariff::updateOrCreate(
            ['wilaya_id' => $wilayaId, 'type' => $type->value],
            ['is_active' => true, 'price' => 0]
        );

        if (!$wilaya->is_active) {
            $wilaya->update(['is_active' => true]);
        }

        $this->clearWilayaCache($wilayaId);
    }

    /**
     * Désactiver un type de livraison pour une wilaya
     * Désactive seulement ce type, la wilaya reste active
     * Si TOUS les types sont désactivés, désactive automatiquement la wilaya
     */
    public function deactivateDeliveryType(int $wilayaId, DeliveryType $type): void
    {
        DeliveryTariff::where('wilaya_id', $wilayaId)
            ->where('type', $type->value)
            ->update(['is_active' => false]);

        $hasActiveType = DeliveryTariff::where('wilaya_id', $wilayaId)
            ->where('is_active', true)
            ->exists();

        if (!$hasActiveType) {
            Wilaya::where('id', $wilayaId)->update(['is_active' => false]);
        }

        $this->clearWilayaCache($wilayaId);
    }

    /**
     * Désactiver tous les types de livraison pour une wilaya
     * Désactive Domicile ET Bureau, et désactive automatiquement la wilaya
     */
    public function deactivateAllDeliveryTypes(int $wilayaId): void
    {
        DeliveryTariff::where('wilaya_id', $wilayaId)->update(['is_active' => false]);

        Wilaya::where('id', $wilayaId)->update(['is_active' => false]);

        $this->clearWilayaCache($wilayaId);
    }

    /**
     * Mettre à jour le prix d'un type de livraison
     */
    public function updateDeliveryPrice(int $wilayaId, DeliveryType $type, float $price): void
    {
        DeliveryTariff::updateOrCreate(
            ['wilaya_id' => $wilayaId, 'type' => $type->value],
            ['price' => $price, 'is_active' => true]
        );

        $wilaya = Wilaya::findOrFail($wilayaId);
        if (!$wilaya->is_active) {
            $wilaya->update(['is_active' => true]);
        }

        $this->clearWilayaCache($wilayaId);
    }

    /**
     * Vider le cache pour une wilaya spécifique
     */
    private function clearWilayaCache(int $wilayaId): void
    {
        Cache::forget('active_wilayas_with_communes');
        Cache::forget("wilaya_{$wilayaId}_delivery_types");
        Cache::forget("wilaya_{$wilayaId}_communes");
        Cache::forget('delivery_tariffs');
        Cache::forget('wilayas_with_tariffs');
    }
}
