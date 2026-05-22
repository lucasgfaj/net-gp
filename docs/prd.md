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

### 1.4 Problemas que resolve e Benefícios
- **Gestão simplificada**: Gerencia o acesso de visitantes à rede WiFi corporativa e login em máquinas.
- **Integração com Samba**: Benefício direto de criar um usuário temporário que, durante o limite de X dias impostos, permite ao visitante logar nas máquinas físicas e logar na rede normalmente.
- **Automatização**: Os dados de login e senha gerados são enviados de forma direta por email ao visitante.
- **Exclusão automática**: Controle de acesso temporário com expiração programada; após o limite, o usuário é removido do Samba.
- **Rastreabilidade e Conformidade**: Controle completo de quem criou cada acesso para aderência com políticas de segurança.

---

## 2. Requisitos Funcionais

### 2.1 Tecnologias

| Tecnologia       | Versão | Descrição                  |
| ---------------- | ------ | -------------------------- |
| PHP              | 8.2+   | Linguagem backend          |
| Laravel          | 12.x   | Framework PHP              |
| React            | 19.x   | Framework frontend         |
| Inertia          | 2.x    | Adapter React para Laravel |
| Tailwind CSS     | 4.x    | Framework CSS              |
| PostgreSQL       | 14.x+  | Banco de dados             |
| Docker           | Latest | Containerização            |
| LDAP/AD          | -      | Autenticação               |

### 2.2 Módulo de Autenticação

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF01 | Login via LDAP | Autenticar com credenciais do AD | Alta |
| RF02 | Logout | Encerrar sessão | Alta |
| RF03 | Mapeamento automático | Extrair department e role do AD | Alta |
| RF04 | Acesso negado | Bloquear usuários sem grupo mapeado | Alta |

**Fluxo de Login:**
```
1. Usuário acessa /
2. Fornece username e password do domínio (LDAP)
3. Sistema valida as credenciais no AD
4. Sistema mapeia o grupo do usuário para o respectivo departamento no sistema (Ex: ASCOM -> ASCOM).
5. O sistema verifica as permissões: se o usuário fizer parte do grupo COGETI, lhe é atribuído automaticamente o perfil estrito de "admin" (acesso irrestrito); caso contrário, recebe função de "operador" (restrito ao próprio departamento).
6. Usuário é logado automaticamente, assumindo as restrições tanto da role definida acima quanto do seu respectivo departamento.
```

### 2.2 Módulo de Visitantes

| #    | Requisito              | Descrição                                                                                  | Prioridade |
| ---- | ---------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| RF05 | Listar visitantes      | Ver todos os visitantes (filtrado por dept se for Operador)                                | Alta       |
| RF06 | Criar visitante        | Cadastrar novo visitante com voucher                                                       | Alta       |
| RF07 | Editar visitante       | Alterar dados do visitante                                                                 | Alta       |
| RF08 | Excluir visitante      | Remover visitante, apagar seu voucher e **excluí-lo do Samba** caso o voucher esteja ativo | Alta       |
| RF09 | Gerar nova senha       | Criar nova senha para o voucher e atualizá-la                                              | Média      |
| RF10 | Filtrar por department | Filtrar visitantes por departamento                                                        | Alta       |
| RF11 | Buscar visitante       | Buscar por nome, CPF ou email                                                              | Alta       |

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

| #    | Requisito             | Descrição                                                           | Prioridade |
| ---- | --------------------- | ------------------------------------------------------------------- | ---------- |
| RF12 | Reenviar voucher      | Função de reenviar email de credenciais pertencente a esta tela     | Média      |
| RF13 | Listar vouchers       | Ver todos os vouchers                                               | Alta       |
| RF14 | Filtrar vouchers      | Por department, tipo, criador                                       | Alta       |
| RF15 | Ordenar por expiração | Mais próximos a expirar                                             | Média      |
| RF16 | Indicador de expirado | Mostrar visualmente os vouchers expirados                           | Alta       |
| RF17 | Excluir expirados     | Sistema exclui os vouchers que já estão com a data de expiração vencida | Alta       |

### 2.4 Módulo de Departamentos

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF18 | Listar departamentos | Ver todos os departamentos | Alta |
| RF19 | Criar departamento | Cadastrar novo departamento | Admin |
| RF20 | Editar departamento | Alterar nome do departamento | Admin |
| RF21 | Excluir departamento | Remover departamento | Admin |

### 2.5 Módulo de Tipos de Visitante

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF22 | Listar tipos | Ver tipos de visitante | Alta |
| RF23 | Criar tipo | Cadastrar novo tipo | Admin |
| RF24 | Editar tipo | Alterar tipo | Admin |
| RF25 | Excluir tipo | Remover tipo | Admin |

