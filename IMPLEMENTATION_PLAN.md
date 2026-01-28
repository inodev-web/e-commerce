# 🚀 Plan d'Implémentation - Intégrations Manquantes

**Date:** 28 Janvier 2026  
**Objectif:** Compléter les intégrations backend critiques pour rendre le projet pleinement fonctionnel  
**Durée Estimée:** 2-3 jours

---

## 📋 Scope du Plan

Ce plan couvre **uniquement les intégrations backend critiques** :
- ✅ Gestion des Codes Promo (Admin)
- ✅ Programme de Fidélité (Admin)
- ✅ Gestion des Clients (Admin)
- ✅ Paramètres Pixel (Admin)
- ✅ Intégration Checkout (Codes Promo + Points Fidélité)

**Exclusions:**
- ❌ Pages client (historique points, suivi commande)
- ❌ Statistiques dashboard avancées
- ❌ Exports CSV

---

## Phase 1 : Contrôleurs Admin (Jour 1)

### 1.1 PromoCodeController 🏷️

**Fichier:** `app/Http/Controllers/Admin/PromoCodeController.php`

**Méthodes à implémenter:**
```php
- index()    : Liste paginée des codes promo avec filtres (actif/expiré)
- store()    : Créer un nouveau code promo
- update()   : Modifier un code existant
- destroy()  : Supprimer un code
- toggle()   : Activer/désactiver un code
```

**Validation requise:**
- `code` : unique, string, max:50
- `type` : enum (PERCENT, FIXED)
- `usage_type` : enum (PERSONAL, SHAREABLE)
- `discount_value` : numeric, min:0
- `max_use` : nullable, integer
- `expiry_date` : nullable, date, after:today
- `client_id` : required_if:usage_type,PERSONAL

**Routes à ajouter:**
```php
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::resource('promo-codes', PromoCodeController::class);
    Route::post('promo-codes/{promoCode}/toggle', [PromoCodeController::class, 'toggle'])
        ->name('admin.promo-codes.toggle');
});
```

**Frontend à connecter:**
- `resources/js/pages/Admin/Promotions.jsx`
- Remplacer les données mockées par `Inertia::render('Admin/Promotions', ['promoCodes' => ...])`

---

### 1.2 LoyaltyController ⭐

**Fichier:** `app/Http/Controllers/Admin/LoyaltyController.php`

**Méthodes à implémenter:**
```php
- index()              : Statistiques globales (total points distribués, utilisés)
- clientHistory($id)   : Historique des points d'un client
- manualAdjustment()   : Ajouter/retirer des points manuellement
```

**Validation pour ajustement manuel:**
- `client_id` : required, exists:clients,id
- `points` : required, integer (peut être négatif pour retrait)
- `description` : required, string, max:255

**Routes à ajouter:**
```php
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('loyalty', [LoyaltyController::class, 'index'])->name('admin.loyalty.index');
    Route::get('loyalty/client/{client}', [LoyaltyController::class, 'clientHistory'])
        ->name('admin.loyalty.client');
    Route::post('loyalty/adjust', [LoyaltyController::class, 'manualAdjustment'])
        ->name('admin.loyalty.adjust');
});
```

**Frontend à connecter:**
- `resources/js/pages/Admin/Loyalty.jsx`
- Ajouter recherche client dynamique
- Afficher solde actuel avant ajustement

---

### 1.3 CustomerController 👥

**Fichier:** `app/Http/Controllers/Admin/CustomerController.php`

**Méthodes à implémenter:**
```php
- index()      : Liste paginée avec recherche (nom, téléphone)
- show($id)    : Détails client + commandes + points
```

**Filtres pour index():**
- Recherche par nom (first_name, last_name)
- Recherche par téléphone
- Tri par date d'inscription
- Pagination (20 par page)

