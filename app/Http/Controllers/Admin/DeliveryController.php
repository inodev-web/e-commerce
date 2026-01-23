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
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    /**
     * CRUD Complet pour la gestion des tarifs de livraison par l'Admin
     */
    public function index(): Response
    {
        $wilayas = Wilaya::with('deliveryTariffs')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Admin/Delivery/Index', [
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
}
