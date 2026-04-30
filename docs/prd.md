# PRD - Product Requirements Document

## 1. Visão Geral do Produto

### 1.1 Nome do Sistema
**Net-GP** - Sistema de Gerenciamento de Visitantes e Vouchers

### 1.2 Descrição do produto
Sistema web para gestão de visitantes com criação automática de vouchers de acesso à rede corporativa. O sistema cria automaticamente usuários temporários no Active Directory (Samba) que são removidos após a data de expiração configurada.

### 1.3 Usuários-alvo
- **Administradores de TI**: Gestão completa do sistema
- **Operadores de departamentos**: Criação de visitantes do seu departamento
- **Visitantes**: Recebem credenciais de acesso temporário

### 1.4 Problema que resolve
- Gestionar os de visitantes à rede WiFi corporativa
- Controle de acesso temporário com expiração automática
- Rastreabilidade completa de quem criou cada acesso
- Conformidade com políticas de segurança

---

## 2. Requisitos Funcionais

### 2.1 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| PHP | 8.2+ | Linguagem backend |
| Laravel | 12.x | Framework PHP |
| React | 18.x | Framework frontend |
| Inertia | 2.x | Adapter React para Laravel |
| Tailwind CSS | 3.x | Framework CSS |
| MySQL/PostgreSQL | 8.x+ | Banco de dados |
| Docker | Latest | Containerização |
| LDAP/AD | - | Autenticação |

### 2.2 Módulo de Autenticação

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF01 | Login via LDAP | Autenticar com credenciais do AD | Alta |
| RF02 | Logout | Encerrar sessão | Alta |
| RF03 | Mapeamento automático | Extrair department e role do AD | Alta |
| RF04 | Acesso negado | Bloquear usuários sem grupo mapeado | Alta |

**Fluxo de Login:**
```
1. Usuário acessa /login
2. Fornece username + password do domínio
3. Sistema valida no LDAP/AD
4. Sistema mapeia grupo → department + role
5. Usuário é logado automaticamente
```

### 2.2 Módulo de Visitantes

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF05 | Listar visitantes | Ver todos os visitantes (filtrado por dept) | Alta |
| RF06 | Criar visitante | Cadastrar novo visitante com voucher | Alta |
| RF07 | Editar visitante | Alterar dados do visitante | Alta |
| RF08 | Excluir visitante | Remover visitante e voucher | Alta |
| RF09 | Gerar nova senha | Criar nova senha para o voucher | Média |
| RF10 | Reenviar voucher | Reenviar email com credenciais | Média |
| RF11 | Filtrar por department | Filtrar visitantes por departamento | Alta |
| RF12 | Buscar visitante | Buscar por nome, CPF ou email | Alta |

**RF06 - Criar Visitante:**
```
1. Operador preenche: nome, CPF, email, tipo, validade
2. Sistema valida CPF único
3. Sistema cria:
   - Visitor na tabela visitors
   - Voucher com login=CPF(números)
   - Usuário no Samba via SSH
4. Sistema envia email com credenciais
5. visitante pode acessar WiFi até expires_at
```

### 2.3 Módulo de Vouchers

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF13 | Listar vouchers | Ver todos os vouchers | Alta |
| RF14 | Filtrar vouchers | Por department, tipo, criador | Alta |
| RF15 | Ordenar por expiração | Mais próximos a expirar | Média |
| RF16 | Indicador de expirado | Mostrar vouchers expirados | Alta |

### 2.4 Módulo de Departamentos

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF17 | Listar departamentos | Ver todos os departamentos | Alta |
| RF18 | Criar departamento | Cadastrar novo departamento | Admin |
| RF19 | Editar departamento | Alterar nome do departamento | Admin |
| RF20 | Excluir departamento | Remover departamento | Admin |

### 2.5 Módulo de Tipos de Visitante

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF21 | Listar tipos | Ver tipos de visitante | Alta |
| RF22 | Criar tipo | Cadastrar novo tipo | Admin |
| RF23 | Editar tipo | Alterar tipo | Admin |
| RF24 | Excluir tipo | Remover tipo | Admin |

### 2.6 Módulo de Usuários (Admin)

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF25 | Listar usuários | Ver todos os usuários do sistema | Admin |
| RF26 | Editar usuário | Alterar role de usuário | Admin |
| RF27 | Filtrar por department | Filtrar usuários | Admin |

