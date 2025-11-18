# -------------------------------
# 1. Build de Node para Vite
# -------------------------------
FROM node:20 AS build
WORKDIR /app

# Copiar solo archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del frontend necesario
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.ts ./

# Build de Vite
RUN npm run build

# -------------------------------
# 2. Build de PHP para Laravel
# -------------------------------
FROM php:8.2-fpm

# Instalar dependencias de PHP necesarias
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Copiar composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar solo Laravel para instalar dependencias
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copiar todo Laravel
COPY . . 

# Copiar build de Vite en el public de Laravel
COPY --from=build /app/dist ./public/dist

# Cachear configuración y rutas de Laravel
RUN php artisan config:cache && php artisan route:cache

# -------------------------------
# 3. Servidor web Caddy
# -------------------------------
FROM caddy:2

WORKDIR /srv/app

# Copiar Laravel + frontend ya construidos
COPY --from=0 /app ./

# Copiar configuración de Caddy
COPY Caddyfile /etc/caddy/Caddyfile

# Comando por defecto
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
