# SSD - System Specification Document

## 1. Visão Geral do Sistema

### 1.1 Descrição
Sistema de Gerenciamento de Visitantes com vouchers temporários para acesso à rede corporativa. O sistema cria usuários no Samba/AD via SSH e os remove automaticamente após expiração.

### 1.2 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| PHP | 8.2+ | Linguagem backend base |
| Laravel | 12.x | Backend Framework |
| Laravel Starterkit | - | Scaffold oficial englobando o pacote Inertia + React |
| React | 19.x | Framework frontend |
| Vite | 7.x | Build tool frontend rápido |
| Tailwind CSS | 4.x | Framework para estilização (CSS) |
| PostgreSQL | 14.x+ | Banco de dados primário |
| Docker | Latest | Isolamento das aplicações em múltiplos containeres |
| phpseclib3 | 3.x | Biblioteca de túnel SSH |
| PhpSpreadsheet | 2.x | Leitura/conversão massiva de planilhas XLSX/XLS |
| LDAP | - | Protocolo de pesquisa e autenticação do Active Directory |

---

## 2. Arquitetura do Sistema

### 2.1 Diagrama de Arquitetura

```mermaid
graph TD
    classDef container fill:#E2E8F0,stroke:#334155,stroke-width:1px,color:#0F172A
    classDef external fill:#FED7AA,stroke:#B45309,stroke-width:1px,color:#451A03
    classDef db fill:#BAE6FD,stroke:#0284C7,stroke-width:1px,color:#082F49

    subgraph Ecossistema_Docker_Net_GP
        Front["Frontend (React)"]:::container
        Back["Backend (Laravel)"]:::container
        Worker["Container Worker<br/>Mesa de Jobs"]:::container
    end
    
    DB[("Banco de Dados<br/>PostgreSQL")]:::db

    subgraph Servidores_Corporativos_Cliente
        LDAP["Servidor LDAP<br/>Auth"]:::external
        Samba["Servidor AD/Samba<br/>SSH"]:::external
        SMTP["Servidor SMTP<br/>Mailer"]:::external
    end

    Front <-->|Inertia + Axios| Back
    
    Back -.->|Registra Jobs| DB
    DB -.->|Consome Jobs| Worker
    
    Back <-->|Sessão / Consultas| DB
    
    Back <-->|Valida / Pesquisa| LDAP
    Back <-->|SSH tunnel| Samba
    Worker <-->|SSH tunnel| Samba
    Worker -->|Dispara| SMTP
```

### 2.2 Componentes

Listagem completa de todos os componentes do sistema Net-GP:

#### 2.2.1 Frontend

| Componente | Tecnologia | Responsabilidade |
|-----------|-----------|-----------------|
| `React App` | React 18.x | Interface de usuário (SPA) |
| `Inertia Pages` | Inertia 2.x | Páginas roteadas pelo Laravel |
| `Tailwind Components` | Tailwind 3.x | Componentes visuais reutilizáveis |
| `Vite Config` | Vite 6.x | Build tool e hot-reload |

#### 2.2.2 Backend (Controllers)

| Componente | Responsabilidade |
|-----------|-----------------|
| `VisitorsController` | CRUD de visitantes (listar, criar, editar, excluir, gerar senha, reenviar) |
| `VouchersController` | Listagem e filtragem de vouchers |
| `UsersController` | Gestão de usuários do sistema (listar, editar roles) |
| `DepartmentsController` | CRUD de departamentos |
| `VisitorTypeController` | CRUD de tipos de visitante |
| `VisitorImportController` | Upload e processamento de importação em lote |
| `ImportBatchController` | Visualização e gestão de lotes importados |
| `ImportErrorController` | Gerenciamento de erros de importação (editar, pular, excluir) |
| `DashboardController` | Métricas e cards do dashboard |

#### 2.2.3 Services

| Componente | Responsabilidade |
|-----------|-----------------|
| `LdapService` | Conexão, autenticação e pesquisa no Active Directory |
| `SambaService` | SSH via phpseclib3 para criar/deletar usuários no Samba/AD |
| `ActivityLogService` | Registro transversal de ações (IP, user agent, autor) |
| `VoucherService` | Geração de credenciais (login=CPF, senha automática) |
| `EmailService` | Disparo de emails com credenciais aos visitantes |

#### 2.2.4 Jobs e Commands

| Componente | Responsabilidade |
|-----------|-----------------|
| `DisableExpiredVisitors` | Comando cron que remove visitantes expirados do Samba e BD |
| `ProcessVisitorImport` | Job de fila que processa cada linha de importação em lote |
| `SendVoucherEmail` | Job de fila que dispara email de credenciais com rate limiting |

#### 2.2.5 Middlewares

| Componente | Responsabilidade |
|-----------|-----------------|
| `auth` | Verifica sessão autenticada |
| `verified` | Verifica email confirmado (`email_verified_at`) — middleware padrão Laravel/Fortify |
| `admin` | Restringe acesso a usuários com role=admin (COGETI) |

#### 2.2.6 Models

| Componente | Responsabilidade |
|-----------|-----------------|
| `User` | Usuário do sistema (sincronizado com LDAP) |
| `Department` | Departamento/setor |
| `Visitor` | Visitante cadastrado |
| `VisitorType` | Categoria de visitante |
| `VisitorVoucher` | Credencial temporária |
| `ActivityLog` | Registro de auditoria |
| `ImportBatch` | Lote de importação em massa |
| `ImportError` | Erros individuais de importação |

#### 2.2.7 Infraestrutura

| Componente | Responsabilidade |
|-----------|-----------------|
| `PostgreSQL` | Banco de dados relacional |
| `phpseclib3` | Biblioteca SSH para túnel seguro |
| `PhpSpreadsheet` | Leitura de planilhas XLSX/XLS |
| `Laravel Queue` | Sistema de filas (database driver) |
| `Laravel Scheduler` | Cron jobs do Laravel |
| `Docker` | Containerização dos serviços |

#### 2.2.8 Servidores Externos

| Componente | Responsabilidade |
|-----------|-----------------|
| `Servidor LDAP/AD` | Autenticação e mapeamento de grupos |
| `Servidor Samba/AD` | Gestão de usuários de rede via SSH |
| `Servidor SMTP` | Disparo de emails |

