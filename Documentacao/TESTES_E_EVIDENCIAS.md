# Relatório de Testes e Evidências de Execução — GastroMatch

**Projeto:** Conexão e Experiência Gastronômica (GastroMatch)  
**Instituição:** SENAI Félix Guisard  
**Docente Avaliador:** Prof. Wesley Fioreze  
**Data:** Outubro de 2026  
**Status da Suíte:** 🟢 100% Aprovado (11/11 testes executados com sucesso)

---

## 1. Objetivo dos Testes

O objetivo deste documento é fornecer a comprovação e evidência de testes unitários e de integração aplicados à aplicação **GastroMatch**, validando que:
1. O backend responde adequadamente em todas as suas rotas essenciais.
2. O banco de dados PostgreSQL integrado via Prisma persiste e recupera dados reais.
3. O fluxo de autenticação e proteção de rotas com JWT funciona conforme os requisitos de segurança.
4. O fluxo principal da aplicação (descoberta de receitas, adição à sacola, criação de pedido e pagamento) opera de ponta a ponta sem falhas.

---

## 2. Ambiente de Execução dos Testes

| Componente | Especificação |
|---|---|
| **Sistema Operacional** | macOS (Apple Silicon arm64) |
| **Runtime** | Node.js v22.23.2 |
| **Gerenciador de Pacotes** | npm v10.9.8 |
| **Framework Web** | Express v5.1.0 |
| **Banco de Dados** | PostgreSQL 16 (porta 5432) |
| **ORM** | Prisma v6.19.3 |
| **Runner de Testes** | Node.js Test Runner Nativo (`node:test`, `node:assert/strict`) |

---

## 3. Matriz de Casos de Testes de Integração

| ID | Módulo / Rota | Método | Descrição do Cenário | Entrada | Resultado Esperado | Resultado Obtido | Status |
|---|---|:---:|---|---|---|---|:---:|
| **CT-01** | `/api/health` | `GET` | Verificação de integridade e liveness da API | Nenhuma | HTTP 200, `{ status: "ok", service: "GastroMatch API" }` | HTTP 200, status `ok` | 🟢 APROVADO |
| **CT-02** | `/api/auth/login` | `POST` | Login com credenciais válidas cadastradas no seed | Email e senha corretos | HTTP 200, JWT token e dados do usuário | HTTP 200, token assinado retornado | 🟢 APROVADO |
| **CT-03** | `/api/auth/login` | `POST` | Tentativa de login com senha incorreta | Email válido e senha inválida | HTTP 401 Unauthorized | HTTP 401, `"Email ou senha inválidos."` | 🟢 APROVADO |
| **CT-04** | `/api/auth/me` | `GET` | Recuperação do perfil autenticado via Bearer Token | Header `Authorization: Bearer <token>` | HTTP 200 com perfil do usuário | HTTP 200, dados do admin retornados | 🟢 APROVADO |
| **CT-05** | `/api/categories` | `GET` | Listagem de categorias da plataforma | Nenhuma | HTTP 200 com array de categorias | HTTP 200, 5 categorias recuperadas | 🟢 APROVADO |
| **CT-06** | `/api/recipes` | `GET` | Listagem do catálogo completo do PostgreSQL | Nenhuma | HTTP 200 com array de receitas, chef e ingredientes | HTTP 200, 6 receitas populadas retornadas | 🟢 APROVADO |
| **CT-07** | `/api/recipes?search=Carbonara` | `GET` | Busca e filtro de receitas por termo de busca | Query string `search=Carbonara` | HTTP 200 com resultados filtrados | HTTP 200, retornou `Pasta Carbonara Autêntica` | 🟢 APROVADO |
| **CT-08** | `/api/recipes/:id` | `GET` | Consulta a detalhes completos de uma receita | Param `id=1` | HTTP 200 com modo de preparo e lista de ingredientes | HTTP 200, receita detalhada com ingredientes | 🟢 APROVADO |
| **CT-09** | `/api/orders` | `POST` | Criação de pedido com método de pagamento PIX | Item com `recipeId: 1`, método `PIX` | HTTP 201 Created, status `PENDING`, código PIX e QR Code | HTTP 201, pedido criado e credenciais PIX geradas | 🟢 APROVADO |
| **CT-10** | `/api/orders/:id/confirm-payment` | `POST` | Confirmação de recebimento do pagamento do pedido | Param `id` do pedido criado | HTTP 200, transição de status para `PAID` | HTTP 200, status atualizado para `PAID` no PostgreSQL | 🟢 APROVADO |
| **CT-11** | `/api/recipes` | `POST` | Publicação de receita com Kit Físico à venda pelo Chef | Objeto da receita com `hasKit: true`, `kitPrice: 48.00` | HTTP 201 Created com dados da receita e kit | HTTP 201, receita persistida com kit e ingredientes | 🟢 APROVADO |
| **CT-12** | `/api/recipes/mine` | `GET` | Consulta do catálogo de receitas e kits do chef autenticado | Header `Authorization: Bearer <token_chef>` | HTTP 200 com array de receitas autorais do chef | HTTP 200, listagem de receitas próprias recuperada | 🟢 APROVADO |

