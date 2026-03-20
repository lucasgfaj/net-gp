FROM php:8.3.4-fpm

# Instala dependências do sistema + extensões PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libssh2-1-dev \
    zip \
    tzdata \
    curl \
    gnupg \
    autoconf \
    gcc \
    g++ \
    make \
    openssh-client \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo_pgsql zip \
    && pecl install ssh2 \
    && docker-php-ext-enable ssh2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Copia chave SSH para dentro do container
COPY .ssh/id_ed25519_php /var/www/.ssh/id_ed25519_php
COPY .ssh/id_ed25519_php.pub /var/www/.ssh/id_ed25519_php.pub

# Permissões corretas
RUN chown www-data:www-data /var/www/.ssh/id_ed25519_php* \
    && chmod 600 /var/www/.ssh/id_ed25519_php \
    && chmod 644 /var/www/.ssh/id_ed25519_php.pub
    
# Configura timezone para America/Sao_Paulo
RUN ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && echo "date.timezone=America/Sao_Paulo" > /usr/local/etc/php/conf.d/timezone.ini

# Instala Node.js (versão LTS) e Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable \
    && corepack prepare yarn@stable --activate