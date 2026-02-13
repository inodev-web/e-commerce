<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDeliveryTariffRequest;
use App\Http\Requests\Admin\UpdateDeliveryTariffRequest;
use App\Models\DeliveryTariff;
use App\Models\Wilaya;
use App\Services\LocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryController extends Controller
{
    public function __construct(
        private readonly LocationService $locationService,
    ) {
    }

    /**
     * CRUD Complet pour la gestion des tarifs de livraison par l'Admin
     */
    public function index(): Response
    {
        $wilayas = Wilaya::with('deliveryTariffs')
            ->orderBy('name')
            ->get()
            ->map(function ($wilaya) {
                $domicile = $wilaya->deliveryTariffs->firstWhere('type', \App\Enums\DeliveryType::DOMICILE);
                $bureau = $wilaya->deliveryTariffs->firstWhere('type', \App\Enums\DeliveryType::BUREAU);
                $homeActive = $domicile ? $domicile->is_active : false;
                $deskActive = $bureau ? $bureau->is_active : false;
                
                return [
                    'id' => $wilaya->id,
                    'code' => $wilaya->code,
                    'name' => $wilaya->name,
                    'active' => $homeActive || $deskActive,
                    'homePrice' => $domicile ? $domicile->price : 0,
                    'homeActive' => $homeActive,
                    'deskPrice' => $bureau ? $bureau->price : 0,
                    'deskActive' => $deskActive,
                    // IDs needed for updates
                    'homeTariffId' => $domicile ? $domicile->id : null,
                    'deskTariffId' => $bureau ? $bureau->id : null,
                ];
        });
        
        return Inertia::render('Admin/Delivery', [
            'wilayas' => $wilayas,
        ]);
    }

    /**
     * Afficher le formulaire de création
     */
    public function create(): Response
    {
        $wilayas = Wilaya::active()->orderBy('name')->get();
        
        return Inertia::render('Admin/Delivery/Create', [
            'wilayas' => $wilayas,
        ]);
    }

    /**
     * Créer un nouveau tarif
     */
    public function store(StoreDeliveryTariffRequest $request): RedirectResponse
    {
        DeliveryTariff::create($request->validated());
        
        return redirect()->route('admin.delivery.index')
            ->with('success', 'Tarif de livraison créé avec succès');
    }

    /**
     * Afficher le formulaire d'édition
     */
    public function edit(DeliveryTariff $deliveryTariff): Response
    {
        $deliveryTariff->load('wilaya');
        
        return Inertia::render('Admin/Delivery/Edit', [
            'tariff' => $deliveryTariff,
        ]);
    }

    /**
     * Mettre à jour un tarif
     */
    public function update(UpdateDeliveryTariffRequest $request, DeliveryTariff $deliveryTariff): RedirectResponse
    {
        $deliveryTariff->update($request->validated());
        
        return redirect()->route('admin.delivery.index')
            ->with('success', 'Tarif de livraison mis à jour avec succès');
    }

    /**
     * Supprimer un tarif
     */
    public function destroy(DeliveryTariff $deliveryTariff): RedirectResponse
    {
        $deliveryTariff->delete();
        
        return redirect()->route('admin.delivery.index')
            ->with('success', 'Tarif de livraison supprimé avec succès');
    }

    /**
     * Toggle actif/inactif
     */
    public function toggleActive(DeliveryTariff $deliveryTariff): RedirectResponse
    {
        $deliveryTariff->update([
            'is_active' => !$deliveryTariff->is_active
        ]);
        
        $status = $deliveryTariff->is_active ? 'activé' : 'désactivé';
        
        return redirect()->back()->with('success', "Tarif {$status} avec succès");
    }

    /**
     * Mise à jour en masse des tarifs avec logique de dépendance
     * - Désactiver UN type ne désactive PAS la wilaya
     * - Il faut désactiver TOUS les types pour désactiver la wilaya
     * - Activer UN type suffit à activer la wilaya
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'wilayas' => 'required|array',
            'wilayas.*.id' => 'required|exists:wilayas,id',
            'wilayas.*.active' => 'sometimes|boolean',
            'wilayas.*.homePrice' => 'nullable|numeric|min:0',
            'wilayas.*.homeActive' => 'sometimes|boolean',
            'wilayas.*.deskPrice' => 'nullable|numeric|min:0',
            'wilayas.*.deskActive' => 'sometimes|boolean',
        ]);

        foreach ($data['wilayas'] as $wilayaData) {
            $wilayaId = $wilayaData['id'];

            // Checkbox "Active (Tout)" : uniquement indicateur visuel, ignoré dans la logique
            // La wilaya est active/désactive automatiquement selon les types individuels

            // Mise à jour individuelle du type Domicile
            if (isset($wilayaData['homeActive'])) {
                if ($wilayaData['homeActive']) {
                    $this->locationService->activateDeliveryType($wilayaId, \App\Enums\DeliveryType::DOMICILE);
                } else {
                    $this->locationService->deactivateDeliveryType($wilayaId, \App\Enums\DeliveryType::DOMICILE);
                }
            }

            // Mise à jour individuelle du type Bureau
            if (isset($wilayaData['deskActive'])) {
                if ($wilayaData['deskActive']) {
                    $this->locationService->activateDeliveryType($wilayaId, \App\Enums\DeliveryType::BUREAU);
                } else {
                    $this->locationService->deactivateDeliveryType($wilayaId, \App\Enums\DeliveryType::BUREAU);
                }
            }

            // Mise à jour des prix
            if (isset($wilayaData['homePrice'])) {
                $this->locationService->updateDeliveryPrice($wilayaId, \App\Enums\DeliveryType::DOMICILE, (float) $wilayaData['homePrice']);
            }

            if (isset($wilayaData['deskPrice'])) {
                $this->locationService->updateDeliveryPrice($wilayaId, \App\Enums\DeliveryType::BUREAU, (float) $wilayaData['deskPrice']);
            }
        }

        return back()->with('success', count($data['wilayas']) . ' wilaya(s) mise(s) à jour instantanément !');
    }
}