### 2.6 Módulo de Usuários (Admin)

| # | Requisito | Descrição | Prioridade |
|---|----------|-----------|------------|
| RF26 | Listar usuários | Ver todos os usuários do sistema | Admin |
| RF27 | Editar usuário | Alterar role de usuário | Admin |
| RF28 | Filtrar por department | Filtrar usuários | Admin |

### 2.7 Módulo de Dashboard

| #    | Requisito             | Descrição                                                                          | Prioridade |
| ---- | --------------------- | ---------------------------------------------------------------------------------- | ---------- |
| RF29 | Informações e Totais  | Mostrar total de visitantes (mensais e geral) e total de visitantes já expirados   | Alta       |
| RF30 | Vouchers Ativos       | Card focado em demonstrar a quantidade atual de vouchers válidos e ativos          | Alta       |
| RF31 | Visitantes por dept   | Card/gráfico apontando a divisão total de visitantes filtrados por departamento    | Alta       |
| RF32 | Visitantes por mês    | Gráfico da evolução de visitantes no mês corrente e histórico mensal               | Alta       |
| RF33 | Próximos expirar      | Listagem localizando alertas dos próximos vouchers a expirar dentro de um prazo    | Alta       |
| RF34 | Visitantes expirados  | Consulta das últimas identidades que expiraram e perderam os acessos               | Alta       |
| RF35 | Últimas Atividades    | Resumo (timeline) das ultimas 5 alterações efetuadas em sistema (logs unificados)  | Média      |
| RF36 | Histórico de Lotes    | Log rápido mostrando estatísticas de sucesso/falha das últimas importações (lotes) | Média      |

### 2.8 Módulo de Rastreabilidade e Auditoria (Activity Logs)

| #    | Requisito                 | Descrição                                                                            | Prioridade |
| ---- | ------------------------- | ------------------------------------------------------------------------------------ | ---------- |
| RF37 | Quem executou a ação      | Capturar nome, email, nível de acesso (role) e departamento do autor                 | Alta       |
| RF38 | Rastreio de Rede/Máquina  | Gravar sempre o **IP** de origem e o **User Agent** (Navegador/Sistema do usuário)   | Alta       |
| RF39 | Quando executou           | Exibir o `created_at` (carimbo de data/hora oficial) da ação                         | Alta       |
| RF40 | Log transversal completo  | O sistema deve registrar ações de criação, edição, deleção e disparos em todo o app  | Alta       |

**Eventos do ActivityLog:**
```
O ActivityLogs capta transversalmente todo o sistema. Ele registra e salva as métricas de quem fez, onde e qual o IP nas seguintes ações:
- Visitantes: Criado, Atualizado, Deletado, Nova Senha Gerada, Senha Reenviada e Visitante Expirado
- Autenticação: Login no sistema
- Departamentos: Departamento criado, Departamento deletado
- Tipos de Visitantes: Tipo criado, Tipo deletado
```

### 2.9 Sistema de Expiração Automática

| #    | Requisito             | Descrição                                                                               | Prioridade |
| ---- | --------------------- | --------------------------------------------------------------------------------------- | ---------- |
| RF41 | Verificação de Prazo  | Comando (Cron) executado varrendo o BD por registros cuja data/hora `expires_at` venceu | Alta       |
| RF42 | Remoção no Samba      | Executar deletação do usuário temporário diretamente no servidor AD/Samba via serviço   | Alta       |
| RF43 | Exclusão do Voucher   | Apagar permanentemente a credencial (`voucher`) do Banco de Dados                       | Alta       |
| RF44 | Auditoria de Baixa    | Registrar evento no `activity_log` e log do sistema assegurando a exclusão automática   | Alta       |
| RF45 | Redundância de Erros  | Prevenir falhas em lote; se o Samba recusar um usuário, ele pula, registra e segue      | Alta       |

**Como funciona a Rotina de Expiração (`visitors:disable-expired`):**
```
1. O cron job (Scheduler) dispara o comando que faz uma query: "Visitantes com expires_at <= data atual que ainda possuem Voucher".
2. O sistema entra num laço (loop) em todos os resultados e abre uma Transação de Banco de Dados.
3. Via Serviço do Samba, o sistema deleta remotamente o usuário cujo login é o CPF numérico.
4. Em seguida, deleta-se no banco o vínculo daquele Voucher.
5. Injeta-se no Histórico o evento de `visitor_expired`.
6. Enfim, finaliza a alteração ('Commit').
7. Se durante essa limpeza houver um timeout ou rejeição de conexão pro Samba, a transação daquele usuário falha ('Rollback'), grava-se o erro específico e o script lida com o próximo da fila. O sistema NÃO para por causa de um voucher problemático.
```