---

### 2.3 Componentes Principais

Explicação detalhada dos componentes core do sistema:

#### LdapService

Responsável por toda a comunicação com o Active Directory via protocolo LDAP. Realiza a autenticação dos usuários internos (operadores e admins) validando credenciais `username` + `password` contra o AD. Após autenticação bem-sucedida, extrai os grupos do usuário (`memberOf`), mapeia o grupo para um departamento do sistema e define a role: membros do grupo **COGETI** recebem `admin`, demais recebem `operator`. Cria ou atualiza o registro na tabela `users` automaticamente no primeiro login.

#### SambaService

Componente que estabelece conexão SSH segura com o servidor Samba/Active Directory utilizando a biblioteca `phpseclib3` com autenticação por chave privada RSA. Executa comandos remotos de gestão de usuários de rede:

- `samba-tool user create <user> <pass>` — criação de usuário temporário
- `samba-tool user setpassword <user> --newpassword=<pass>` — alteração de senha
- `samba-tool user delete <user>` — remoção de usuário

Utilizado na criação de visitantes, geração de novas senhas, reenvio de credenciais e na rotina de expiração automática. Cada operação é executada dentro de uma transação isolada para garantir atomicidade.

#### VisitorsController

Controller central do sistema, responsável pelo ciclo de vida completo dos visitantes. Implementa as operações de:

- **Listagem**: com paginação (10-15 registros), filtros por departamento, busca por nome/CPF/email
- **Criação**: valida CPF único, email único, cria Visitor + Voucher + usuário Samba + envia email + registra ActivityLog
- **Edição**: altera dados do visitante com validações de integridade
- **Exclusão**: remove visitante, voucher e usuário Samba (se voucher ativo)
- **Geração de senha**: cria nova senha de 8 caracteres e atualiza no Samba
- **Reenvio**: reenvia email com credenciais existentes

Aplica filtro departamental: operadores veem apenas visitantes que criaram; admins veem todos.

#### VouchersController

Controller dedicado à listagem e visualização de vouchers. Permite filtrar por departamento, tipo de visitante e criador. Ordena vouchers por proximidade de expiração e exibe indicador visual para vouchers expirados. Operadores veem apenas vouchers dos visitantes que criaram.

#### DisableExpiredVisitors (Cron Command)

Comando agendado executado diariamente às 00:00 pelo Laravel Scheduler. Executa a rotina de limpeza de visitantes expirados:

1. Query por visitantes com `expires_at < today()` (meia-noite) que possuem voucher ativo
2. Para cada resultado, abre uma transação isolada no banco
3. Deleta o usuário no Samba via SSH (`samba-tool user delete`)
4. Remove o voucher do banco de dados
5. Registra evento `visitor_expired` no ActivityLog
6. Commit da transação

Em caso de falha (timeout, erro de conexão), executa rollback apenas daquele visitante, registra o erro e continua para o próximo, garantindo que um voucher problemático não bloqueie toda a rotina.

#### ProcessVisitorImport (Queue Job)

Job processado em background pelo container Worker. Responsável por processar individualmente cada linha de uma planilha importada:

- Valida CPF matematicamente (dígitos verificadores)
- CPF duplicado → atualiza Visitor existente (name, email, phone, school, expires_at) + cria/atualiza Voucher + atualiza Samba
- Email duplicado → gera erro de validação
- Cria/atualiza Visitor + Voucher + usuário Samba
- Dispara email com delay de 2 segundos (rate limiting)
- Registra sucesso ou erro (com número da linha, dados da linha e mensagem)

#### ActivityLogService

Serviço transversal que registra todas as ações do sistema para fins de auditoria e rastreabilidade. Captura automaticamente:

- **Autor**: nome, email, role e departamento do usuário logado
- **Origem**: IP de origem e User Agent (navegador/SO)
- **Timestamp**: data/hora oficial da ação (`created_at`)
- **Evento**: tipo de ação (criação, edição, deleção, login, expiração, etc.)

Registrado em todas as operações de visitantes, autenticação, departamentos, tipos de visitante e importações.

#### DashboardController

Controller que agrega métricas para exibição no painel principal. Retorna dados para os cards e gráficos:

- Total de visitantes (geral e mensal) — **totalVisitors conta todos (sem whereHas('voucher'))**
- Total de visitantes expirados — **contagem apenas dos últimos 7 dias**
- Vouchers ativos
- Distribuição de visitantes por departamento — **consulta única com GROUP BY (N+1 corrigido)**
- Evolução mensal de visitantes — **totalCreatedThisMonth corrigido (bug de mutação Carbon)**
- Próximos vouchers a expirar — **paginação client-side (5 por página)**
- Últimas atividades — **usa getDescription() do model, paginação client-side (5 por página)**
- Histórico de lotes de importação — **paginação client-side (5 por página)**
- **Dashboard refatorado em métodos privados**

Aplica filtro departamental: operadores veem apenas métricas dos seus visitantes.

---

## 3. Especificação de Banco de Dados

### 3.1 ER Diagram

