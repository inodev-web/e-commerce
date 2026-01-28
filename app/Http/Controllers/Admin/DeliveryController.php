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
                
                return [
                    'id' => $wilaya->id,
                    'code' => $wilaya->code,
                    'name' => $wilaya->name,
                    'active' => $wilaya->is_active,
                    'homePrice' => $domicile ? $domicile->price : 0,
                    'homeActive' => $domicile ? $domicile->is_active : false,
                    'deskPrice' => $bureau ? $bureau->price : 0,
                    'deskActive' => $bureau ? $bureau->is_active : false,
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
     * Mise à jour en masse des tarifs
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'wilayas' => 'required|array',
            'wilayas.*.id' => 'required|exists:wilayas,id',
            'wilayas.*.active' => 'boolean',
            'wilayas.*.homePrice' => 'nullable|numeric|min:0',
            'wilayas.*.homeActive' => 'boolean',
            'wilayas.*.deskPrice' => 'nullable|numeric|min:0',
            'wilayas.*.deskActive' => 'boolean',
        ]);

        foreach ($data['wilayas'] as $wilayaData) {
            $wilaya = Wilaya::find($wilayaData['id']);
            $wilaya->update(['is_active' => $wilayaData['active']]);

            // Update or Create Home Tariff
            $wilaya->deliveryTariffs()->updateOrCreate(
                ['type' => \App\Enums\DeliveryType::DOMICILE],
                [
                    'price' => $wilayaData['homePrice'] ?? 0,
                    'is_active' => $wilayaData['homeActive']
                ]
            );

            // Update or Create Desk Tariff
            $wilaya->deliveryTariffs()->updateOrCreate(
                ['type' => \App\Enums\DeliveryType::BUREAU],
                [
                    'price' => $wilayaData['deskPrice'] ?? 0,
                    'is_active' => $wilayaData['deskActive']
                ]
            );
        }

        return back()->with('success', 'Tarifs mis à jour avec succès');
    }
}
