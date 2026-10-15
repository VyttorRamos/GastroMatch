const test = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = process.env.API_URL || "http://localhost:3000/api";

test("GastroMatch API - Suíte de Testes Automatizados", async (t) => {
  let authToken = "";
  let createdOrderId = null;

  await t.test("1. Health Check (/api/health) deve responder 200 OK e status 'ok'", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200, "Status deve ser 200");
    const data = await res.json();
    assert.equal(data.status, "ok", "Propriedade status deve ser ok");
    assert.equal(data.service, "GastroMatch API", "Serviço deve ser GastroMatch API");
  });

  await t.test("2. Autenticação - Login com credenciais válidas (/api/auth/login)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@gastromatch.com",
        password: "123456"
      })
    });
    assert.equal(res.status, 200, "Login deve retornar status 200");
    const data = await res.json();
    assert.ok(data.token, "Deve retornar um token JWT");
    assert.equal(data.user.email, "admin@gastromatch.com", "Email retornado deve ser o admin");
    authToken = data.token;
  });

  await t.test("3. Autenticação - Rejeitar senha incorreta (/api/auth/login)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@gastromatch.com",
        password: "senha-errada-proposital"
      })
    });
    assert.equal(res.status, 401, "Senha incorreta deve retornar status 401 Unauthorized");
  });

  await t.test("4. Usuário Autenticado (/api/auth/me) usando Bearer Token", async () => {
    assert.ok(authToken, "Token JWT deve estar disponível");
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200, "Endpoint me deve retornar 200");
    const data = await res.json();
    assert.equal(data.email, "admin@gastromatch.com");
  });

  await t.test("4.1. Usuário - Atualizar Perfil e Preferências (/api/auth/profile)", async () => {
    assert.ok(authToken, "Token JWT deve estar disponível");
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        phone: "(48) 99999-1234",
        city: "Florianópolis",
        state: "SC",
        preferences: {
          dietary: ["Vegetariano", "Sem Glúten"],
          address: {
            zipCode: "88010-000",
            street: "Avenida Beira Mar Norte",
            number: "1500",
            neighborhood: "Centro"
          }
        }
      })
    });
    assert.equal(res.status, 200, "Atualização de perfil deve retornar 200");
    const data = await res.json();
    assert.ok(data.user, "Deve retornar objeto user atualizado");
    assert.equal(data.user.profile?.city, "Florianópolis");
    assert.deepEqual(data.user.profile?.preferences?.dietary, ["Vegetariano", "Sem Glúten"]);
  });

  await t.test("5. Categorias (/api/categories) deve listar categorias cadastradas", async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data), "Categorias deve ser um array");
    assert.ok(data.length >= 4, "Deve conter pelo menos 4 categorias");
  });

  await t.test("6. Receitas (/api/recipes) deve retornar catálogo populado no banco de dados", async () => {
    const res = await fetch(`${BASE_URL}/recipes`);
    assert.equal(res.status, 200);
    const recipes = await res.json();
    assert.ok(Array.isArray(recipes), "Receitas deve ser um array");
    assert.ok(recipes.length > 0, "Deve haver receitas no banco");

    const first = recipes[0];
    assert.ok(first.id, "Receita deve ter ID numérico");
    assert.ok(first.title, "Receita deve ter título");
    assert.ok(first.price, "Receita deve ter preço");
    assert.ok(first.chef, "Receita deve ter chef associado");
    assert.ok(Array.isArray(first.ingredients), "Receita deve conter lista de ingredientes");
  });

  await t.test("7. Busca de Receitas (/api/recipes?search=...) deve filtrar corretamente", async () => {
    const res = await fetch(`${BASE_URL}/recipes?search=Carbonara`);
    assert.equal(res.status, 200);
    const recipes = await res.json();
    assert.ok(recipes.length > 0, "Deve encontrar a receita pesquisada");
    assert.ok(recipes[0].title.includes("Carbonara"), "Título deve conter termo buscado");
  });

  await t.test("8. Detalhes de Receita (/api/recipes/:id)", async () => {
    const res = await fetch(`${BASE_URL}/recipes/1`);
    assert.equal(res.status, 200);
    const recipe = await res.json();
    assert.equal(recipe.id, 1);
    assert.ok(recipe.instructions, "Receita deve ter instruções");
    assert.ok(recipe.ingredients.length > 0, "Receita deve ter ingredientes vinculados");
  });

  await t.test("9. Pedidos - Criar Pedido com PIX (/api/orders)", async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        items: [{ recipeId: 1, quantity: 1, price: 29.90 }],
        paymentMethod: "PIX"
      })
    });
    assert.equal(res.status, 201, "Criação de pedido deve retornar 201 Created");
    const data = await res.json();
    assert.ok(data.order, "Deve retornar objeto do pedido");
    assert.equal(data.order.status, "PENDING", "Status inicial com PIX deve ser PENDING");
    assert.ok(data.payment.copyPasteCode, "Deve gerar código PIX Copia e Cola");
    assert.ok(data.payment.qrCodeUrl, "Deve gerar URL do QR Code PIX");
    createdOrderId = data.order.id;
  });

  await t.test("10. Pedidos - Confirmar Pagamento (/api/orders/:id/confirm-payment)", async () => {
    assert.ok(createdOrderId, "ID do pedido criado deve existir");
    const res = await fetch(`${BASE_URL}/orders/${createdOrderId}/confirm-payment`, {
      method: "POST"
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.order.status, "PAID", "Status do pedido deve ser atualizado para PAID");
  });

  await t.test("11. Chef - Publicar Receita com Kit Físico à Venda (/api/recipes)", async () => {
    // Authenticate as Chef Gabriel
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "gabriel@gastromatch.com", password: "123456" })
    });
    assert.equal(loginRes.status, 200);
    const chefAuth = await loginRes.json();
    assert.ok(chefAuth.token);

    const recipeRes = await fetch(`${BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chefAuth.token}`
      },
      body: JSON.stringify({
        title: "Pappardelle ao Ragu de Cordeiro",
        description: "Massa fresca artesanal com ragu aromático de cordeiro.",
        instructions: "1. Prepare o ragu lentamente em fogo baixo por 3 horas.",
        price: 32.00,
        prepTime: 45,
        servings: 2,
        difficulty: "MEDIUM",
        categoryId: 1,
        hasKit: true,
        kitPrice: 48.00,
        kitStock: 10,
        kitDescription: "Massa fresca e insumos embalados a vácuo para preparo imediato.",
        ingredientsList: [
          { name: "Pappardelle fresco", quantity: "300g" },
          { name: "Cordeiro desfiado", quantity: "250g" }
        ]
      })
    });

    assert.equal(recipeRes.status, 201, "Receita do chef deve ser criada com 201 Created");
    const newRecipe = await recipeRes.json();
    assert.equal(newRecipe.title, "Pappardelle ao Ragu de Cordeiro");
    assert.equal(newRecipe.hasKit, true);
    assert.equal(Number(newRecipe.kitPrice), 48.00);
    assert.ok(newRecipe.ingredients.length >= 2);
  });

  await t.test("12. Chef - Listar Minhas Receitas (/api/recipes/mine)", async () => {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "gabriel@gastromatch.com", password: "123456" })
    });
    const chefAuth = await loginRes.json();

    const mineRes = await fetch(`${BASE_URL}/recipes/mine`, {
      headers: { Authorization: `Bearer ${chefAuth.token}` }
    });
    assert.equal(mineRes.status, 200);
    const mine = await mineRes.json();
    assert.ok(Array.isArray(mine));
    assert.ok(mine.length > 0, "Chef deve ter ao menos 1 receita listada");
  });
});
