# Usa PHP 8.2 con FPM
FROM php:8.2-fpm

# Instala dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    libzip-dev \
    npm

# Configura extensión GD para imágenes si la usas
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copia el proyecto al contenedor
WORKDIR /var/www/html
COPY . .

# Instala dependencias de PHP (Laravel)
RUN composer install --no-dev --optimize-autoloader

# Instala dependencias de Node y construye los assets con Vite
RUN npm install
RUN npm run build

# Genera la APP_KEY
RUN php artisan key:generate --force

# Da permisos a storage y bootstrap/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expone el puerto 8080 (puedes cambiar si quieres otro)
EXPOSE 8080

# Comando para arrancar Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
