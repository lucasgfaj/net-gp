# Net-GP

Sistema de Gerenciamento de Visitantes com vouchers temporários para acesso à rede corporativa. Cria usuários no Samba/AD via SSH e os remove automaticamente após expiração.

## Funcionalidades

- **Autenticação LDAP/AD**: Login com credenciais do domínio, mapeamento automático de departamento e role (admin/operator)
- **Gestão de Visitantes**: Cadastro, edição, exclusão e busca por nome/CPF/email
- **Vouchers Temporários**: Geração automática de login (CPF) + senha, com data de expiração
- **Integração Samba**: Criação e remoção de usuários de rede via SSH (`samba-tool`)
- **Notificação por Email**: Envio automático de credenciais ao visitante
- **Expiração Automática**: Cron diário que remove acessos vencidos
- **Importação em Lote**: Upload de planilhas XLSX/CSV com processamento em fila
- **Activity Log**: Auditoria transversal de todas as ações (IP, user agent, autor)
- **Dashboard**: Métricas, gráficos por departamento, próximos a expirar
- **Filtro Departamental**: Admin (COGETI) vê tudo; operador vê apenas visitantes do seu departamento

## Arquitetura

```
┌─────────────────────┐     ┌─────────────────────┐
│   Frontend React    │     │   Backend Laravel   │
│       (Inertia)     │◄───►│     (PHP 8.3)       │
└─────────────────────┘     └────────┬────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
   ┌──────────┐            ┌──────────────────┐       ┌────────────────┐
   │PostgreSQL│            │  LDAP/AD (Auth)   │       │ Samba/AD (SSH) │
   └──────────┘            └──────────────────┘       └────────────────┘
```

### Containers (Docker)

| Serviço | Imagem | Função |
|---------|--------|--------|
| `web` | nginx:latest | Servidor web (proxy reverso) |
| `php` | Dockerfile (php:8.3-fpm) | Aplicação Laravel + Vite |
| `queue` | Dockerfile | Processador de filas (Supervisor) |
| `db` | postgres:16 | Banco de dados |

---

## Configuração da VM (Desenvolvimento)

### Acesso

```bash
# Exemplo:
ssh usuario@ip-da-vm
```

### Instalar ferramentas

```bash
# sudo
su -
apt install sudo
usermod -aG sudo $USER
# saia e entre novamente no terminal

# cURL
sudo apt install curl -y

# Git
sudo apt update
sudo apt install git -y

# Docker (script único)
nano docker.sh
```

Cole o conteúdo abaixo no `docker.sh`:

```bash
#!/bin/bash
set -e
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
echo "Faça logout/login antes de usar docker sem sudo."
```

```bash
sudo chmod +x docker.sh
./docker.sh
# Faça logout e login novamente
```

### PHP 8.4 + Composer + Laravel

```bash
# Instala PHP 8.4 e Composer
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"

# Saia e entre novamente no terminal, depois:
composer global require laravel/installer
```

### Node.js + Yarn

```bash
# NVM
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install --lts
nvm use --lts
corepack enable
```

---

## Setup do Projeto

### Clonar e configurar

```bash
git clone https://github.com/lucasgfaj/net-gp.git
cd net-gp
cp .env.example .env
```

Edite o `.env` com as configurações do seu ambiente (DB, LDAP, SMTP, Samba):

```env
APP_NAME=NetGP
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=STARTTLS
MAIL_FROM_ADDRESS=

LDAP_HOST=ldap://ldap.dominio.local
LDAP_PORT=389
LDAP_BASE_DN=dc=dominio,dc=local
LDAP_DOMAIN=dominio.local
LDAP_ADMIN_GROUP=COGETI

IP_SMB=
USER_SMB=
PATH_SSH_SMB=
PORT_SMB=22
```

### Configurar chave SSH para o Samba

```bash
# Gera a chave na VM
ssh-keygen -t ed25519 -f ~/.ssh/net-gp-access -C "net-gp-access"

# Cria o diretório docker/ssh e copia a chave
mkdir -p docker/ssh
cp ~/.ssh/net-gp-access docker/ssh/

# Copia a chave pública para o servidor Samba
cat ~/.ssh/net-gp-access.pub
# Acesse o servidor Samba e adicione ao ~/.ssh/authorized_keys
```

Teste a conexão:

```bash
ssh -i ~/.ssh/net-gp-access usuario_samba@ip_do_samba
```

### Subir o sistema

```bash
# Sobe os containers (nginx, php, queue, db)
./run up -d --build

# Se for primeira vez ou quiser resetar o banco
./run db:reset

# Instala dependências frontend e faz a build
yarn
yarn run build

# Ajusta permissões
./run permissions

# Se houver erro de storage, use:
./run storage
```

Acesse: [http://localhost](http://localhost)

---

## Comandos Disponíveis (`./run`)

### Docker

| Comando | Descrição |
|---------|-----------|
| `./run up` | Sobe containers (com `-d` para detached) |
| `./run down` | Para containers |
| `./run ps` | Lista containers ativos |

### PHP / Laravel

| Comando | Descrição |
|---------|-----------|
| `./run php:console` | Abre console PHP interativo |
| `./run visitors:expired` | Executa expiração manual de visitantes |
| `./run tests` | Roda test suite (PHPUnit) |
| `./run composer install` | Instala dependências Composer |
| `./run permissions` | Corrige permissões de `storage/` e `bootstrap/cache/` |
| `./run storage` | Corrige permissões com `chown 33:33` |

### Nginx

| Comando | Descrição |
|---------|-----------|
| `./run nginx:check` | Verifica configuração do nginx |
| `./run nginx:reload` | Recarrega nginx |
| `./run nginx:status` | Status do nginx |

### Banco de Dados

| Comando | Descrição |
|---------|-----------|
| `./run db:console` | Abre console PostgreSQL |
| `./run db:reset` | Roda `migrate:fresh --seed` (zera e popula o banco) |
| `./run db:populate` | Roda apenas `db:seed` |

### Git

| Comando | Descrição |
|---------|-----------|
| `./run git:clean:branchs` | Remove branches locais (exceto master/main/develop/production) |

---

## Troubleshooting

### Permissões storage

```bash
sudo chown -R 33:33 storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
# ou use: ./run storage
```

### Erro de conexão Samba

Verifique se a chave SSH foi copiada corretamente para o servidor:

```bash
ssh -i ~/.ssh/net-gp-access usuario_samba@ip_do_samba
```

### Containers não sobem

```bash
docker compose logs php
docker compose logs db
```