```mermaid
erDiagram
    departments ||--o{ users : "contém"
    users ||--o{ visitors : "cria"
    users ||--o{ activity_logs : "registra"
    users ||--o{ import_batches : "cria"
    users ||--o{ visitor_vouchers : "cria_voucher"
    users ||--o{ sessions : "possui"
    visitor_types ||--o{ visitors : "tipifica"
    visitors ||--o{ visitor_vouchers : "possui"
    visitors ||--o{ import_batches : "importado_em"
    import_batches ||--o{ import_errors : "contém_erros"

    departments {
        bigint id PK
        string name "unique"
        timestamp timestamps
    }

    users {
        bigint id PK
        string ldap_dn "unique"
        string username "unique"
        string name
        string email "unique"
        bigint department_id FK
        string password "nullable"
        string role "default: operator"
        timestamp timestamps
    }

    sessions {
        string id PK
        bigint user_id FK
        string ip_address "max 45 chars"
        text user_agent
        longText payload
        int last_activity
    }

    visitor_types {
        bigint id PK
        string name
        text description "nullable"
        timestamp timestamps
    }

    visitors {
        bigint id PK
        string name
        string cpf "unique: numeric only"
        string phone "nullable"
        string email "unique"
        bigint type_id FK
        string school "nullable"
        timestamp expires_at "nullable"
        bigint created_by FK
        boolean enabled "default: true"
        timestamp disabled_at "nullable"
        bigint import_batch_id FK "nullable"
        boolean email_sent "default: false"
        timestamp email_sent_at "nullable"
        timestamp timestamps
    }

    visitor_vouchers {
        bigint id PK
        bigint visitor_id FK "nullable"
        string login "unique: CPF numeric"
        string password
        timestamp expires_at "nullable"
        bigint created_by FK "nullable"
        int printer_id "nullable"
        string phone_private "nullable"
        string phone_public "nullable"
        boolean auto_generated "default: true"
        timestamp timestamps
    }

    activity_logs {
        bigint id PK
        bigint user_id FK
        string action
        json data "nullable"
        timestamp timestamps
    }

    import_batches {
        bigint id PK
        string filename
        int total_rows
        int success_count "default: 0"
        int error_count "default: 0"
        string status "pending/processing/completed/failed/partial/deleted"
        bigint created_by FK
        timestamp timestamps
    }

    import_errors {
        bigint id PK
        bigint import_batch_id FK
        int line_number
        text error_message
        json row_data "nullable"
        boolean skipped "default: false"
        timestamp timestamps
    }

    cache {
        string key PK
        mediumText value
        int expiration
    }

    cache_locks {
        string key PK
        string owner
        int expiration
    }

    jobs {
        bigint id PK
        string queue
        longText payload
        tinyInt attempts
        int reserved_at "nullable"
        int available_at
        int created_at
    }

    job_batches {
        string id PK
        string name
        int total_jobs
        int pending_jobs
        int failed_jobs
        longText failed_job_ids
        mediumText options "nullable"
        int cancelled_at "nullable"
        int created_at
        int finished_at "nullable"
    }

    failed_jobs {
        bigint id PK
        string uuid "unique"
        text connection
        text queue
        longText payload
        longText exception
        timestamp failed_at
    }
```

### 3.2 Tabelas e Campos

#### 3.2.1 Tabelas de Domínio

##### `departments`

Departamentos/setores da organização.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| name | string | UNIQUE | Nome do departamento (COGETI, ASCOM, etc) |
| created_at | timestamp | | Data de criação |
| updated_at | timestamp | | Data de atualização |

##### `users`

Usuários internos do sistema (sincronizados via LDAP).

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| ldap_dn | string | UNIQUE | Distinguished Name do AD |
| username | string | UNIQUE | Username do AD (sAMAccountName) |
| name | string | | Nome completo |
| email | string | UNIQUE | Email institucional |
| department_id | bigint | FK → departments | Departamento do usuário |
| password | string | NULLABLE | Senha (nullable, auth via LDAP) |
| role | string | DEFAULT 'operator' | Perfil: admin ou operator |
| created_at | timestamp | | Data de criação |
| updated_at | timestamp | | Data de atualização |

##### `visitor_types`

Categorias de visitantes (aluno, fornecedor, palestrante, etc).

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| name | string | | Nome do tipo |
| description | text | NULLABLE | Descrição do tipo |
| created_at | timestamp | | Data de criação |
| updated_at | timestamp | | Data de atualização |

##### `visitors`

Visitantes cadastrados no sistema.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| name | string | | Nome do visitante |
| cpf | string | UNIQUE | CPF numérico |
| phone | string | NULLABLE | Telefone |
| email | string | UNIQUE | Email do visitante |
| type_id | bigint | FK → visitor_types | Tipo do visitante |
| school | string | NULLABLE | Escola/Instituição |
| expires_at | timestamp | NULLABLE | Data de expiração do acesso |
| created_by | bigint | FK → users | Usuário que criou o visitante |
| enabled | boolean | DEFAULT true | Visitante ativo |
| disabled_at | timestamp | NULLABLE | Data de desativação |
| import_batch_id | bigint | FK → import_batches, NULLABLE | Lote de importação (se aplicável) |
| email_sent | boolean | DEFAULT false | Credenciais enviadas por email |
| email_sent_at | timestamp | NULLABLE | Quando o email foi enviado |
| created_at | timestamp | | Data de criação |
| updated_at | timestamp | | Data de atualização |

##### `visitor_vouchers`

Credenciais temporárias de acesso à rede.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| visitor_id | bigint | FK → visitors, NULLABLE | Visitante vinculado |
| login | string | UNIQUE | Login (CPF numérico) |
| password | string | | Senha em hash |
| expires_at | timestamp | NULLABLE | Data de expiração do voucher |
| created_by | bigint | FK → users, NULLABLE | Usuário que criou o voucher |
| printer_id | int | NULLABLE | ID da impressora |
| phone_private | string | NULLABLE | Telefone privado |
| phone_public | string | NULLABLE | Telefone público |
| auto_generated | boolean | DEFAULT true | Voucher gerado automaticamente |
| created_at | timestamp | | Data de criação |
| updated_at | timestamp | | Data de atualização |

##### `activity_logs`

Registro transversal de auditoria de todas as ações do sistema.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| user_id | bigint | FK → users | Autor da ação |
| action | string | | Tipo de ação (visitor_created, login, etc) |
| data | json | NULLABLE | Dados contextuais (IP, user agent, valores antigos/novos) |
| created_at | timestamp | | Data/hora da ação |
| updated_at | timestamp | | Data de atualização |

#### 3.2.2 Tabelas de Importação em Lote

##### `import_batches`

Lotes de importação massiva de visitantes via planilha.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| filename | string | | Nome do arquivo importado |
| total_rows | int | | Total de linhas processadas |
| success_count | int | DEFAULT 0 | Quantidade de visitantes criados com sucesso |
| error_count | int | DEFAULT 0 | Quantidade de erros |
| status | string | DEFAULT 'pending' | pending / processing / completed / failed / partial / deleted |
| created_by | bigint | FK → users | Usuário que iniciou a importação |
| created_at | timestamp | | Data de criação |
| updated_at | timestamp | | Data de atualização |