---

## 3. Requisitos Não-Funcionais

### 3.1 Segurança da Informação

| #    | Requisito              | Descrição                                                                                                                |
| ---- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| RNF01 | Omissão de Credencial | Em momento algum o sistema deve exibir senhas de acesso do banco de dados na interface.                                  |
| RNF02 | Criptografia SSH       | Obrigatório o uso do módulo `phpseclib3` montando a conexão do Samba exclusivamente consumindo *Arquivos de Chave Privada*.|
| RNF03 | Prevenção de Ataques   | Validações estritas gerenciadas pelo Middleware do Laravel (Proteção contra CSRF, XSS e SQL Injection incorporada).      |
| RNF04 | Rate Limiting          | Bloqueio automático por excesso de requisições maliciosas injetado nas rotas de Autenticação (`login` e Fortify).        |

### 3.2 Performance e Estrutura de Dados

| #    | Requisito              | Descrição                                                                                                              |
| ---- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| RNF05 | Paginação Eficiente    | Restrição pesada em listagens (Paginators nativos do Laravel enviando 10-15 registros pro Client React por request).   |
| RNF06 | Escalonamento          | Permitir caching de framework em produções e optimização global para rotas e visualizações (`artisan optimize`).       |
| RNF07 | Integridade no SGDB    | Prevenir duplicação absoluta construindo, via Migration, um atributo nativo `.unique()` no Índice da coluna `cpf`.     |

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

### 4.2 Permissões e Visibilidade

A visibilidade dos dados e acessos às telas é controlada diretamente pelo departamento do usuário logado (herdado do LDAP):

- **Departamento COGETI (Acesso Geral / Admin)**
  - **Visibilidade:** Podem acessar, visualizar e gerenciar todos os visitantes de todos os departamentos.
  - **Acesso às Telas:** Possuem acesso a todos os módulos, incluindo as configurações: **Dashboard, Visitantes, Importações, Vouchers, Usuários, Tipos de Visitante, Departamentos** e **Atividades** (Logs).

- **Outros Departamentos (Ex: ASCOM, etc / Operadores)**
  - **Visibilidade:** Acesso restrito! Esses usuários podem ver *apenas* os visitantes cujo criador pertence ao seu próprio departamento.
  - **Acesso às Telas:** Menu simplificado focado na rotina: **Dashboard, Visitantes, Importações** e **Vouchers**. O resto dos recursos estruturais (Usuários, Departamentos, Tipos, Atividades) ficam ocultos para outras áreas que não a COGETI.

| Perfil / Departamento | Visualiza | Telas de Configuração (Usuários/Dept/Tipos/Acoes) | Permissões (Editar/Deletar) |
|-----------------------|-----------|---------------------------------------------------|----------------------------|
| COGETI | Todos do sistema | Acesso Total (Sim) | Todos (Irrestrito) |
| Demais Departamentos | Apenas visitantes do seu departamento | Sem acesso (Oculto) | Apenas no que ele mesmo criou |

### 4.3 Expiração

| Regra | Descrição |
|-------|-----------|
| RN07 | Visitante expira às 00:00 da data expires_at |
| RN08 | Usuário Samba removido junto |
| RN09 | Voucher removido da tabela |

### 4.4 Importação em Lote

