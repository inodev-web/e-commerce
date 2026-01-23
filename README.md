# E-Commerce Backend (Laravel 12 + Inertia + React)

Backend robuste et évolutif pour une plateforme e-commerce moderne, conforme aux spécifications UML et optimisé pour le marché algérien.

## 🚀 Fonctionnalités Clés

- **Authentification Sécurisée** : Gestion via Laravel Breeze & Sanctum avec **vérification par SMS OTP** obligatoire pour la validation du compte.
- **Gestion des Commandes avec Snapshots** : Intégrité totale des données via des snapshots JSONB (prix et métadonnées produits au moment de la commande).
- **Système de Fidélité** : Attribution automatique de points (1% du montant) et conversion en remises lors de l'achat.
- **Optimisation Images** : Traitement automatique via **Intervention Image v3** (conversion WebP, redimensionnement 800x800).
- **Tracking Pixel Ads** : Intégration native de `PixelService` pour le tracking des événements `Purchase` (Meta & Google).
- **Livraison Algérie** : Gestion complète des 58 Wilayas et Communes avec tarifs dynamiques (BUREAU/DOMICILE).
- **Codes Promo** : Gestion des codes promotionnels personnels ou partageables.

## 🛠️ Stack Technique

- **Framework** : Laravel 12.x
- **Frontend Bridge** : Inertia.js (React)
- **Base de données** : PostgreSQL (Supabase)
- **Sécurité** : Laravel Sanctum + Spatie Roles & Permissions
- **Logs SMS** : Log provider par défaut (extensible vers providers locaux)

## 📦 Installation & Configuration

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/inodev-web/e-commerce.git
   cd e-commerce
   ```

2. **Installer les dépendances** :
   ```bash
   composer install
   npm install
   ```

3. **Environnement** :
   Copier le fichier `.env.example` en `.env` et configurer vos accès DB.

4. **Base de données & Seeders** :
   Pour configurer les **58 Wilayas** et les données de départ :
   ```bash
   php artisan migrate --seed
   ```
   *Note : Le seeder initialise les rôles (admin/client), les wilayas, et les tarifs de livraison par défaut.*

5. **Lancer le projet** :
   ```bash
   php artisan serve
   npm run dev
   ```

## 🧪 Tests

Le projet inclut une suite de tests complète (47 tests unitaires et fonctionnels) couvrant l'intégralité du cycle métier.

```bash
php artisan test
```

## 📄 Licence
Ce projet est sous licence MIT.