##### `import_errors`

Erros individuais ocorridos durante importações em lote.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| import_batch_id | bigint | FK → import_batches | Lote ao qual o erro pertence |
| line_number | int | | Número da linha na planilha |
| error_message | text | | Mensagem descritiva do erro |
| row_data | json | NULLABLE | Dados brutos da linha que falhou |
| skipped | boolean | DEFAULT false | Se o erro foi pulado pelo usuário |
| created_at | timestamp | | Data de criação |
| updated_at | timestamp | | Data de atualização |

#### 3.2.3 Tabelas de Infraestrutura Laravel

##### `sessions`

Sessões de usuários autenticados (SESSION_DRIVER=database).

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | string | PK | Identificador da sessão |
| user_id | bigint | FK → users, INDEX | Usuário dono da sessão |
| ip_address | string (45) | NULLABLE | IP do cliente |
| user_agent | text | NULLABLE | Browser/SO do cliente |
| payload | longText | | Dados serializados da sessão |
| last_activity | int | INDEX | Timestamp da última atividade |

##### `cache`

Armazenamento de cache da aplicação (CACHE_STORE=database).

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| key | string | PK | Chave do item em cache |
| value | mediumText | | Valor armazenado |
| expiration | int | | Timestamp de expiração |

##### `cache_locks`

Locks atômicos para operações concorrentes de cache.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| key | string | PK | Chave do lock |
| owner | string | | Identificador do processo dono |
| expiration | int | | Timestamp de expiração |

##### `jobs`

Fila de jobs processados em background (QUEUE_CONNECTION=database).

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| queue | string | INDEX | Nome da fila |
| payload | longText | | Dados serializados do job |
| attempts | tinyInt | | Número de tentativas |
| reserved_at | int | NULLABLE | Quando o job foi reservado |
| available_at | int | | Quando o job fica disponível |
| created_at | int | | Quando o job foi criado |

##### `job_batches`

Agrupamento de jobs para processamento em lote.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | string | PK | Identificador do batch |
| name | string | | Nome do batch |
| total_jobs | int | | Total de jobs no batch |
| pending_jobs | int | | Jobs ainda pendentes |
| failed_jobs | int | | Jobs que falharam |
| failed_job_ids | longText | | IDs dos jobs falhos |
| options | mediumText | NULLABLE | Opções de configuração |
| cancelled_at | int | NULLABLE | Quando foi cancelado |
| created_at | int | | Quando foi criado |
| finished_at | int | NULLABLE | Quando finalizou |

##### `failed_jobs`

Jobs que falharam após todas as tentativas.

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | bigint | PK | Identificador único |
| uuid | string | UNIQUE | UUID do job |
| connection | text | | Conexão de origem |
| queue | text | | Fila de origem |
| payload | longText | | Dados do job |
| exception | longText | | Stack trace da exceção |
| failed_at | timestamp | | Quando a falha ocorreu |

---

## 4. Especificação de Autenticação LDAP

### 4.1 Fluxo de Login

```
1. Usuário acessa /login
2. Fornece username + password (não email)
3. LdapService.authenticate(username, password)
   ├── Conecta no AD (ldap_connect)
   ├── Bind como $username@$domain com a senha fornecida
   ├── Busca usuário pelo sAMAccountName
   ├── Extrai atributos: sAMAccountName, displayName, userPrincipalName, distinguishedName, memberOf
   ├── Extrai grupos (memberOf) → CNs maiúsculos
   ├── Constrói email: sAMAccountName + "@utfpr.edu.br" (fixo)
4. Mapeia department pelos grupos CN
5. Mapeia role: COGETI → admin, outros → operator
6. Cria/atualiza usuário na tabela users
7. Loga no sistema
```

### 4.2 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|----------|---------|
| LDAP_HOST | Host do AD | ldap://ldap.dominio.local |
| LDAP_PORT | Porta (389) | 389 |
| LDAP_BASE_DN | Base DN | dc=dominio,dc=local |
| LDAP_DOMAIN | Domínio | dominio.local |
| LDAP_ADMIN_GROUP | Grupo admin primário | COGETI (ou via dotenv) |

---

## 5. Especificação de SSH/Samba

### 5.1 Conexão SSH

- **Biblioteca**: phpseclib3
- **Autenticação**: Chave privada (suporta RSA, ECDSA, Ed25519 via `PublicKeyLoader`)
- **Contrato**: Implementa `SambaInterface` com métodos `createSambaUser`, `userExists`, `updateSambaUserPassword`, `deleteSambaUser`
- **Host/Porta**: Configurável via `config('app.*')`
- **Debug**: Loga todos os comandos SSH com código de saída e output via `Log::info('DEBUG SAMBA PHPSECLIB')`
- **Tratamento de erros**: Retorno estruturado `['success' => bool, 'output' => string|null, 'error' => string|null, 'exit_code' => int|null]` com try/catch genérico

### 5.2 Comandos SSH

| Comando | Descrição |
|---------|-----------|
| `sudo /usr/bin/samba-tool user create <user> <pass>` | Criar usuário (verifica duplicidade antes) |
| `sudo /usr/bin/samba-tool user list \| grep -w <user>` | Verificar existência do usuário |
| `sudo /usr/bin/samba-tool user setpassword <user> --newpassword=<pass>` | Alterar senha |
| `sudo /usr/bin/samba-tool user delete <user>` | Deletar usuário |

> Todos os argumentos são sanitizados com `escapeshellarg()`. A criação de usuário chama `userExists()` primeiro e retorna erro se o usuário já existir (exit_code 255).

### 5.3 Configurações

```php
// config/app.php
return [
    'ip_smb' => env('IP_SMB'),
    'port_smb' => env('PORT_SMB', 22),
    'user_smb' => env('USER_SMB'),
    'path_ssh_smb' => env('PATH_SSH_SMB'),
];
```

---

## 6. Especificação de Cron Job

### 6.1 Comando de Expiração

```bash
php artisan visitors:disable-expired
```

**Descrição**: `Remove voucher e usuário Samba de visitantes expirados`

**Agendamento** (`routes/console.php`):
```php
Schedule::command('visitors:disable-expired')
    ->dailyAt('00:00')
    ->withoutOverlapping();
```

