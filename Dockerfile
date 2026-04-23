FROM php:8.3.4-fpm

# Instala dependências do sistema + extensões PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libldap2-dev \
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
    git \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo_pgsql zip \
    && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu \
    && docker-php-ext-install ldap \
    && git clone https://github.com/php/pecl-networking-ssh2.git /usr/src/php/ext/ssh2 \
    && docker-php-ext-install ssh2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/www-data \
    && chown -R www-data:www-data /home/www-data

RUN mkdir -p /var/www/.ssh \
    && chown -R www-data:www-data /var/www/.ssh \
    && chmod 700 /var/www/.ssh

COPY docker/ssh/id_ed25519_php /var/www/.ssh/id_ed25519_php

RUN chown www-data:www-data /var/www/.ssh/id_ed25519_php \
    && chmod 600 /var/www/.ssh/id_ed25519_php

# Configura timezone para America/Sao_Paulo
RUN ln -fs /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && echo "date.timezone=America/Sao_Paulo" > /usr/local/etc/php/conf.d/timezone.ini

# Instala Node.js (versão LTS) e Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable \
    && corepack prepare yarn@stable --activate

# Instala Composer oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