### 2.7 Módulo de Dashboard

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF28 | Visitantes por dept | Card com total por departamento | Alta |
| RF29 | Usuários por mês | Gráfico de tendência mensal | Alta |
| RF30 | Próximos expirar | Lista de vouchers que expiram em 7 dias | Alta |
| RF31 | Visitantes expirados | Lista de visitantes já expirados | Alta |
| RF32 | Últimas atividades | Lista de últimas ações realizadas | Média |

### 2.8 Módulo de Rastreabilidade

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF33 | Quem criou | Exibir usuário que criou visitante | Alta |
| RF34 | Quando criou | Exibir data de criação | Alta |
| RF35 | Qual department | Exibir department do criador | Alta |
| RF36 | Log de atividades | Registrar todas as ações | Alta |

**RF33-RF36 - Rastreabilidade:**
```
Todo visitante criado deve conter:
- created_by (usuário que criou)
- created_at (quando criou)

Visitor.creator.department mostra:
- Nome do criador
- Department do criador

ActivityLogs registra:
- create_visitor
- update_visitor
- delete_visitor
- create_voucher
- disable_expired
- login
```

### 2.9 Sistema de Expiração Automática

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF37 | Cron job diário | Executar cleanup diariamente 00:00 | Alta |
| RF38 | Deletar usuário Samba | Remover usuário do AD | Alta |
| RF39 | Remover voucher | Remover voucher do BD | Alta |
| RF40 | Log de expiração | Registrar expiração no activity_log | Alta |

---

## 3. Requisitos Não-Funcionais

### 3.1 Segurança

| # | Requisito | Descrição |
|---|----------|-----------|
| RNF01 | Senha não exposta | Não exibir senha em tela |
| RNF02 | SSH seguro | Usar chave privada para SSH |
| RNF03 | CSRF protection | Middleware Laravel |
| RNF04 | Rate limiting | Limitar tentativas de login |

### 3.2 Performance

| # | Requisito | Descrição |
|---|----------|-----------|
| RNF05 | Paginação | 10-12 itens por página |
| RNF06 | Cache | Cache em queries frecuentes |
| RNF07 | Índice CPF | Índice unique em cpf |

### 3.3 Usabilidade

| # | Requisito | Descrição |
|---|----------|-----------|
| RNF08 | Validação frontend | Validar CPF em tempo real |
| RNF09 | Feedback visual | Mensagens de sucesso/erro |
| RNF10 | Filtros persistentes | Manter filtros na paginação |

---

## 4. Regras de Negócio

### 4.1 Criação de Visitante

| Regra | Descrição |
|-------|-----------|
| RN01 | CPF deve ser único no sistema |
| RN02 | Email deve ser único |
| RN03 | expires_at deve ser future |
| RN04 | Login do voucher = CPF (só números) |
| RN05 | Senha automática com 8 caracteres |
| RN06 | Visitante vinculado ao creator |

### 4.2 Permissões por Role

| Role | Visualiza | Cria | Edita | Deleta |
|------|----------|------|------|-------|
| admin | Todos dept | Sim | Todos | Todos |
| Operador | Seu dept | Sim | Seu dept | Seu dept |

### 4.3 Expiração

| Regra | Descrição |
|-------|-----------|
| RN07 | Visitante expira às 00:00 da data expires_at |
| RN08 | Usuário Samba removido junto |
| RN09 | Voucher removido da tabela |

### 4.4 Importação em Lote

| Regra | Descrição |
|-------|-----------|
| RN10 | Importação processada em background (queue/jobs) |
| RN11 | CPF validado matematicamente (dígito verificador) |
| RN12 | CPF único no sistema |
| RN13 | Email único no sistema |
| RN14 | Cada visitante do lote cria voucher e usuário no Samba |
| RN15 | Email enviado individualmente com delay entre envios |
| RN16 | Erros de importação armazenados com linha e mensagem |
| RN17 | Linhas vazias são ignoradas na importação |
| RN18 | total_rows considera apenas linhas válidas |

---

## 5. Casos de Uso

### UC01 - Login no Sistema
```
Ator: Usuário do AD
Pré-condições: Usuário tem conta no AD
Fluxo principal:
1. Usuário acessa /login
2. Fornece username e password
3. Sistema autentica no LDAP
4. Sistema busca grupos no AD
5. Sistema mapeia groups → department/role
6. Sistema cria/atualiza usuário em users
7. Usuário é logado
Pós-condições: Usuário autenticado
```

