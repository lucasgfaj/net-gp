# Manual do Usuário Operador — Net-GP

## 1. Sobre o Net-GP

O **Net-GP** é o sistema de gerenciamento de visitantes e vouchers temporários
de acesso à rede corporativa da UTFPR-GP. Ele cria automaticamente usuários
temporários no Active Directory (Samba), envia as credenciais por e-mail ao
visitante e remove o acesso automaticamente após a data de expiração.

Este manual descreve o funcionamento da plataforma **para usuários operadores**
(servidores dos demais departamentos), que acessam somente os dados do próprio
departamento.

---

## 2. Onde acessar

- **Endereços (domínios configurados):**
  `https://net.gp.utfpr.edu.br` e `https://net-gp.gp.utfpr.edu.br` (ambos aceitos)
- Acesso exclusivo pela rede da UTFPR.
- Use um navegador atualizado (Chrome/Edge/Firefox).

---

## 3. Quem pode acessar

| Perfil | Quem recebe | O que pode ver |
|--------|-------------|----------------|
| **Operador** | Usuários dos demais departamentos | Apenas dados do **seu departamento** |
| Administrador (COGETI) | Grupo `COGETI` no AD | Todos os dados de todos os departamentos |

Como operador, você **não vê e não acessa**: `Usuários`, `Departamentos`,
`Tipo de Visitante` e `Atividades`. Essas telas são exclusivas do COGETI.

---

## 4. Login

1. Acesse `https://net.gp.utfpr.edu.br` ou `https://net-gp.gp.utfpr.edu.br`.
2. Preencha **usuário institucional** e **senha** (credenciais do domínio).
3. Clique em **Entrar**.

Detalhes:

- O sistema identifica automaticamente seu departamento e restringe as listas
  a ele.
- Se o e-mail não foi confirmado, será solicitada a verificação antes do
  primeiro uso.

### 4.1 Regra de negócio: como o sistema define o seu departamento

Para quem usa o sistema com base no seu setor (servidor ou estagiário de um
departamento), o departamento **não é escolhido pelo usuário**. Ele é
identificado **automaticamente** pelo sistema, no momento do login, da seguinte
forma:

1. Você informa o **usuário institucional** (credenciais do domínio) e a senha.
2. O sistema autentica no **Active Directory (AD)** com essas credenciais e
   lê os **grupos** aos quais você pertence.
3. O sistema compara o **nome dos seus grupos do AD** com os **departamentos
   cadastrados no Net-GP (UTFPR-GP)**. O nome deve ser igual ao do
   departamento no sistema (ex.: quem pertence ao grupo `ASCOM` no AD é
   vinculado ao departamento `ASCOM` no Net-GP).
4. **Se o seu grupo corresponde a um departamento existente no Net-GP**, você
   é **logado automaticamente nesse departamento** e todo o sistema passa a
   exibir somente os dados desse departamento (visitantes, vouchers,
   importações e dashboard).
5. **Se nenhum dos seus grupos corresponder a um departamento cadastrado**, o
   acesso é **negado** e você não consegue entrar.

> **Resumo da regra:** para servidores e estagiários, o departamento **precisa
> estar cadastrado** no sistema para que o usuário do setor consiga acessar. Ao
> logar, o vínculo é feito automaticamente pelo grupo do AD — não existe
> seleção manual de departamento.

---

## 5. Seu menu

| Módulo | Menu | Para que serve |
|--------|------|----------------|
| Dashboard | Dashboard | Métricas do seu departamento |
| Visitantes | Visitantes | Cadastro e controle dos visitantes do seu setor |
| Vouchers | Vouchers | Credenciais temporárias de rede |
| Importações | Importações | Importação em lote de visitantes |

---

## 6. Dashboard

Visão geral **filtrada para o seu departamento**:

- Total de visitantes e vouchers do setor.
- Criados no mês atual.
- Visitantes expirados nos últimos 7 dias.
- Estatísticas de importação (lotes, sucessos, erros).
- Visitantes por mês (últimos 12 meses).
- Próximos a expirar e já expirados no seu departamento.
- Atividades recentes e importações recentes do seu setor.

> Os números sempre refletem **somente o seu departamento**.

---

## 7. Fluxo de trabalho do operador

### 7.1 Cadastrar um visitante (acesso individual)

