# Manual do Usuário COGETI (Administrador) — Net-GP

## 1. Sobre o Net-GP

O **Net-GP** é o sistema de gerenciamento de visitantes e vouchers temporários de
acesso à rede corporativa da UTFPR-GP. Ele cria automaticamente usuários
temporários no Active Directory (Samba), envia as credenciais por e-mail ao
visitante e remove o acesso automaticamente após a data de expiração.

Este manual descreve o funcionamento da plataforma **para usuários do grupo
COGETI**, que recebem o perfil de **Administrador (admin)** com acesso
irrestrito a todos os módulos.

---

## 2. Onde acessar

- **Endereços (domínios configurados):**
  `https://net.gp.utfpr.edu.br` e `https://net-gp.gp.utfpr.edu.br` (ambos aceitos)
- Acesso exclusivo pela rede da UTFPR (via FortiGate).
- O site é HTTPS — navegador atualizado (Chrome/Edge/Firefox) recomendado.

---

## 3. Quem pode acessar

| Perfil | Grupo no AD | O que pode ver |
|--------|-------------|----------------|
| **Administrador (COGETI)** | `COGETI` | Todos os módulos e dados de todos os departamentos |
| Operador | demais grupos | Somente dados do próprio departamento |

O papel é atribuído **automaticamente** no login, com base no grupo do usuário
no Active Directory. Usuários do grupo `COGETI` entram como **admin**.

---

## 4. Login

1. Acesse `https://net.gp.utfpr.edu.br` ou `https://net-gp.gp.utfpr.edu.br`.
2. Preencha **usuário institucional** e **senha** (credenciais do domínio).
3. Clique em **Entrar**.

Detalhes:

- Se o e-mail não foi confirmado, o sistema solicita a verificação antes do
  primeiro uso.
- O mapeamento de departamento e perfil é feito pelo AD a cada login.

---

## 5. Visão geral dos módulos

Como admin, o menu lateral da plataforma exibe:

| Módulo | Menu | Para que serve |
|--------|------|----------------|
| Dashboard | Dashboard | Métricas gerais do sistema |
| Visitantes | Visitantes | Cadastro e controle de visitantes |
| Vouchers | Vouchers | Credenciais temporárias de rede |
| Importações | Importações | Importação em lote de visitantes |
| Usuários | Usuários | Gestão de usuários do sistema |
| Departamentos | Departamentos | Cadastro de departamentos |
| Tipo de Visitante | Tipo de Visitante | Tipos/categorias de visitante |
| Atividades | Atividades | Auditoria das ações no sistema |

> **Operadores** não enxergam `Usuários`, `Departamentos`, `Tipo de Visitante`
> nem `Atividades`.

---

## 6. Dashboard

Resumo executivo da plataforma, sempre filtrado por departamento quando
necessário (o admin vê tudo):

- **Total de visitantes** e **total de vouchers** registrados.
- **Criados no mês** atual.
- **Visitantes expirados** nos últimos 7 dias.
- **Estatísticas de importação**: lotes, linhas importadas, sucessos, erros e
  pulados.
- **Gráfico de visitantes por departamento**.
- **Visitantes por mês** (últimos 12 meses).
- **Próximos a expirar** (até 8 dias).
- **Já expirados** (últimos 7 dias).
- **Atividades recentes** e **importações recentes**.

---

## 7. Módulo de Visitantes

A base do sistema: todos os acessos temporários são vinculados a um visitante.

### 7.1 Listagem
- Busca por **nome, CPF ou e-mail** (busca automática enquanto digita).
- Filtros por **departamento** e **tipo de visitante**.
- Ordenação por coluna (nome, criação).
- Quando há visitantes a expirar em até 7 dias, a página **atualiza
  automaticamente** a cada 5 segundos.
- O admin vê as listas de **todos os departamentos**.

### 7.2 Cadastrar visitante
1. Clique em **Criar Visitante** (ou o botão de criação na tela de visitantes).
2. Preencha:
   - **Nome** (obrigatório)
   - **CPF** (obrigatório — o **login** do voucher é gerado a partir do CPF,
     somente números)
   - **Telefone**
   - **E-mail** (destinatário das credenciais)
   - **Tipo** (ex.: aluno, professor, evento)
   - **Observação** (motivo/evento, opcional)
   - **Expira em** (data-limite do acesso — não pode ser menor que hoje)
3. Clique em **Salvar**.

**O que acontece automaticamente ao salvar:**
- O sistema gera uma **senha aleatória** e o login (= CPF com dígitos).
- **Cria o usuário temporário no Samba/AD**.
- **Envia e-mail** ao visitante com login e senha.
- Registra a ação na auditoria (autor, data).

### 7.3 Ações por visitante
Na listagem ou na tela do visitante:

- **Gerar nova senha** — regera a senha, atualiza no Samba e (re)envia o
  e-mail automaticamente.
- **Reenviar e-mail** — envia novamente as credenciais cadastradas ao
  visitante.
- **Editar** — altera os dados cadastrais e a validade.
- **Excluir** — remove o visitante, apaga o voucher e **retira o usuário do
  Samba** caso o acesso esteja ativo.

