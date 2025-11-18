# -------------------------------
# 1. Build de Node para Vite
# -------------------------------
FROM node:20 AS build
WORKDIR /app

# Copiar solo archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del frontend
COPY resources ./resources
COPY vite.config.ts ./

COPY index.html ./

RUN npm run build

# -------------------------------
# 2. Build de PHP para Laravel
# -------------------------------
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar solo Laravel (NO el frontend)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

COPY . .

# Copiar build de Vite en el public
COPY --from=build /app/dist ./public/dist

RUN php artisan config:cache && php artisan route:cache

# -------------------------------
# 3. Servidor web Caddy
# -------------------------------
FROM caddy:2

WORKDIR /srv/app

COPY --from=0 /app ./
COPY Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
