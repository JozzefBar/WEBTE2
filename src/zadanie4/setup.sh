#!/bin/bash
# Setup script for Zadanie 4 - run inside the PHP container
# Usage: docker exec dev_php bash /var/www/html/zadanie4/setup.sh

cd /var/www/html/zadanie4

# Create the database
mysql -h db -u root -proot -e "CREATE DATABASE IF NOT EXISTS zadanie4_db; GRANT ALL PRIVILEGES ON zadanie4_db.* TO 'app_user'@'%'; FLUSH PRIVILEGES;" 2>/dev/null

# Install composer dependencies
composer install --no-interaction

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed the database
php artisan db:seed --force

# Set permissions
chmod -R 777 storage bootstrap/cache

echo "✅ Zadanie 4 setup complete!"
echo "Visit: http://localhost:8080/zadanie4/public/"
