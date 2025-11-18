# --- Build Stage ---
FROM php:8.2-fpm AS builder

RUN apt-get update && apt-get install -y \
    git unzip libonig-dev libzip-dev libpng-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY . /app
WORKDIR /app

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# --- Deploy Stage ---
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    nginx supervisor libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=builder /app /var/www/html

COPY docker/nginx.conf /etc/nginx/nginx.conf

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www/html

CMD ["/usr/bin/supervisord"]