Executa **diariamente às 00:00** (com `->withoutOverlapping()` para evitar execuções concorrentes):

1. Busca visitantes com `expires_at < today()` (estrito) que possuem voucher (`whereHas('voucher')`)
2. Injeta `SambaInterface` e `ActivityLogInterface` via container Laravel
3. Para cada visitante, abre uma `Transaction` no Banco Isolada:
    - Extrai CPF numérico → login (`preg_replace('/\D/', '', $visitor->cpf)`)
    - Executa remotamente o SSH via `$sambaService->deleteSambaUser($login)` no AD
    - Apaga permanentemente o cadastro de voucher da tabela local
    - Salva a baixa no Activity Log (`$activityLogService->logVisitorExpired`)
    - Registra log de sucesso (`Log::info`)
    - Dispara o *Commit*
4. Exibe mensagem de conclusão (`$this->info('Processo de expiração finalizado.')`)

Em caso de **qualquer** `Throwable` (erro de conexão, timeout, exceção genérica), executa rollback exclusivo da transação daquele visitante, registra `Log::error` com o visitor_id e mensagem, e a iteração progride intacta para os demais.

---

## 7. APIs e Endpoints

### 7.1 Rotas Web

#### Públicas (sem middleware)

| Método | Rota | Controller | Nome |
|--------|------|------------|------|
| GET | / | Inertia (auth/login) | home |
| GET/POST | /login | Fortify | login |
| POST | /logout | Fortify | logout |

#### `auth`

| Método | Rota | Controller | Nome |
|--------|------|------------|------|
| GET | /settings/profile | ProfileController | profile.edit |
| PATCH | /settings/profile | ProfileController | profile.update |
| DELETE | /settings/profile | ProfileController | profile.destroy |
| GET | /settings/password | PasswordController | user-password.edit |
| PUT | /settings/password | PasswordController (throttle:6,1) | user-password.update |
| GET | /settings/appearance | Inertia render | appearance.edit |
| GET | /settings/two-factor | TwoFactorAuthenticationController | two-factor.show |

#### `auth, verified`

| Método | Rota | Controller | Nome |
|--------|------|------------|------|
| GET | /dashboard | DashboardController | dashboard |
| GET | /visitors | VisitorsController | visitors.index |
| POST | /visitors | VisitorsController | visitors.store |
| GET | /visitors/create | VisitorsController | visitors.create |
| GET | /visitors/{visitor} | VisitorsController | visitors.show |
| GET | /visitors/{visitor}/edit | VisitorsController | visitors.edit |
| PUT | /visitors/{visitor} | VisitorsController | visitors.update |
| DELETE | /visitors/{visitor} | VisitorsController | visitors.destroy |
| POST | /visitors/{visitor}/generate-password | VisitorsController | visitors.generate-password |
| POST | /visitors/{visitor}/resend-password | VisitorsController | visitors.resend-password |
| GET | /visitors/import | VisitorImportController | visitors.import.index |
| POST | /visitors/import | VisitorImportController | visitors.import.store |
| GET | /vouchers | VouchersController | vouchers.index |
| POST | /vouchers | VouchersController | vouchers.store |
| GET | /vouchers/create | VouchersController | vouchers.create |
| GET | /vouchers/{voucher} | VouchersController | vouchers.show |
| GET | /vouchers/{voucher}/edit | VouchersController | vouchers.edit |
| PUT | /vouchers/{voucher} | VouchersController | vouchers.update |
| DELETE | /vouchers/{voucher} | VouchersController | vouchers.destroy |
| GET | /import-batches | ImportBatchController | importBatches.index |
| GET | /import-batches/{batch} | ImportBatchController | importBatches.show |
| DELETE | /import-batches/{batch} | ImportBatchController | importBatches.destroy |

#### `auth, admin`

| Método | Rota | Controller | Nome |
|--------|------|------------|------|
| GET | /users | UsersController | users.index |
| POST | /users | UsersController | users.store |
| GET | /users/create | UsersController | users.create |
| GET | /users/{user} | UsersController | users.show |
| GET | /users/{user}/edit | UsersController | users.edit |
| PUT | /users/{user} | UsersController | users.update |
| DELETE | /users/{user} | UsersController | users.destroy |
| GET | /activities | ActivitiesController | activities.index |
| GET | /activities/{activity} | ActivitiesController | activities.show |
| GET | /departments | DepartmentsController | departments.index |
| POST | /departments | DepartmentsController | departments.store |
| GET | /departments/create | DepartmentsController | departments.create |
| GET | /departments/{department} | DepartmentsController | departments.show |
| GET | /departments/{department}/edit | DepartmentsController | departments.edit |
| PUT | /departments/{department} | DepartmentsController | departments.update |
| DELETE | /departments/{department} | DepartmentsController | departments.destroy |
| GET | /visitorTypes | VisitorTypeController | visitorTypes.index |
| POST | /visitorTypes | VisitorTypeController | visitorTypes.store |
| GET | /visitorTypes/create | VisitorTypeController | visitorTypes.create |
| GET | /visitorTypes/{visitorType} | VisitorTypeController | visitorTypes.show |
| GET | /visitorTypes/{visitorType}/edit | VisitorTypeController | visitorTypes.edit |
| PUT | /visitorTypes/{visitorType} | VisitorTypeController | visitorTypes.update |
| DELETE | /visitorTypes/{visitorType} | VisitorTypeController | visitorTypes.destroy |

### 7.2 Middlewares

| Middleware | Implementação | Responsabilidade |
|-----------|---------------|-----------------|
| `auth` | Laravel padrão | Verifica sessão autenticada |
| `verified` | Laravel/Fortify padrão | Verifica email confirmado (`email_verified_at`) |
| `admin` | `app/Http/Middleware/AdminOnly.php` | Aborta com 403 se `role !== 'admin'` |

### 7.3 Autenticação Fortify

A autenticação é feita via `Laravel\Fortify` configurado em `config/fortify.php`:

- **Guard**: `web`
- **Username field**: `email` (usuário digita o sAMAccountName no campo de email do formulário)
- **Home**: `/dashboard` (redirect pós-login)
- **Lowercase**: `true` (usernames convertidos para minúsculo)