**Routes à ajouter:**
```php
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('customers', [CustomerController::class, 'index'])->name('admin.customers.index');
    Route::get('customers/{client}', [CustomerController::class, 'show'])->name('admin.customers.show');
});
```

**Frontend à connecter:**
- `resources/js/pages/Admin/Customers.jsx`
- Remplacer données mockées
- Ajouter modal de détails client

---

### 1.4 PixelSettingController ⚙️

**Fichier:** `app/Http/Controllers/Admin/PixelSettingController.php`

**Méthodes à implémenter:**
```php
- show()    : Afficher les paramètres actuels
- update()  : Mettre à jour les IDs et statut
```

**Validation:**
- `meta_pixel_id` : nullable, string, max:50
- `google_pixel_id` : nullable, string, max:50
- `is_active` : boolean

**Routes à ajouter:**
```php
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('settings/pixel', [PixelSettingController::class, 'show'])
        ->name('admin.settings.pixel');
    Route::put('settings/pixel', [PixelSettingController::class, 'update'])
        ->name('admin.settings.pixel.update');
});
```

**Frontend à connecter:**
- `resources/js/pages/Admin/Settings.jsx`
- Charger les valeurs actuelles depuis la DB
- Ajouter formulaire de sauvegarde

---

## Phase 2 : Intégration Checkout (Jour 2)

### 2.1 Validation Codes Promo 🏷️

**Fichier à modifier:** `app/Http/Controllers/CheckoutController.php`

**Nouvelle méthode:**
```php
public function validatePromoCode(Request $request)
{
    $request->validate(['code' => 'required|string']);
    
    $promoCode = PromoCode::where('code', $request->code)
        ->active()
        ->first();
    
    if (!$promoCode) {
        return response()->json(['error' => 'Code promo invalide ou expiré'], 404);
    }
    
    $clientId = auth()->check() ? auth()->user()->client->id : null;
    
    if (!$promoCode->isValid($clientId)) {
        return response()->json(['error' => 'Ce code promo ne peut pas être utilisé'], 403);
    }
    
    $cartTotal = /* calculer total panier */;
    $discount = $promoCode->calculateDiscount($cartTotal);
    
    return response()->json([
        'code' => $promoCode->code,
        'discount' => $discount,
        'type' => $promoCode->type->value,
    ]);
}
```

**Route à ajouter:**
```php
Route::post('checkout/validate-promo', [CheckoutController::class, 'validatePromoCode'])
    ->name('checkout.validate-promo');
```

**Modification de `placeOrder()`:**
- Ajouter champ `promo_code` dans la validation
- Vérifier validité avant création commande
- Appliquer réduction au `total_price`
- Incrémenter compteur d'utilisation du code

**Frontend à modifier:**
- `resources/js/pages/Checkout/Show.jsx`
- Ajouter champ "Code Promo" avec bouton "Appliquer"
- Afficher réduction appliquée
- Envoyer `promo_code` lors de la soumission

---

### 2.2 Utilisation Points Fidélité ⭐

**Fichier à modifier:** `app/Http/Controllers/CheckoutController.php`

**Modification de `placeOrder()`:**
```php
// Ajouter dans la validation
'use_loyalty_points' => 'nullable|integer|min:0',

// Avant création de la commande
$loyaltyDiscount = 0;
if ($request->filled('use_loyalty_points') && auth()->check()) {
    $clientId = auth()->user()->client->id;
    $loyaltyService = app(LoyaltyService::class);
    
    try {
        $loyaltyDiscount = $loyaltyService->convertToDiscount(
            $clientId, 
            $request->use_loyalty_points
        );
    } catch (\Exception $e) {
        return back()->withErrors(['loyalty' => $e->getMessage()]);
    }
}

// Ajuster le total
$totalPrice = $productsTotal + $deliveryPrice - $promoDiscount - $loyaltyDiscount;
```

