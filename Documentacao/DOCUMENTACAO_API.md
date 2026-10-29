# Documentação da API REST — GastroMatch

**Versão da API:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Formato de dados:** JSON (`Content-Type: application/json`)  
**Autenticação:** JWT Bearer Token (`Authorization: Bearer <token>`)

---

## 1. Visão Geral da Autenticação

As rotas protegidas da API GastroMatch exigem o envio de um token JWT válido através do header HTTP:
```http
Authorization: Bearer <SEU_TOKEN_JWT>
```

Se o token for omitido ou inválido, a API responderá com status `401 Unauthorized`.

---

## 2. Endpoints de Autenticação (`/api/auth`)

### 2.1 Cadastrar Novo Usuário
- **Método:** `POST`
- **Rota:** `/api/auth/register`
- **Acesso:** Público
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Yasmin Lobo",
    "email": "yasmin@email.com",
    "password": "senhaSegura123",
    "role": "USER"
  }
  ```
  *(O campo `role` é opcional e aceita `"USER"` ou `"CHEF"`. Default: `"USER"`)*

- **Respostas:**
  - `201 Created`:
    ```json
    {
      "message": "Usuário criado com sucesso.",
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "name": "Yasmin Lobo",
        "email": "yasmin@email.com",
        "role": "USER",
        "avatarUrl": null,
        "createdAt": "2026-10-14T22:00:00.000Z"
      }
    }
    ```
  - `400 Bad Request`: `{ "message": "Nome, email e senha são obrigatórios." }` ou `{ "message": "A senha deve ter pelo menos 6 caracteres." }`
  - `409 Conflict`: `{ "message": "Email já cadastrado." }`

---

### 2.2 Login de Usuário
- **Método:** `POST`
- **Rota:** `/api/auth/login`
- **Acesso:** Público
- **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "admin@gastromatch.com",
    "password": "123456"
  }
  ```
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "message": "Login realizado com sucesso.",
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "name": "Administrador",
        "email": "admin@gastromatch.com",
        "role": "ADMIN"
      }
    }
    ```
  - `401 Unauthorized`: `{ "message": "Email ou senha inválidos." }`

---

### 2.3 Obter Perfil do Usuário Autenticado
- **Método:** `GET`
- **Rota:** `/api/auth/me`
- **Acesso:** Protegido (requer Bearer Token)
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "id": 1,
      "name": "Administrador",
      "email": "admin@gastromatch.com",
      "role": "ADMIN",
      "profile": {
        "city": "São Paulo",
        "state": "SP"
      }
    }
    ```
  - `401 Unauthorized`: `{ "message": "Token não fornecido ou inválido." }`

---

### 2.4 Atualizar Perfil, Endereço & Preferências
- **Método:** `PUT`
- **Rota:** `/api/auth/profile`
- **Acesso:** Protegido (requer Bearer Token)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Chef Yasmin Lobo",
    "avatarUrl": "data:image/jpeg;base64,...",
    "phone": "(12) 99999-9999",
    "city": "Taubaté",
    "state": "SP",
    "country": "Brasil",
    "preferences": {
      "dietary": ["Vegetariano", "Sem Glúten"],
      "skillLevel": "Intermediário",
      "address": {
        "zipCode": "12000-000",
        "street": "Rua Exemplo",
        "number": "100",
        "complement": "Apto 101",
        "neighborhood": "Centro",
        "city": "Taubaté",
        "state": "SP"
      }
    },
    "currentPassword": "senhaAtual123",
    "newPassword": "novaSenha456"
  }
  ```
  *(Os campos `currentPassword` e `newPassword` são opcionais, usados apenas para alteração de senha)*
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "message": "Perfil atualizado com sucesso.",
      "user": {
        "id": 1,
        "name": "Chef Yasmin Lobo",
        "email": "yasmin@gastromatch.com",
        "role": "CHEF",
        "avatarUrl": "data:image/jpeg;base64,...",
        "profile": {
          "phone": "(12) 99999-9999",
          "city": "Taubaté",
          "state": "SP",
          "country": "Brasil",
          "preferences": { ... }
        }
      }
    }
    ```
  - `400 Bad Request`: `{ "message": "A nova senha deve ter no mínimo 6 dígitos." }`
  - `401 Unauthorized`: `{ "message": "Senha atual incorreta." }`

---

## 3. Endpoints de Receitas (`/api/recipes`)

### 3.1 Listar Receitas Publicadas
- **Método:** `GET`
- **Rota:** `/api/recipes`
- **Acesso:** Público
- **Parâmetros de Consulta (Query Params - Opcionais):**
  - `search` (string): Busca textual no título ou descrição da receita.
  - `categoryId` (number): Filtra receitas pelo ID da categoria.
  - `difficulty` (string): Filtra por `EASY`, `MEDIUM` ou `HARD`.
- **Exemplo de Requisição:** `GET /api/recipes?search=Risoto&difficulty=MEDIUM`
- **Respostas:**
  - `200 OK`: Array de receitas completas com categoria, dados do chef e ingredientes associados.

---

### 3.2 Obter Detalhes de uma Receita
- **Método:** `GET`
- **Rota:** `/api/recipes/:id`
- **Acesso:** Público
- **Parâmetros de Rota:** `id` (inteiro positivo)
- **Respostas:**
  - `200 OK`: Objeto detalhado da receita, instruções de preparo, lista de ingredientes e avaliações.
  - `404 Not Found`: `{ "message": "Receita não encontrada." }`