#### Custom Authenticator (`App\Actions\Fortify\AuthenticateUsingLdap`)

Registrado via `Fortify::authenticateUsing(new AuthenticateUsingLdap)` no `FortifyServiceProvider::boot()`.

**Fluxo**:
1. Recebe `$request->email` (sAMAccountName) + `$request->password`
2. Chama `LdapService::authenticate()` para bind no AD via UPN (`user@domain`)
3. Se falhar → retorna `null` (Fortify mostra erro padrão)
4. Se sucesso → mapeia departamento via `LdapService::mapDepartmentByGroups()`
5. Se grupo não mapear para nenhum departamento → flash `error` com mensagem explicativa e retorna `null`
6. Mapeia role via `LdapService::mapRoleByGroups()`: COGETI → `admin`, demais → `operator`
7. Cria/atualiza usuário com `User::updateOrCreate(['username' => ...], [... 'password' => '$ldap$'])`
8. Retorna o modelo `User` para o Fortify iniciar a sessão

O campo `password` recebe o valor sentinel `'$ldap$'` (nulo para o hash bcrypt, mas preenchido para não quebrar validações do Laravel).



---

## 8. Especificação de autorização

### 8.1 Papéis (Roles)

| Role | Origem (AD) | Descrição |
|------|-------------|-----------|
| `admin` | Grupo **COGETI** mapeado via `LdapService::mapRoleByGroups()` | Acesso total irrestrito |
| `operator` | Qualquer outro grupo que mapeie um departamento | Restrito ao próprio departamento |

### 8.2 Controle de Acesso por Rota

| Middleware | Rotas protegidas | Lógica |
|-----------|-----------------|--------|
| `auth` + `admin` | `/users/*`, `/departments/*`, `/visitorTypes/*`, `/activities/*` | `AdminOnly.php`: `abort(403)` se `role !== 'admin'` |
| `auth` + `verified` | `/visitors/*`, `/vouchers/*`, `/import-batches/*`, `/dashboard` | Apenas sessão ativa + email verificado |

### 8.3 Filtros Departamentais (Data Level)

Aplicado nas consultas de `Visitor`, `Voucher` e `DashboardController`:

| Role | Comportamento |
|------|---------------|
| `admin` | Visualiza visitantes e vouchers de **todos** os departamentos. Pode filtrar por departamento específico na listagem. |
| `operator` | Visualiza **apenas** registros cujo criador (`created_by`) pertence ao seu próprio departamento. |

**Dashboard** — operadores veem apenas métricas (totais, expirações, gráficos, importações) filtradas ao seu departamento. A listagem de departamentos no gráfico também é limitada.

> **Nota técnica**: O filtro de `Visitor` usa `role === 'admin'`, enquanto `Voucher` e `Dashboard` usam `department_id === 1`. Ambos funcionam para o cenário atual (COGETI = id=1), mas seria mais consistente unificar pela role.

---

## 9. Evolução e Melhorias Futuras (Roadmap)

Sendo essa a documentação técnica oficial da versão base validada ("As-Built"), todas pendências infraestruturais complexas (Logs, Importação em Bulk e Cron) já se encontram implementadas. O foco analítico do sistema desloca-se para planejar e incorporar as seguintes inovações em versões vindouras:

| #    | Melhoria                         | Módulo    | Visão Macro do Impacto                                 |
| ---- | -------------------------------- | --------- | ------------------------------------------------------ |
| B01  | Recuperação de Senha Segura      | Visitante | Enviar link de proteção com Hash temporária para visitante recuperar e redefinir acesso sem perturbar o operador |
| B02  | Alertas pró-ativos (Cron Email)  | Sistema   | Disparar aviso notivo aos gestores informando que certos mass-vouchers (lotes) estão em 24h de expurgação |
| B03  | Emissão em Lote e Relatórios     | Admin     | Exigência de exportação física em planilhas/PDF a partir dos recortes das métricas globais e filtros do Dashboard |
| B04  | Traceability Visual (Auditoria)  | Admin     | Desenhar Painel na interface para a *COGETI* analisar num único clique o trajeto (`ActivityLogs`) dos usuários (IP/Horário) |
| B05  | Auto-Connect Wi-Fi (Smart Link)  | Vouchers  | Injetar no Layout do Email um *Magic Link* ou *QR Code* que engatilhe autoconexão nativa em celulares ou SOs, removendo atrito de digitar dados à mão |

---

## 10. Fluxo de Criação de Visitante + Voucher

```
1. POST /visitors (VisitorsController.store)
2. Validação dos campos (name, cpf, email, phone, type_id, expires_at)
   ├── name: string 2-255, sem números
   ├── cpf: único, 11-14 chars, CPFRule (dígitos verificadores)
   ├── email: único, formato válido
   ├── expires_at: após now, no máximo 2 anos (4 anos se ano 2030)
3. VisitorService.create(data)
   ├── DB::transaction()
   │   ├── Extrai CPF numérico → login (preg_replace('/\D/', ''))
   │   ├── Verifica duplicidade no Samba (SambaInterface::userExists)
   │   ├── Cria Visitor no banco
   │   ├── Gera senha aleatória (md5(uniqid), 8 chars)
   │   ├── Cria Voucher (login, password plain text, expires_at)
   │   ├── Cria usuário no Samba (SambaInterface::createSambaUser)
   │   ├── Se falha → VisitorException (rollback automático)
   │   ├── Registra ActivityLog (visitor_created)
   │   └── Dispara email via Notification (VisitorLogin)
   └── Retorna Visitor
4. Redirect → /visitors com flash success (login + email)
```

### Fluxo de Exclusão

```
1. DELETE /visitors/{visitor} (VisitorsController.destroy)
2. VisitorService.delete(visitor, userId)
   ├── Extrai login do CPF
   ├── SambaInterface::deleteSambaUser(login)
   │   └── Se NT_STATUS_NO_SUCH_USER → warning, continua
   ├── Deleta Voucher do banco
   ├── ActivityLog (visitor_deleted)
   └── Deleta Visitor
```

### Fluxo de Geração de Senha