**Frontend à modifier:**
- `resources/js/pages/Checkout/Show.jsx`
- Afficher solde de points disponibles (si connecté)
- Ajouter champ "Utiliser X points"
- Calculer réduction en temps réel (1 point = 1 DA)
- Limiter à min(solde, total_panier)

---

## 📁 Structure des Fichiers à Créer

```
app/Http/Controllers/Admin/
├── PromoCodeController.php       ✅ À créer
├── LoyaltyController.php          ✅ À créer
├── CustomerController.php         ✅ À créer
└── PixelSettingController.php     ✅ À créer

routes/
└── web.php                        ⚠️ À modifier (ajouter routes)

app/Http/Controllers/
└── CheckoutController.php         ⚠️ À modifier (promo + loyalty)

resources/js/pages/
├── Admin/
│   ├── Promotions.jsx             ⚠️ À connecter
│   ├── Loyalty.jsx                ⚠️ À connecter
│   ├── Customers.jsx              ⚠️ À connecter
│   └── Settings.jsx               ⚠️ À connecter
└── Checkout/
    └── Show.jsx                   ⚠️ À modifier
```

---

## ✅ Checklist de Validation

### Phase 1 : Contrôleurs Admin
- [ ] PromoCodeController créé et testé
- [ ] LoyaltyController créé et testé
- [ ] CustomerController créé et testé
- [ ] PixelSettingController créé et testé
- [ ] Toutes les routes ajoutées dans `web.php`
- [ ] Pages admin connectées (plus de données mockées)

### Phase 2 : Checkout
- [ ] Validation code promo fonctionnelle
- [ ] Application réduction promo au total
- [ ] Utilisation points fidélité fonctionnelle
- [ ] Déduction points après commande
- [ ] UI checkout mise à jour (champs + affichage)

### Tests Fonctionnels
- [ ] Admin peut créer/modifier/supprimer un code promo
- [ ] Admin peut ajuster les points d'un client
- [ ] Admin peut voir la liste des clients
- [ ] Admin peut configurer les Pixel IDs
- [ ] Client peut appliquer un code promo valide au checkout
- [ ] Client peut utiliser ses points au checkout
- [ ] Codes promo invalides/expirés sont rejetés
- [ ] Points insuffisants sont détectés

---

## 🎯 Ordre d'Implémentation Recommandé

**Jour 1 - Matin:**
1. PromoCodeController (2h)
2. Routes + connexion frontend Promotions.jsx (1h)

**Jour 1 - Après-midi:**
3. LoyaltyController (1.5h)
4. Routes + connexion frontend Loyalty.jsx (1h)
5. CustomerController (1.5h)

**Jour 2 - Matin:**
6. Routes + connexion frontend Customers.jsx (1h)
7. PixelSettingController (1h)
8. Routes + connexion frontend Settings.jsx (30min)

**Jour 2 - Après-midi:**
9. Intégration codes promo dans checkout (2h)
10. Intégration points fidélité dans checkout (1.5h)
11. Tests fonctionnels complets (1h)

---

## 📌 Notes Importantes

> **Conformité UML:** Toutes les fonctionnalités sont conformes aux diagrammes UML du fichier `initiale`.

> **Pas de breaking changes:** Les modifications sont additives, aucune fonctionnalité existante n'est impactée.

> **Tests:** Ajouter des tests unitaires pour chaque nouveau contrôleur (optionnel mais recommandé).

> **Sécurité:** Tous les contrôleurs admin utilisent le middleware `role:admin`.

---

## 🚀 Après Implémentation

Une fois ce plan complété, le projet sera **100% fonctionnel** pour :
- ✅ Gestion complète des codes promo (admin)
- ✅ Gestion du programme de fidélité (admin)
- ✅ Vue d'ensemble des clients (admin)
- ✅ Configuration des pixels publicitaires (admin)
- ✅ Application des réductions au checkout (client)
- ✅ Utilisation des points de fidélité (client)

**Statut Final:** Projet prêt pour la production ✨
