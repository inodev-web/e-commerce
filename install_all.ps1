Write-Host "--- Installation des dépendances Laravel 12 + React + Inertia ---" -ForegroundColor Cyan

# 1. Vérification des outils
if (!(Get-Command php -ErrorAction SilentlyContinue)) { Write-Error "PHP n'est pas installé."; exit }
if (!(Get-Command composer -ErrorAction SilentlyContinue)) { Write-Error "Composer n'est pas installé."; exit }
if (!(Get-Command npm -ErrorAction SilentlyContinue)) { Write-Error "NPM n'est pas installé."; exit }

# 2. Installation des dépendances Composer
Write-Host "`n[1/4] Installation des packages PHP..." -ForegroundColor Yellow
composer install

# 3. Installation des dépendances NPM
Write-Host "`n[2/4] Installation des packages Node.js..." -ForegroundColor Yellow
npm install

# 4. Configuration de l'environnement
if (!(Test-Path .env)) {
    Write-Host "`n[3/4] Création du fichier .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    php artisan key:generate
} else {
    Write-Host "`n[3/4] Fichier .env déjà présent." -ForegroundColor Gray
}

# 5. Build Initial
Write-Host "`n[4/4] Lancement du serveur de développement Vite..." -ForegroundColor Yellow
Write-Host "L'installation est terminée ! Vous pouvez maintenant lancer 'php artisan serve' dans un autre terminal." -ForegroundColor Green

npm run dev
