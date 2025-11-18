# Dockerfile para Laravel 9/10 con PHP 8.2 y Vite
FROM php:8.2-fpm

# Instala dependencias del sistema y npm
RUN apt-get update && apt-get install -y \
    git curl unzip zip libpng-dev libjpeg-dev libfreetype6-dev libonig-dev libxml2-dev libzip-dev npm

# Configura GD
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Copia composer desde imagen oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Directorio de trabajo
WORKDIR /var/www/html

# Copiar todos los archivos del repo
COPY . .

# Evita problemas con permisos y facilita cacheo
RUN chown -R www-data:www-data /var/www/html

# Instalar dependencias de PHP y Node y construir assets
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist || true
RUN npm install --legacy-peer-deps || true
RUN npm run build || true

# Generar APP_KEY si no está presente (siempre es mejor fijarla por env)
RUN php artisan key:generate --force || true

# Exponer puerto usado internamente
EXPOSE 8080

# Start: usar el server de artisan en puerto 8080
CMD ["php","artisan","serve","--host=0.0.0.0","--port=8080"]
