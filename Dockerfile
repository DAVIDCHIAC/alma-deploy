# -------------------------------
# 1. Build de Node para Vite
# -------------------------------
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# -------------------------------
# 2. Build de PHP para Laravel
# -------------------------------
FROM php:8.2-fpm

# Extensiones necesarias
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar Laravel
COPY . .

# Copiar build de Vite
COPY --from=build /app/public ./public

# Instalar dependencias
RUN composer install --no-dev --optimize-autoloader

# Generar cache
RUN php artisan config:cache && php artisan route:cache

# -------------------------------
# 3. Servidor web Caddy
# -------------------------------
FROM caddy:2
WORKDIR /srv/app

# ESTA ES LA LÍNEA CORRECTA
COPY --from=1 /app /srv/app

COPY Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