1. No menu, acesse **Visitantes** → **Criar Visitante**.
2. Preencha:
   - **Nome** (obrigatório)
   - **CPF** (obrigatório — o **login** do acesso é gerado a partir do CPF)
   - **Telefone**
   - **E-mail** (para onde vão as credenciais)
   - **Tipo** (categoria do visitante)
   - **Observação** (motivo/evento, opcional)
   - **Expira em** (data-limite — não pode ser menor que hoje)
3. Clique em **Salvar**.

**Automaticamente:**
- O sistema gera login (= CPF, só números) e uma **senha aleatória**.
- **Cria o usuário temporário na rede (Samba/AD)**.
- **Envia o e-mail** ao visitante com login e senha.
- Registra quem criou a ação no histórico.

### 7.2 Gerenciar visitantes

Na listagem, você pode:

- **Buscar** por nome, CPF ou e-mail.
- **Filtrar** por tipo de visitante.
- **Gerar nova senha** — regera a senha, atualiza na rede e envia novo e-mail.
- **Reenviar e-mail** — envia novamente as credenciais ao visitante (útil se o
  visitante não recebeu o e-mail).
- **Editar** — altera dados e validade.
- **Excluir** — remove o visitante e o voucher; se o acesso estiver ativo, o
  usuário é **removido da rede na hora**.

> Quando há visitantes a expirar em até 7 dias, a página **atualiza sozinha** a
> cada 5 segundos.

### 7.3 Vouchers

Na tela **Vouchers** (somente do seu departamento):

- **Busca** por login, nome ou CPF.
- **Filtros** por tipo de visitante e criador.
- **Ordenação** por proximidade de expiração ou data de criação.
- Vouchers **expirados** aparecem destacados.
- Use o botão de ação para **reenviar** o e-mail de credenciais.

### 7.4 Importação em lote

Para cadastrar muitos visitantes de uma vez (eventos, palestras, turmas):

1. Acesse **Visitantes → Importar**.
2. Baixe o **Modelo XLSX** e preencha:
   | Coluna | Obrigatório | Exemplo |
   |--------|-------------|---------|
   | `nome` | Sim | João Silva |
   | `cpf` | Sim | 12345678901 |
   | `email` | Sim | joao@email.com |
   | `telefone` | Não | 41999999999 |
   | `motivo` | Não | Palestra |
3. Defina **tipo**, **validade** e **motivo** padrão para o arquivo.
4. Envie o arquivo (arrastar ou selecionar) e clique em **Importar Visitantes**.

O sistema **valida** CPF (válido e único) e e-mail (único) e processa em
**background**. Você pode fechar a tela e acompanhar depois.

### 7.5 Acompanhar importações

A tela **Importações** mostra os lotes **do seu departamento** com status,
sucessos e erros.

No detalhe do lote:
- Lista dos visitantes importados.
- **Erros por linha** com o motivo (ex.: CPF inválido, e-mail duplicado).
- Ações para cada erro:
  - **Corrigir** — ajusta os dados e tenta de novo.
  - **Pular** — ignora a linha.
  - **Remover** — descarta o erro.
- Assim que todos os erros são resolvidos, o lote é marcado como **concluído**.
- Você também pode **reenviar o e-mail** de credenciais de um visitante
  importado (ícone de envelope).

---

## 8. Expiração automática

Todo acesso tem data de expiração. Ao vencer, o usuário é **removido da rede
automaticamente** (cron diário). Você não precisa fazer nada.

Se quiser cortar o acesso **antes** do prazo, exclua o visitante ou edite a
validade.

---

## 9. Configurações pessoais

Ícone do usuário (canto inferior do menu) → **Configurações**:

- **Perfil** — editar nome, e-mail e informações da conta.
- **Senha** — trocar sua senha de acesso.
- **Aparência** — modo claro, escuro ou automático.

---

## 10. Boas práticas

- Confira sempre o **e-mail** do visitante — é o único canal de envio das
  credenciais.
- Use **validade realista**; o sistema corta o acesso sozinho ao expirar.
- Em importações, use o **modelo oficial** e confira os erros depois.
- Em caso de dúvida ou acesso indevido, **exclua o visitante** para remover o
  acesso da rede imediatamente.
- Procure o COGETI para problemas de acesso ao sistema ou configurações
  administrativas (tipos de visitante, departamentos, auditoria).