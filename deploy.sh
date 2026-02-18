#!/bin/bash

# Deployment script for Pureva e-commerce
# Run this on the production server

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /home/e-commerce || { echo "❌ Project directory not found"; exit 1; }

# 1. Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 2. Install PHP dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# 3. Clear Laravel cache
echo "🧹 Clearing cache..."
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Run migrations (if needed)
echo "🗄️  Running migrations..."
php artisan migrate --force

# 5. Seed database if needed
# php artisan db:seed --force

# 6. Build frontend assets
echo "🔨 Building frontend assets..."
npm run build

# 7. Set permissions
echo "🔐 Setting permissions..."
chmod -R 775 storage bootstrap/cache

# 8. Restart PHP-FPM and Nginx
echo "🔄 Restarting services..."
systemctl restart php-fpm
systemctl restart nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be live at https://pureva-pharma.com"
