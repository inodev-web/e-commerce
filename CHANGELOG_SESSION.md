# Changelog Session - Refonte Auth & Performance

Ce fichier recense toutes les modifications effectuées depuis le début de cette session de refactorisation.

## 📂 Backend (Laravel)

### Migrations
- **`database/migrations/2026_01_27_203000_update_users_structure_and_roles.php`** (Nouveau)
  - Suppression de la colonne `name`.
  - Ajout de la colonne `role` ('admin', 'client').
- **`database/migrations/2026_01_28_000000_fix_missing_columns_and_indexes.php`** (Nouveau)
  - Ajout colonnes conditionnelles : `slug` (products), `category_id`, `sub_category_id`.
  - Ajout champs Parrainage : `referral_code`, `referrer_id` (users).
  - Création des Index de performance (PostgreSQL compatible).

### Seeders
- **`database/seeders/AdminUserSeeder.php`** (Nouveau)
  - Création d'un utilisateur administrateur par défaut.

### Modèles
- **`app/Models/User.php`**
  - Ajout des relations : `client()`, `referrer()`, `referrals()`.
  - Mise à jour `$fillable` (suppression `name`, ajout `role`).

### Contrôleurs
- **`app/Http/Controllers/Auth/RegisteredUserController.php`**
  - Refonte `store` : Transaction DB atomic (User + Client).
  - Optimisation : Utilisation de `Cache::rememberForever` pour valider Wilayas/Communes (Performance x100).
  - Désactivation de l'événement `Registered` (Fix Timeout email).
- **`app/Http/Controllers/Auth/AuthenticatedSessionController.php`**
  - Redirection conditionnelle après login (Admin vs Client).
- **`app/Http/Controllers/ProfileController.php`**
  - Ajout de la méthode `referral` (Page Parrainage).

### Middleware
- **`app/Http/Middleware/HandleInertiaRequests.php`**
  - Correction crash : Remplacement `$request->user()->name` par `$request->user()->client->first_name`.

### Routes
- **`routes/web.php`**
  - Ajout route API Cache : `/api/wilayas/{id}/communes`.
  - Ajout route Dashboard intelligente (Redirection rôle).
  - Ajout routes : `/profile/referral`, `/orders/{id}/track`.

---

## 💻 Frontend (Inertia/React)

### Pages
- **`resources/js/Pages/Auth/Login.jsx`** (Refonte complète)
  - Fusion Login/Register.
  - Formulaire complet (Nom, Prénom, Adresse, Wilaya dynamique).
  - Traduction FR intégrale.
- **`resources/js/Pages/Profile/Referral.jsx`** (Nouveau)
  - Page de code parrainage et liste des amis invités.

### Styles
- **`resources/css/app.css`**
  - Correction de l'ordre des `@import` (Fix Warning Build Vite).

---

## ⚙️ Configuration
- **`.env`** (À faire manuellement)
  - Recommandation : `SESSION_DRIVER=file` pour éviter les lenteurs Supabase.
