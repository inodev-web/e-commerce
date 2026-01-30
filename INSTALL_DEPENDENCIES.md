# Dépendances du Projet (Laravel 12 + Inertia + React)

Ce projet utilise une stack moderne basée sur Laravel 12, Inertia.js et React. Voici la liste exhaustive des dépendances nécessaires et comment les installer.

## 1. Prérequis Système
- **PHP** : `^8.2`
- **Composer** : `^2.0`
- **Node.js** : `^20.0` (ou version LTS récente)
- **NPM** : `^10.0` or **PNPM**

## 2. Dépendances Backend (PHP/Composer)

### Essentielles
- `laravel/framework` (^12.0) : Le framework core.
- `inertiajs/inertia-laravel` (^2.0) : Adaptateur côté serveur pour Inertia.
- `tightenco/ziggy` (^2.0) : Permet d'utiliser les routes Laravel dans React.

### Recommandées / Incluses
- `laravel/sanctum` (^4.2) : Authentification API.
- `laravel/tinker` (^2.10) : Console interactive.
- `spatie/laravel-permission` (^6.24) : Gestion des rôles et permissions.
- `intervention/image` (^3.11) : Manipulation d'images.

### Développement
- `laravel/breeze` (^2.3) : Starter kit (Optionnel).
- `phpunit/phpunit` (^11.5) : Tests unitaires.
- `fakerphp/faker` (^1.23) : Génération de fausses données.

## 3. Dépendances Frontend (JS/NPM)

### Framework & Inertia
- `react` (^18.2) & `react-dom` (^18.2)
- `@inertiajs/react` (^2.0) : Adaptateur React pour Inertia.

### Build Tool (Vite)
- `vite` (^7.0)
- `@vitejs/plugin-react` (^4.2)
- `laravel-vite-plugin` (^2.0)

### UI & Styling
- `tailwindcss` (^4.0)
- `@tailwindcss/vite` (^4.1)
- `lucide-react` : Bibliothèque d'icônes.
- `framer-motion` : Animations.

### Utilitaires
- `axios` : Requêtes HTTP.
- `clsx` & `tailwind-merge` : Gestion conditionnelle des classes CSS.

---

## 4. Commandes d'installation

Pour installer toutes les dépendances d'un coup, exécutez :

```bash
# Installation PHP
composer install

# Installation JS
npm install

# Build des assets
npm run dev
```

Ou utilisez le script fourni : `.\install_all.ps1` (PowerShell).
