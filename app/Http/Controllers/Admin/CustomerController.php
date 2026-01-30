<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $clients = Client::with('user')
            ->withCount('orders')
            ->withSum('loyaltyPoints', 'points')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('email', 'like', "%{$search}%");
                      });
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Customers', [
            'clients' => $clients,
            'filters' => $request->only(['search'])
        ]);
    }

    public function show(Client $client)
    {
        $client->load(['user', 'orders' => function ($q) {
            $q->latest();
        }, 'loyaltyPoints' => function($q) {
            $q->latest();
        }]);

        return Inertia::render('Admin/CustomerDetails', [ // Or return JSON if modal is fully client-side? Plan says "Ajouter modal de détails client".
            // If the modal is inside 'Admin/Customers', maybe we just fetch data via API? 
            // The user plan says: "show($id) : Détails client + commandes + points".
            // If I render a page 'Admin/Customers/Show', it's a new page.
            // If I want a modal, I might return JSON or use Inertia partial reload.
            // Let's implement return Inertia Page for now, OR return JSON if it's an API call.
            // The route is `Route::get('customers/{client}')`.
            // I'll render a dedicated page 'Admin/CustomerDetails' OR just pass data to 'Admin/Customers' if visited directly?
            // Actually, the plan implies `Admin/Customers.jsx` has a modal.
            // If I click "Details", maybe I visit `customers/{id}` which renders the page OR I fetch data.
            // Let's stick to Inertia Page for `show` to be safe/standard.
            'client' => $client
        ]);
    }

    /**
     * Toggle user status (active/blocked)
     */
    public function toggle(Client $client)
    {
        if (!$client->user) {
            return redirect()->back()->withErrors(['error' => 'Ce client n\'a pas de compte utilisateur associé.']);
        }

        $newStatus = $client->user->status === \App\Enums\UserStatus::BANNED 
            ? \App\Enums\UserStatus::ACTIVE 
            : \App\Enums\UserStatus::BANNED;
        
        $client->user->update(['status' => $newStatus]);

        $message = $newStatus === \App\Enums\UserStatus::BANNED
            ? 'Client bloqué avec succès.' 
            : 'Client débloqué avec succès.';

        return redirect()->back()->with('success', $message);
    }
}