### UC02 - Criar Visitante
```
Ator: Operador ou Admin
Pré-condições: Usuário logado
Fluxo principal:
1. Operador acessa /visitors/create
2. Preenche formulário
3. Sistema valida dados
4. Sistema cria Visitor
5. Sistema cria Voucher (login=CPF)
6. Sistema executa SSH → criar usuário Samba
7. Sistema envia email
8. Sistema registra activity_log
Pós-condições: Visitante pode usar WiFi
```

### UC03 - Expirar Visitantes
```
Ator: Sistema (Cron)
Pré-condições: Cron scheduler ativo
Fluxo principal:
1. Cron executa visitors:disable-expired
2.Sistema busca expires_at <= now()
3. Para cada visitante:
   a. Executa SSH → userdel
   b. Remove voucher
   c. Registra activity_log
Pós-condições: Accessos removidos
```

---

## 6. Wireframes (Simplificados)

### 6.1 Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                     [Usuário] [Sair]        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Total     │  │ Este Mês  │  │ Expirados  │  │
│  │ 145      │  │ 23       │  │ 12        │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                      │
│  Visitantes por Departamento                             │
│  ┌─────────────────────────────────────────────────┐│
│  │ DEPTO_1: 45   ████████████               ││
│  │ DEPTO_2: 23    ██████                       ││
│  │ DEPTO_3: 15      ████                         ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  Próximos a Expirar (7 dias)                        │
│  ┌─────────────────────────────────────────────────┐│
│  │ João Silva  -  30/04/2026  -  DEPTO_1      ││
│  │ Maria Santos -  01/05/2026  -  DEPTO_2     ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  Últimas Atividades                                │
│  ┌─────────────────────────────────────────────────┐│
│  │ DEPTO_1\joão criou Maria Silva      10:30       ││
│  │ DEPTO_2\maria criou João Santos    09:15         ││
│  └─────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### 6.2 Listagem de Visitantes

```
┌─────────────────────────────────────────────────────────────┐
│  Visitantes                     [+ Novo] [Exportar]        │
├─────────────────────────────────────────────────────────────┤
│  ├─[Buscar...────────────────] [Tipo────────] [Dept─]     │
│  ├───────────────────────────────────────────────────────│
│  │ Nome         │ CPF         │ Tipo     │ Criado Por  │ Validade │
│  ├────────────┼────────────┼─────────┼───────────┼─────────┤
│  │ João Silva │ 123456789 │ Aluno   │ joão/DEPTO_1│ 30/04   │
│  │ Maria     │ 987654321 │ Professor│ maria/DEPTO_2│ 15/05   │
│  │ José     │ 456123789 │ Visitante│ joão/DEPTO_1│ Expira  │
│  └──────────────────────────────────────────────────────┘
│  < Página 1 de 10 > [1] [2] [3] ...               │
└───────────────────────────────────────────────────────┘
```

---

## 7. Pendências e Prioridades

### 7.1 Pendências Atuais

| # | Pendência | Módulo | Prioridade |
|---|----------|--------|-----------|
| P01 | Adicionar `created_by` em visitor_vouchers | Vouchers | Alta |
| P02 | Popular activity_logs nos controllers | Rastreabilidade | Alta |
| P03 | Criar DashboardController | Dashboard | Alta |
| P04 | Implementar métricas do Dashboard | Dashboard | Alta |
| P05 | Exibir creator + dept nas listagens | Rastreabilidade | Alta |
| P06 | Adicionar filtros de expiração | Vouchers | Média |
| P07 | Importação CSV/XLSX de visitantes | Importação | Alta |
| P08 | Validação de CPF matemático | Importação | Alta |
| P09 | Feedback de erros na importação | Importação | Alta |
| P10 | Processamento em background | Importação | Alta |
| P11 | Auto-refresh em listagens | UI | Alta |
| P12 | Queue worker Docker | Infraestrutura | Alta |
| P13 | Bug: success_count duplicado na importação | Importação | Alta |

| # | Melhoria | Módulo |
|---|----------|--------|
| B01 | Enviar link para redefinir senha | Visitante |
| B02 | Notificações por email | Sistema |
| B03 | Relatórios PDF/Excel | Admin |
| B04 | Auditoria completa | Admin |

---

## 8. Glossário

| Termo | Definição |
|-------|-----------|
| Voucher | Credenciais de acesso (login + senha) temporárias |
| expires_at | Data de validade do voucher |
| Visitor | Cadastro do visitante no sistema |
| VisitorType | Tipo de visitante (aluno, professor, etc) |
| Creator | Usuário que criou o visitante |
| Department | Departamento do criador |

---

*Documento criado em: 2026-04-29*
*Versão: 1.0*