```
1. POST /visitors/{visitor}/generate-password
2. Verifica expires_at não passado
3. VisitorService.generatePassword(visitor, userId)
   ├── Gera nova senha (8 chars)
   ├── Cria ou atualiza Voucher
   ├── Se novo → SambaInterface::createSambaUser
   ├── Se existente → SambaInterface::updateSambaUserPassword
   ├── Dispara email (UpdateVisitorLogin)
   └── ActivityLog (visitor_password_generated)
```

---

## 11. VisitorService (`App\Services\VisitorService`)

Implementa `VisitorInterface` e orquestra todas as operações de visitante.

| Método | Descrição | Transação | Samba | Email | ActivityLog |
|--------|-----------|-----------|-------|-------|-------------|
| `create(array)` | Cria visitor + voucher + samba + email | `DB::transaction` | `createSambaUser` | `VisitorLogin` | `visitor_created` |
| `update(Visitor, array, userId)` | Atualiza dados, recria samba se CPF mudou. Se `reset_password=true`, gera nova senha, atualiza Samba e envia email. | Não | `deleteSambaUser` + `createSambaUser` ou `updateSambaUserPassword` | `UpdateVisitorLogin` (se reset_password) | `visitor_updated` |
| `delete(Visitor, userId)` | Deleta samba + voucher + visitor | Não | `deleteSambaUser` (continua se not found) | - | `visitor_deleted` |
| `generatePassword(Visitor, userId)` | Nova senha, atualiza samba, envia email | Não | `createSambaUser` ou `updateSambaUserPassword` | `UpdateVisitorLogin` | `visitor_password_generated` |
| `resendPassword(Visitor, userId)` | Reenvia email com credenciais existentes | Não | - | `ResendVisitorLogin` | `visitor_password_resent` |

**Dependências injetadas**: `SambaInterface`, `ActivityLogInterface`

**Geração de senha**: `substr(md5(uniqid()), 0, 8)` — 8 caracteres hexadecimais.

---

## 12. EmailService (Notifications)

O sistema não possui um `EmailService` dedicado. Os emails são enviados via **Laravel Notifications** com canal `mail` e template `MailMessage`.

### Notificações

| Notificação | Gatilho | Assunto | Conteúdo |
|-------------|---------|---------|----------|
| `VisitorLogin` | Criação de visitante | "Acesso temporário à rede UTFPR - GP" | Login, senha, validade |
| `UpdateVisitorLogin` | Geração de nova senha | "Acesso temporário à rede UTFPR - GP" | Login, senha atualizada, validade |
| `ResendVisitorLogin` | Reenvio de credenciais | "Acesso temporário à rede UTFPR - GP" | Login, senha existente, validade |
| `UserInitialAccess` | Criação de usuário interno | - | - |

### Configuração SMTP

| Variável | Exemplo |
|----------|---------|
| `MAIL_MAILER` | smtp |
| `MAIL_HOST` | mail.dominio.local |
| `MAIL_PORT` | 587 |
| `MAIL_USERNAME` | no-reply@dominio.local |
| `MAIL_PASSWORD` | secret |

---

## 13. ActivityLogService (`App\Services\ActivityLogService`)

Implementa `ActivityLogInterface` e registra eventos de auditoria na tabela `activity_logs`.

### Eventos Registrados

| Evento | Método | Dados armazenados |
|--------|--------|-------------------|
| `user_login` | `logLogin()` | ip, user_agent, user_name, user_email, user_role, user_department |
| `visitor_created` | `logVisitorCreated(id, name, userId)` | visitor_id, visitor_name + dados de contexto |
| `visitor_updated` | `logVisitorUpdated(id, name, old, new, userId)` | visitor_id, visitor_name, old, new + contexto |
| `visitor_deleted` | `logVisitorDeleted(id, name, userId)` | visitor_id, visitor_name + contexto |
| `visitor_password_generated` | `logPasswordGenerated(id, name, userId)` | visitor_id, visitor_name + contexto |
| `visitor_password_resent` | `logPasswordResent(id, name, userId)` | visitor_id, visitor_name + contexto |
| `visitor_expired` | `logVisitorExpired(id, login)` | visitor_id, login + contexto |
| `department_created` | `logDepartmentCreated(id, name, userId)` | department_id, department_name + contexto |
| `department_deleted` | `logDepartmentDeleted(id, name, userId)` | department_id, department_name + contexto |
| `visitor_type_created` | `logVisitorTypeCreated(id, name, userId)` | type_id, type_name + contexto |
| `visitor_type_deleted` | `logVisitorTypeDeleted(id, name, userId)` | type_id, type_name + contexto |

### Dados de Contexto (sempre incluídos)

```json
{
  "user_name": "Nome do usuário",
  "user_email": "email@dominio.local",
  "user_role": "admin|operator",
  "user_department": "COGETI",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

---

## 14. Fluxo de Importação em Lote

```
1. GET /visitors/import → formulário (upload XLSX/XLS/CSV + type_id + expires_at opcionais)

2. POST /visitors/import (VisitorImportController.store)
   ├── Valida: file ≤ 5MB, mimes: csv,xlsx,xls
   ├── Parse: PhpSpreadsheet (XLSX/XLS) ou fgetcsv (CSV)
   │   └── Remove header row, filtra linhas vazias
   ├── VisitorImportService.import(rows, userId, filename, expiresAt, typeId)
   │   ├── Cria ImportBatch (status: processing)
   │   ├── Para cada linha:
   │   │   ├── validateRow() → valida nome, CPF (digitos), email, phone
   │   │   ├── CPF duplicado → atualiza Visitor existente + atualiza/cria Voucher (não gera erro)
   │   │   ├── Email duplicado → ImportError (linha + mensagem)
   │   │   ├── createOrUpdateVisitor() → cria ou atualiza Visitor
   │   │   ├── ProcessVisitorImport::dispatch(visitor, batch, isUpdate) → delay 2s por linha
   │   │   └── Se VisitorException → ImportError com linha + dados + mensagem
   │   └── Atualiza status: completed / failed / partial
   └── Redirect → /import-batches com flash success/error