> **Importante**: todo acesso temporário é removido automaticamente após o
> `expires_at` (cron diário). Não é necessário excluir manualmente, exceto
> quando o acesso deve ser cortado antes da validade.

---

## 8. Módulo de Vouchers

Cada visitante ativo possui um **voucher** com as credenciais de rede:

| Campo | Descrição |
|-------|-----------|
| Login | CPF do visitante (somente números) |
| Senha | Gerada automaticamente pelo sistema |
| Validade | Data de expiração (`expires_at`) |
| Origem | Manual (criação individual) ou auto-gerado (importação em lote) |

Funcionalidades:
- **Listagem** com busca por **login**, **nome** ou **CPF**.
- **Filtros** por departamento, tipo de visitante e criador.
- **Ordenação** por proximidade de expiração (mais próximos/mais distantes) e
  por data de criação.
- **Indicador visual de expirado** — vouchers vencidos são destacados.
- **Reenviar vouchers** — reenvia o e-mail de credenciais pelo ícone de ação.
- Vouchers expirados podem ser excluídos em lote.

---

## 9. Módulo de Importações

Importação de visitantes **em lote** a partir de arquivos **CSV, XLSX ou XLS**.

### 9.1 Como importar
1. Acesse **Visitantes → Importar** (ou `Importações → Importar`).
2. Baixe o **Modelo XLSX** e preencha (há também um botão para baixar o
   modelo dentro da própria tela de importação).
3. Formato do arquivo:
   | Coluna | Obrigatório | Exemplo |
   |--------|-------------|---------|
   | `nome` | Sim | João Silva |
   | `cpf` | Sim | 12345678901 |
   | `email` | Sim | joao@email.com |
   | `telefone` | Não | 41999999999 |
   | `motivo` | Não | Palestra |
4. Defina os **padrões**: tipo de visitante, data de validade e motivo
   (aplicados às linhas que não informarem).
5. Envie o arquivo (arrastar/colar ou selecionar) e clique em
   **Importar Visitantes**.

### 9.2 Validações automáticas
- CPF **matematicamente válido** e **único** no sistema.
- E-mail **único** no sistema.
- Tipo mapeado automaticamente.
- O processamento roda **em background** (fila), permitindo continuar o uso.

### 9.3 Acompanhamento
A tela **Importações** lista os lotes com: arquivo, linhas, sucessos, erros,
status e responsável.

No **detalhe do lote**:
- Visitantes importados (com status de e-mail enviado).
- **Erros por linha** com o motivo.
- Ações sobre erros:
  - **Editar/Corrigir** — ajusta os dados da linha e tenta novamente.
  - **Pular (skip)** — ignora a linha, marcada como pulada.
  - **Remover** — descarta o erro.
- Quando todos os erros são resolvidos, o lote é marcado como **concluído**.
- Botão **Reenviar e-mail** por visitante (ícone de envelope).

### 9.4 Excluir lote
Exclui todos os visitantes do lote, apaga os vouchers e **remove os usuários
do Samba**.

---

## 10. Gestão administrativa (exclusivo COGETI)

### 10.1 Usuários
- Lista de usuários do sistema com busca por nome/e-mail/usuário.
- Filtro por departamento.
- **Editar usuário** para ajustar o papel/perfil e dados.

### 10.2 Departamentos
- Cadastro completo de departamentos (listar, criar, editar, excluir).
- Os departamentos alimentam o mapeamento de perfil do AD e os filtros de
  dados (cada operador enxerga apenas o próprio).

### 10.3 Tipo de Visitante
- Cadastro das categorias de visitante (listar, criar, editar, excluir).
- Usado no cadastro individual e na importação em lote.

### 10.4 Atividades
- **Auditoria** de todas as ações realizadas na plataforma: quem fez o quê,
  quando, com IP e navegador.
- Permite busca/consulta por ação, usuário e data.
- Sempre exibe ações de **todos os departamentos** para o admin.

---

## 11. Dashboard de auditoria e indicadores

Em **Atividades** é possível rastrear a rastreabilidade de cada acesso criado
(autor, data, origem), dando conformidade às políticas de segurança de rede.

Use os indicadores do dashboard para acompanhar:

- Vazão de acessos (criados mês a mês).
- Acessos prestes a expirar (planejamento de renovação).
- Erros em importações (qualidade dos arquivos enviados).

---

## 12. Configurações pessoais

Ícone do usuário (canto inferior do menu) → **Configurações**:

- **Perfil** — editar nome, e-mail e informações da conta.
- **Senha** — trocar a senha de acesso (o sistema envia confirmação por
  e-mail).
- **Aparência** — modo claro, escuro ou automático.

---

## 13. Boas práticas

- Sempre confira o **e-mail** do visitante: é o único canal de entrega das
  credenciais.
- Use **data de expiração** realista — o acesso é cortado automaticamente.
- Em importações, baixe sempre o **modelo oficial** para evitar divergências
  de colunas.
- Monitore o **dashboard** e as **importações** para detectar lotes com muitos
  erros.
- Em caso de acesso indevido, **exclua o visitante** — o usuário do Samba é
  removido na hora.