| Regra | Descrição |
|-------|-----------|
| RN10 | Importação processada em background (queue/jobs) disparando jobs em fila do Laravel. |
| RN11 | CPF validado matematicamente (Cálculo estrutural de dígito verificador). |
| RN12 | CPF único em todo o sistema. |
| RN13 | Email único no sistema. |
| RN14 | Cada visitante do lote cria voucher e usuário no Samba. |
| RN15 | Email enviado individualmente com controle de Rate (Delay nativo de 2 segundos entre envios). |
| RN16 | Erros de importação são armazenados contendo número da linha e a mensagem da Exception. |
| RN17 | Campos vazios levantam `VisitorException`, e caso tudo ocorra bem, é somado ao `success_count`. |
| RN18 | `total_rows` faz apuração total da quantidade de registros disparados para fila. |

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
1. Cron executa a limpeza de expirados diária
2. Sistema cria transação e busca Visitantes com data vencida
3. Sistema acessa arquivo restrito SSH (Samba)
4. Deleta acesso à máquina remotamente e remove voucher do BD
5. Salva a exclusão no Log transversal
Pós-condições: Acesso interrompido preventivamente com segurança
```

### UC04 - Importação em Lote de Visitantes
```
Ator: Operador ou Admin
Pré-condições: Usuário estar logado num departamento válido
Fluxo principal:
1. Usuário acessa Importações e envia planilha base de Visitantes
2. Sistema varre regras locais (CPF/Email válidos e não duplicados)
3. Casos em branco ou formatos inválidos caem em Error Log
4. Sistema aprova os corretos e enfileira (Queue) os processamentos
5. Sistema atrasa o processo (+2s cada) gerando Vouchers, acessos SSH no Samba e emitindo Emails sucessivamente
Pós-condições: Lote criado no banco sem gargalos de rede
```

### UC05 - Exclusão Manual de Visitante (e do Samba)
```
Ator: Operador (criador do visitante) ou Admin (COGETI)
Pré-condições: Visitante existir na listagem
Fluxo principal:
1. Operador clica em deletar Visitante
2. Sistema confere se Voucher daquele visitante está ativo/existente
3. Acessa o SSH e efetua o bloqueio ativo no AD imediatamente
4. Apaga registro local de voucher e expurga visitante
Pós-condições: Visitante errôneo excluído sem sobras computacionais
```

### UC06 - Reenvio de Gerenciamento de Senha
```
Ator: Operador ou Admin
Pré-condições: Visitante existir com data válida e voucher ativo
Fluxo principal:
1. Operador clica para "Gerar Nova Senha" ou "Reenviar Senha"
2. Sistema confere integridade de limite de tempo (não vencido)
3. Sobrepõe senha via Samba (se gerar nova) via comando `setpassword`
4. Dispara e-mail contendo pacote selado e atualizado de login
Pós-condições: Soluções isoladas garantem estabilidade do serviço
```

---

## 6. Evolução e Melhorias Futuras (Roadmap)

Como o sistema já se encontra na sua primeira versão pronta ("As-Built"), as pendências ligadas a infraestrutura base (Dashboard, Logs, Importações e Jobs) já foram sanadas. Abaixo constam apenas as melhorias arquitetadas para versões vindouras:

| #    | Melhoria                         | Módulo    | Visão Macro do Impacto                                 |
| ---- | -------------------------------- | --------- | ------------------------------------------------------ |
| B01  | Recuperação de Senha Segura      | Visitante | Enviar link de Hash para redefinir senha externa       |
| B02  | Notificações pró-ativas (E-mail) | Sistema   | Criar alertas aos gestores quando o Vouchers expiram   |
| B03  | Relatórios e Exports PDF/Excel   | Admin     | Permitir exportação tangível dos filtros do Dashboard  |
| B04  | Módulo Rigoroso de Auditoria     | Admin     | Painel na interface para a COGETI analisar rastros (IP)|
| B05  | Auto-Connect Wi-Fi (Smart Link)  | Vouchers  | Incluir no e-mail um link mágico ou QR Code para que celulares efetuem login automático na rede sem digitar senha manualmente |

---

## 7. Glossário de Termos

| Termo | Definição Corporativa e Técnica |
|-------|-------------------------------|
| **Voucher** | Credenciais de acesso digital (login = CPF + senha em hash) temporárias injetadas na rede |
| **expires_at** | Ponto temporal letal da data de validade onde o usuário perderá o acesso ativo ao AD |
| **Visitor (Visitante)** | Indivíduo cadastrado no sistema requisitando vínculo; um visitante de fato não interage neste sistema, ele só recebe dados |
| **Visitor Type** | Categorização do visitante para estatísticas (ex: aluno, fornecedor, palestrante, professor) |
| **Creator** | Colaborador (Operador) interno autenticado no sistema que assume a tutela/responsabilidade pela confecção daquele visitante |
| **Department** | Setor do criador. É a base da Restrição de Visão: operadores só assistem aos dados inerentes aos seus departamentos |
| **COGETI (Admin)** | Equipe/Departamento master com status de *Role Admin* blindado, capaz de ver todo o sistema sem as amarras de "own-department" |
| **LDAP** | Protocolo corporativo base de diretório (Microsoft AD) utilizado pelo sistema no `/login` para autenticar a equipe automaticamente |
| **Samba / AD** | Servidor de rede onde efetivamente o Net-GP conecta via **SSH** na criação/expurgos ordenando entrada à máquina da pessoa e WiFi |
| **ActivityLog** | Livro Razão transacional. Uma tabela transversal que armazena IPs, Nomes e Eventos garantindo 100% de rastreabilidade (Audit Trail) |
| **Scheduler (Cron)** | Mecanismo passivo executando um loop diário à meia-noite (`disable-expired`) limpando credenciais no sistema com base no expires_at |
| **ImportBatch / Queue** | Estrutura de Lote. Referência ao processamento massivo via Excel repassando a lentidão limitadora e controlada para o Background Job do Laravel |

---

*Documento atualizado referenciando versão "As-Built".*