---

### 3.3 Listar Minhas Receitas & Kits (Portal do Chef)
- **Método:** `GET`
- **Rota:** `/api/recipes/mine`
- **Acesso:** Protegido (Requer Bearer Token de `CHEF` ou `ADMIN`)
- **Respostas:**
  - `200 OK`: Array contendo todas as receitas e kits publicados pelo chef autenticado, acompanhados de ingredientes e contagem de pedidos/avaliações.

---

### 3.4 Criar Nova Receita & Colocar Kit Físico à Venda
- **Método:** `POST`
- **Rota:** `/api/recipes`
- **Acesso:** Protegido (Requer perfil `CHEF` ou `ADMIN`)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "title": "Gnocchi ao Molho de Gorgonzola",
    "description": "Nhoque artesanal de batatas com molho cremoso de queijo gorgonzola e nozes.",
    "instructions": "1. Cozinhe as batatas no vapor...\n2. Incorpore a farinha...",
    "price": 28.50,
    "prepTime": 35,
    "servings": 2,
    "difficulty": "EASY",
    "categoryId": 1,
    "imageUrl": "https://...",
    "videoUrl": "https://youtube.com/...",
    "hasKit": true,
    "kitPrice": 42.00,
    "kitStock": 15,
    "kitDescription": "Insumos frescos selecionados e embalados a vácuo com guia impresso.",
    "ingredientsList": [
      { "name": "Batata Asterix", "quantity": "500g" },
      { "name": "Queijo Gorgonzola", "quantity": "150g" },
      { "name": "Nozes chilenas", "quantity": "50g picadas" }
    ]
  }
  ```
- **Respostas:**
  - `201 Created`: Objeto da receita criada com ingredientes vinculados.
  - `400 Bad Request`: `{ "message": "Título, descrição, instruções, preço, tempo e porções são obrigatórios." }`
  - `403 Forbidden`: Se o usuário autenticado não possuir permissão de Chef ou Admin.

---

## 4. Endpoints de Categorias (`/api/categories`)

### 4.1 Listar Todas as Categorias
- **Método:** `GET`
- **Rota:** `/api/categories`
- **Acesso:** Público
- **Respostas:**
  - `200 OK`: Array de categorias cadastradas (ex: Massas, Brasileira, Japonesa, Mexicana, Sobremesas).

---

## 5. Endpoints de Pedidos e Checkout (`/api/orders`)

### 5.1 Criar Pedido / Checkout
- **Método:** `POST`
- **Rota:** `/api/orders`
- **Acesso:** Público / Híbrido (Pode receber Bearer Token ou operar no modo convidado)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "items": [
      {
        "recipeId": 1,
        "quantity": 1,
        "price": 29.90
      }
    ],
    "paymentMethod": "PIX"
  }
  ```
  *(Valores válidos para `paymentMethod`: `"PIX"` ou `"CREDIT_CARD"`)*

- **Respostas:**
  - `201 Created`:
    ```json
    {
      "order": {
        "id": 4,
        "userId": 2,
        "total": "29.9",
        "status": "PENDING",
        "createdAt": "2026-10-14T22:44:57.604Z",
        "items": [...]
      },
      "payment": {
        "method": "PIX",
        "copyPasteCode": "00020126580014BR.GOV.BCB.PIX...",
        "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?...",
        "expiresInMinutes": 15
      }
    }
    ```
  - `400 Bad Request`: `{ "message": "O pedido precisa ter itens." }`

---

### 5.2 Confirmar Pagamento do Pedido
- **Método:** `POST`
- **Rota:** `/api/orders/:id/confirm-payment`
- **Acesso:** Público / Callback
- **Parâmetros de Rota:** `id` do pedido
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "message": "Pagamento confirmado com sucesso no banco de dados!",
      "order": {
        "id": 4,
        "status": "PAID",
        "total": "29.9"
      }
    }
    ```
  - `404 Not Found`: `{ "message": "Pedido não encontrado." }`

---

### 5.3 Listar Meus Pedidos
- **Método:** `GET`
- **Rota:** `/api/orders`
- **Acesso:** Protegido (requer Bearer Token)
- **Respostas:**
  - `200 OK`: Histórico de pedidos do usuário autenticado ordenados por data decrescente.

---

## 6. Endpoints de Avaliações e Favoritos

### 6.1 Listar Avaliações de uma Receita
- **Método:** `GET`
- **Rota:** `/api/reviews/recipe/:recipeId`
- **Acesso:** Público

### 6.2 Criar Avaliação
- **Método:** `POST`
- **Rota:** `/api/reviews/recipe/:recipeId`
- **Acesso:** Protegido (requer Bearer Token)
- **Corpo:** `{ "rating": 5, "comment": "Adorei a receita!" }`

### 6.3 Alternar Favorito (Toggle)
- **Método:** `POST`
- **Rota:** `/api/favorites/:recipeId`
- **Acesso:** Protegido (requer Bearer Token)
- **Retorno:** `{ "favorited": true }` ou `{ "favorited": false }`

---

## 7. Verificação de Saúde da Aplicação (`/api/health`)

- **Método:** `GET`
- **Rota:** `/api/health`
- **Acesso:** Público
- **Resposta:**
  ```json
  {
    "status": "ok",
    "service": "GastroMatch API",
    "timestamp": "2026-10-14T22:45:00.000Z"
  }
  ```