3. ProcessVisitorImport (Queue Job, tries=3, backoff=60s)
   ├── Extrai login do CPF
   ├── Gera senha aleatória (se novo) ou mantém (se update)
   ├── Cria ou atualiza Voucher no banco
   ├── SambaInterface::createSambaUser(login, password) ou updateSambaUserPassword
   ├── Se falha → incrementa error_count, retorna
   ├── Se sucesso → incrementa success_count
   ├── Se visitor tem email →
   │   ├── Notifica VisitorLogin (ou UpdateVisitorLogin se update)
   │   ├── Marca email_sent = true, email_sent_at = now
   └── Em caso de Throwable → incrementa error_count, relança
       └── failed() → ImportError com row_data

4. Gerenciamento de Erros (ImportErrorController)
   ├── PUT /import-errors/{error} → edita dados do erro (name, cpf, email, phone, type_id, expires_at) e reprocessa
   │   └── Recria Visitor a partir dos dados corrigidos + dispatch de ProcessVisitorImport
   ├── PATCH /import-errors/{error}/skip → marca erro como skipped = true
   │   └── Quando todos os erros não-pulados são processados, batch auto-completa
   └── DELETE /import-errors/{error} → remove registro de erro

5. Lote deletável via DELETE /import-batches/{batch}
   ├── Deleta samba user + voucher + visitor de cada linha
   └── Marca status = deleted
```

### Estrutura da Planilha

| Coluna | Campo | Obrigatório | Descrição |
|--------|-------|-------------|-----------|
| A | nome | Sim | Nome completo (só letras) |
| B | cpf | Sim | CPF com ou sem máscara |
| C | email | Sim | Para envio das credenciais |
| D | telefone | Não | Telefone do visitante |
| E | motivo | Não | Escola/instituição/motivo |
| F | expires_at | Não | Data de expiração (default +7 dias) |

---

## 15. Tratamento de Erros

### VisitorException (`App\Exceptions\VisitorException`)

Exceção de domínio usada no fluxo de criação e importação.

| Método estático | VisitorError | HTTP Field |
|----------------|-------------|------------|
| `invalidName()` | `INVALID_NAME` | `name` |
| `invalidCpf()` | `INVALID_CPF` | `cpf` |
| `invalidCpfLength()` | `INVALID_CPF_LENGTH` | `cpf` |
| `duplicateCpf()` | `DUPLICATE_CPF` | `cpf` |
| `invalidEmail()` | `INVALID_EMAIL` | `email` |
| `duplicateEmail()` | `DUPLICATE_EMAIL` | `email` |
| `invalidPhone()` | `INVALID_PHONE` | `phone` |
| `invalidDate()` | `INVALID_DATE` | `expires_at` |
| `sambaUserExists()` | `SAMBA_USER_EXISTS` | `cpf` |
| `sambaConnectionError()` | `SAMBA_CONNECTION_ERROR` | `null` (flash) |

### Padrão de uso nos Controllers

```php
try {
    $this->visitorService->create($data);
} catch (VisitorException $e) {
    if ($e->getField()) {
        return back()->withErrors([$e->getField() => $e->getMessage()])->withInput();
    }
    return back()->withErrors(['samba' => $e->getMessage()])->withInput();
} catch (\Throwable $e) {
    // Erro inesperado — mensagem genérica para o usuário
    return back()->withErrors(['error' => 'Erro interno do servidor. Contate o suporte.'])->withInput();
}
```

### Tratamento no Cron (DisableExpiredVisitors)

Cada visitante é processado em transação isolada. Falha em um não afeta os demais:

```php
foreach ($visitors as $visitor) {
    DB::beginTransaction();
    try {
        // ...operações
        DB::commit();
    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('Erro ao processar visitante expirado', [...]);
        // continua para o próximo
    }
}
```

### Tratamento no Job (ProcessVisitorImport)

O job tem `tries=3` com `backoff=60s`. Após exaurir as tentativas, o método `failed()` registra o erro na tabela `import_errors`.

---

## 16. Variáveis de Ambiente Necessárias

```env
# App
APP_NAME=NetGP
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=net_gp
DB_USERNAME=postgres
DB_PASSWORD=secret

# Sessão / Cache / Fila
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database

# SMTP Mail
MAIL_MAILER=smtp
MAIL_HOST=mail.dominio.local
MAIL_PORT=587
MAIL_USERNAME=no-reply@dominio.local
MAIL_PASSWORD=secret
MAIL_ENCRYPTION=STARTTLS
MAIL_FROM_ADDRESS=no-reply@dominio.local
MAIL_FROM_NAME="${APP_NAME}"

# LDAP (config/ldap.php)
LDAP_HOST=ldap://ldap.dominio.local
LDAP_PORT=389
LDAP_BASE_DN=dc=dominio,dc=local
LDAP_DOMAIN=dominio.local
LDAP_ADMIN_GROUP=COGETI

# SSH/Samba (config/app.php)
IP_SMB=10.x.x.x
PORT_SMB=22
USER_SMB=admin_smb
PATH_SSH_SMB=/path/to/private_key
```

---

## 17. Glossário

| Termo | Definição |
|-------|-----------|
| AD | Active Directory (Microsoft) |
| COGETI | Coordenação de Gestão de TI — grupo admin no AD |
| CPF | Cadastro de Pessoas Físicas |
| DN | Distinguished Name (caminho completo de um objeto no AD) |
| Inertia | Biblioteca que conecta Laravel (backend) com React (frontend) sem API |
| LDAP | Lightweight Directory Access Protocol |
| OU | Organizational Unit (container no AD) |
| phpseclib3 | Biblioteca PHP para conexão SSH segura |
| PhpSpreadsheet | Biblioteca PHP para leitura de planilhas XLSX/XLS |
| sAMAccountName | Atributo do AD que armazena o nome de login do usuário |
| Samba | Software livre que implementa o protocolo Active Directory |
| sentinel | Valor fixo (`'$ldap$'`) usado no campo `password` para indicar autenticação LDAP |
| UPN | UserPrincipalName — formato de login `user@domain` |
| Visitor | Visitante cadastrado no sistema para receber acesso temporário |
| Voucher | Credenciais de acesso temporárias (login + senha + validade) |

---

*Documento criado em: 2026-05-21*
*Versão: 1.0*