---

## 4. Log Real de Execução Automatizada (`npm test`)

Comando executado:
```bash
npm test
```

Saída oficial do runner de testes:
```text
> gastromatch-backend@1.0.0 test
> node --test tests/**/*.test.js

▶ GastroMatch API - Suíte de Testes Automatizados
  ✔ 1. Health Check (/api/health) deve responder 200 OK e status 'ok' (40.858667ms)
  ✔ 2. Autenticação - Login com credenciais válidas (/api/auth/login) (261.889666ms)
  ✔ 3. Autenticação - Rejeitar senha incorreta (/api/auth/login) (202.484959ms)
  ✔ 4. Usuário Autenticado (/api/auth/me) usando Bearer Token (4.764167ms)
  ✔ 5. Categorias (/api/categories) deve listar categorias cadastradas (3.610666ms)
  ✔ 6. Receitas (/api/recipes) deve retornar catálogo populado no banco de dados (9.936583ms)
  ✔ 7. Busca de Receitas (/api/recipes?search=...) deve filtrar corretamente (6.293833ms)
  ✔ 8. Detalhes de Receita (/api/recipes/:id) (4.342875ms)
  ✔ 9. Pedidos - Criar Pedido com PIX (/api/orders) (9.372ms)
  ✔ 10. Pedidos - Confirmar Pagamento (/api/orders/:id/confirm-payment) (5.492792ms)
  ✔ 11. Chef - Publicar Receita com Kit Físico à Venda (/api/recipes) (211.895166ms)
  ✔ 12. Chef - Listar Minhas Receitas (/api/recipes/mine) (208.8815ms)
✔ GastroMatch API - Suíte de Testes Automatizados (971.186541ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1026.796458
```

---

## 5. Evidência do Fluxo Ponta a Ponta no Front-end & Back-end

### 5.1 Carregamento do Catálogo pelo Front-end
- O frontend React (`http://localhost:5173`) inicializa consumindo `GET /api/recipes`.
- O backend consulta o banco PostgreSQL via Prisma e retorna as receitas com relacionamentos (`category`, `chef`, `ingredients`, `_count`).
- A interface renderiza os cards com imagem, nome do chef autenticado, tempo, avaliação e preço formatado em Real (`R$`).

### 5.2 Adição à Sacola e Cálculo de Frete
- O usuário abre os detalhes da receita.
- Seleciona a opção de incluir o **Kit de Ingredientes** e digita o CEP de entrega.
- O sistema calcula a taxa de entrega estimada e consolida o valor total.
- O item é enviado para a sacola lateral (`CartDrawer`).

### 5.3 Checkout e Pagamento PIX
- O usuário abre a sacola e clica em **Avançar para Pagamento**.
- O front-end envia a requisição `POST /api/orders` contendo a lista de itens.
- O backend grava o registro na tabela `Order` e `OrderItem` vinculados ao usuário autenticado (ou cliente visitante).
- É gerado o código PIX padrão EMV (BR Code) e o QR Code oficial para pagamento.
- Ao clicar em **Já paguei**, a chamada `POST /api/orders/:id/confirm-payment` é acionada e o pedido no PostgreSQL é imediatamente atualizado para o status `PAID`.
